from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, DurationField, ExpressionWrapper, F, Q
from django.db.models.functions import TruncDate
from apps.tickets.models import Ticket, Category
from django.contrib.auth.models import User


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.profile.role == 'user':
            tickets = Ticket.objects.filter(created_by=user)
        else:
            tickets = Ticket.objects.all()

        stats = tickets.aggregate(
            total=Count('id'),
            open=Count('id', filter=Q(status='open')),
            in_progress=Count('id', filter=Q(status='in_progress')),
            closed=Count('id', filter=Q(status='closed')),
            avg_close_seconds=Avg(
                ExpressionWrapper(F('updated_at') - F('created_at'), output_field=DurationField()),
                filter=Q(status='closed'),
            ),
        )

        avg_close_days = None
        if stats['avg_close_seconds'] is not None:
            avg_close_days = round(stats['avg_close_seconds'].total_seconds() / 86400, 2)

        data = {
            'total': stats['total'],
            'open': stats['open'],
            'in_progress': stats['in_progress'],
            'closed': stats['closed'],
            'avg_close_days': avg_close_days,
        }
        return Response(data)


class DashboardByCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.profile.role == 'user':
            tickets = Ticket.objects.filter(created_by=user)
        else:
            tickets = Ticket.objects.all()

        rows = (
            tickets
            .values('category__name', 'category__id')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        data = [{'id': r['category__id'], 'name': r['category__name'], 'count': r['count']} for r in rows]
        return Response(data)


class DashboardByAgentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.profile.role == 'user':
            return Response([])

        rows = (
            Ticket.objects
            .exclude(assigned_to__isnull=True)
            .values('assigned_to__username')
            .annotate(count=Count('id'), resolved=Count('id', filter=Q(status='closed')))
            .order_by('-count')
        )
        data = [
            {'agent': r['assigned_to__username'], 'count': r['count'], 'resolved': r['resolved']}
            for r in rows
        ]
        return Response(data)


class DashboardTicketsTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.profile.role == 'user':
            tickets = Ticket.objects.filter(created_by=user)
        else:
            tickets = Ticket.objects.all()

        created_rows = (
            tickets
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        closed_rows = (
            tickets.filter(status='closed')
            .annotate(day=TruncDate('updated_at'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        data = {
            'created': [{'day': r['day'], 'count': r['count']} for r in created_rows],
            'closed': [{'day': r['day'], 'count': r['count']} for r in closed_rows],
        }
        return Response(data)

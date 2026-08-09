from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
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

        total = tickets.count()
        open_count = tickets.filter(status='open').count()
        in_progress = tickets.filter(status='in_progress').count()
        closed = tickets.filter(status='closed').count()

        # Tiempo promedio de cierre (dias) para tickets cerrados
        avg_close = None
        closed_tickets = tickets.filter(status='closed')
        if closed_tickets.exists():
            total_days = 0
            for t in closed_tickets:
                total_days += (t.updated_at - t.created_at).total_seconds() / 86400
            avg_close = round(total_days / closed_tickets.count(), 2)

        data = {
            'total': total,
            'open': open_count,
            'in_progress': in_progress,
            'closed': closed,
            'avg_close_days': avg_close,
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
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        data = [{'agent': r['assigned_to__username'], 'count': r['count']} for r in rows]
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

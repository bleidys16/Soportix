from .models import Notification

STATUS_LABELS = dict(
    open='Abierto',
    in_progress='En Proceso',
    closed='Cerrado',
)


def _create(recipient, ticket, notif_type, message):
    Notification.objects.create(recipient=recipient, ticket=ticket, notif_type=notif_type, message=message)


def notify_new_comment(ticket, author):
    recipients = set()
    if ticket.created_by_id != author.id:
        recipients.add(ticket.created_by)
    if ticket.assigned_to_id and ticket.assigned_to_id != author.id:
        recipients.add(ticket.assigned_to)

    message = f'{author.first_name or author.username} comentó en el ticket "{ticket.title}".'
    for recipient in recipients:
        _create(recipient, ticket, 'comment', message)


def notify_status_change(ticket, actor, old_status, new_status):
    if old_status == new_status:
        return
    label = STATUS_LABELS.get(new_status, new_status)
    message = f'El ticket "{ticket.title}" cambió a estado {label}.'
    recipients = set()
    if ticket.created_by_id != actor.id:
        recipients.add(ticket.created_by)
    if ticket.assigned_to_id and ticket.assigned_to_id != actor.id:
        recipients.add(ticket.assigned_to)
    for recipient in recipients:
        _create(recipient, ticket, 'status_change', message)


def notify_assignment(ticket, actor, old_assigned_id, new_assigned_id):
    if old_assigned_id == new_assigned_id or not new_assigned_id:
        return
    if new_assigned_id == actor.id:
        return
    message = f'Se te asignó el ticket "{ticket.title}".'
    _create(ticket.assigned_to, ticket, 'assignment', message)

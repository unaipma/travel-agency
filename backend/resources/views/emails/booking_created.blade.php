<!DOCTYPE html>
<html>
<head><style>body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }</style></head>
<body>
    <h2>¡Hola, {{ $booking->user->name }}!</h2>
    <p>Hemos recibido tu solicitud de reserva para el viaje <strong>{{ $booking->trip->title }}</strong> con destino a {{ $booking->trip->destination }}.</p>
    <p>Actualmente tu reserva está en estado: <strong style="color: #d97706;">PENDIENTE</strong>.</p>
    <p>Nuestro equipo revisará tu solicitud y te notificaremos en cuanto sea aprobada.</p>
    <br>
    <p>Detalles del viaje:</p>
    <ul>
        <li>Salida: {{ \Carbon\Carbon::parse($booking->trip->start_date)->format('d/m/Y') }}</li>
        <li>Regreso: {{ \Carbon\Carbon::parse($booking->trip->end_date)->format('d/m/Y') }}</li>
        <li>Precio: {{ $booking->trip->price }} €</li>
    </ul>
    <p>¡Gracias por confiar en triptoyou!</p>
</body>
</html>
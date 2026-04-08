<!DOCTYPE html>
<html>
<head><style>body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }</style></head>
<body>
    <h2>¡Hola, {{ $booking->user->name }}!</h2>
    <p>Hay novedades sobre tu reserva para el viaje <strong>{{ $booking->trip->title }}</strong>.</p>
    
    @if ($booking->status === 'confirmada')
        <p>¡Buenas noticias! Tu reserva ha sido <strong style="color: #16a34a;">CONFIRMADA</strong> y aprobada por nuestro equipo.</p>
        <p>Ya puedes empezar a preparar las maletas. Nos pondremos en contacto contigo pronto con más instrucciones.</p>
    @else
        <p>Lamentablemente, tu reserva ha sido <strong style="color: #dc2626;">RECHAZADA</strong>.</p>
        <p>Esto puede deberse a falta de plazas o a un problema con las fechas. Por favor, contáctanos para más información o explora otros destinos en nuestro catálogo.</p>
    @endif
    
    <p>¡Un saludo desde triptoyou!</p>
</body>
</html>
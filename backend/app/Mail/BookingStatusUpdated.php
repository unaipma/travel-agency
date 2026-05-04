<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingStatusUpdated extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking) {}

    public function envelope(): Envelope
    {
        $estado = strtoupper($this->booking->status);
        return new Envelope(
            subject: "Tu reserva ha sido {$estado} - " . $this->booking->trip->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking_status', // Ahora crearemos esta vista
        );
    }
}
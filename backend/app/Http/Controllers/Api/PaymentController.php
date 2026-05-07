<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function createCheckoutSession(Request $request, $bookingId)
    {
        // Asegurarnos de que la reserva es del usuario actual
        $booking = $request->user()->bookings()->with('trip')->findOrFail($bookingId);

        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Creamos la sesión de pago en Stripe
        $session = Session::create([
            'payment_method_types' => ['card'],
            'client_reference_id' => $booking->id,
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => 'Reserva: ' . $booking->trip->title,
                        'description' => 'Destino: ' . $booking->trip->destination,
                    ],
                    // Stripe trabaja en céntimos, así que multiplicamos por 100
                    'unit_amount' => $booking->trip->price * 100, 
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            // URLs a las que Stripe redirigirá al usuario tras pagar (o cancelar)
            'success_url' => env('FRONTEND_URL') . '/pago-completado?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => env('FRONTEND_URL') . '/trip/' . $booking->trip_id,
        ]);

        // Devolvemos la URL segura generada por Stripe
        return response()->json(['url' => $session->url]);
    }
    public function verifySession(Request $request)
    {
        $request->validate(['session_id' => 'required|string']);

        Stripe::setApiKey(env('STRIPE_SECRET'));

        try {
            // Le preguntamos a Stripe por esta sesión exacta
            $session = Session::retrieve($request->session_id);

            // Si el pago se ha completado con éxito
            if ($session->payment_status === 'paid') {
                
                // Buscamos la reserva usando el ID que le colamos a Stripe antes
                $booking = Booking::find($session->client_reference_id);
                
                if ($booking && $booking->status !== 'pendiente_confirmacion') {
                    $booking->status = 'pendiente_confirmacion';
                    $booking->save();
                    
                    // Enviar correo de "pendiente de confirmación"
                    try {
                        Log::info('Intentando enviar correo de confirmación a: ' . $booking->user->email);
                        \Illuminate\Support\Facades\Mail::to($booking->user->email)->send(new \App\Mail\BookingCreated($booking));
                        Log::info('Correo enviado con éxito');
                    } catch (\Exception $e) {
                        Log::error('Error al enviar el correo: ' . $e->getMessage());
                        // No lanzamos la excepción para que el proceso de pago no falle si solo falla el mail
                    }
                }
                
                return response()->json(['message' => 'Pago verificado, reserva pendiente de confirmación', 'status' => 'success']);
            }

            return response()->json(['message' => 'El pago no se ha completado'], 400);

        } catch (\Exception $e) {
            Log::error('Error crítico en verifySession: ' . $e->getMessage());
            return response()->json(['message' => 'Error al verificar el pago', 'error' => $e->getMessage()], 500);
        }
    }
}
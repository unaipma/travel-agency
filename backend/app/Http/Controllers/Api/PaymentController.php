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
        $booking = $request->user()->bookings()->with('trip')->findOrFail($bookingId);

        Stripe::setApiKey(env('STRIPE_SECRET'));

        $frontendUrl = rtrim($request->header('Origin') ?: env('FRONTEND_URL', 'http://localhost:4200'), '/');

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
                    'unit_amount' => $booking->trip->price * 100, 
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => $frontendUrl . '/pago-completado?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $frontendUrl . '/trip/' . $booking->trip_id,
        ]);

        return response()->json(['url' => $session->url]);
    }
    public function verifySession(Request $request)
    {
        $request->validate(['session_id' => 'required|string']);

        Stripe::setApiKey(env('STRIPE_SECRET'));

        try {
            $session = Session::retrieve($request->session_id);

            if ($session->payment_status === 'paid') {
                
                $booking = Booking::find($session->client_reference_id);
                
                if ($booking && $booking->status !== 'pendiente_confirmacion') {
                    $booking->status = 'pendiente_confirmacion';
                    $booking->save();
                    
                    try {
                        Log::info('Intentando enviar correo de confirmación a: ' . $booking->user->email);
                        \Illuminate\Support\Facades\Mail::to($booking->user->email)->send(new \App\Mail\BookingCreated($booking));
                        Log::info('Correo enviado con éxito');
                    } catch (\Exception $e) {
                        Log::error('Error al enviar el correo: ' . $e->getMessage());
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
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingStatusUpdated;


class BookingController extends Controller
{
 
    public function index()
    {
        
        $bookings = Booking::with(['user', 'trip.images'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($bookings);
    }

   
    public function show($id)
    {
        $booking = Booking::with(['user', 'trip.images'])->findOrFail($id);
        
        return response()->json($booking);
    }

 
    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

      
        $request->validate([
            'status' => ['required', 'string', Rule::in(['pendiente', 'confirmada', 'cancelada'])],
        ]);

        
        $booking->update([
            'status' => $request->status
        ]);

        return response()->json([
            'message' => 'Estado de la reserva actualizado correctamente.',
   
            'booking' => $booking->load(['user', 'trip'])
        ]);
    }
    public function updateStatus(Request $request, $id)
{
    $request->validate([
        'status' => 'required|in:pendiente,confirmada,rechazada'
    ]);

    $booking = Booking::findOrFail($id);
    $booking->status = $request->status;
    $booking->save();

    Mail::to($booking->user->email)->send(new BookingStatusUpdated($booking));

    return response()->json(['message' => 'Estado actualizado', 'data' => $booking]);
}
}
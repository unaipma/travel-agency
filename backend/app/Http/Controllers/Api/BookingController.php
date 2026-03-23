<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Http\Resources\BookingResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingCreated;

class BookingController extends Controller
{
 
    public function index(Request $request)
    {
        
        $bookings = $request->user()->bookings()->with(['trip.images'])->get();
        
        return BookingResource::collection($bookings);
    }

  
    public function store(Request $request)
    {
       
        $request->validate([
            'trip_id' => 'required|exists:trips,id'
        ]);

        $user = $request->user();

       
        $existingBooking = $user->bookings()->where('trip_id', $request->trip_id)->first();
        
        if ($existingBooking) {
            return response()->json([
                'message' => 'Ya tienes una reserva activa para este viaje.'
            ], 400);
        }

        
        $booking = $user->bookings()->create([
            'trip_id' => $request->trip_id,
            'status' => 'pendiente',
        ]);

        Mail::to($user->email)->send(new BookingCreated($booking));

        return response()->json([
            'message' => 'Reserva simulada realizada con éxito',
          
            'booking' => new BookingResource($booking->load('trip.images'))
        ], 201);
    }
}
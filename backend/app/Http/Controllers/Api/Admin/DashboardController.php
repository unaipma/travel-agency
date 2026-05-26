<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Trip;
use App\Models\Booking;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    
    public function index()
    {
        $stats = [
           
            'total_users' => User::count(),
            'total_trips' => Trip::count(),
            'total_bookings' => Booking::where('status', '!=', 'pendiente_pago')->count(),
            
           
            'pending_bookings' => Booking::where('status', 'pendiente_confirmacion')->count(),
            
        
            'recent_bookings' => Booking::with(['user:id,name,email', 'trip:id,title'])
                                        ->where('status', '!=', 'pendiente_pago')
                                        ->orderBy('created_at', 'desc')
                                        ->take(5)
                                        ->get()
        ];

        return response()->json($stats);
    }
}
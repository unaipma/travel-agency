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
            'total_bookings' => Booking::count(),
            
           
            'pending_bookings' => Booking::where('status', 'pendiente')->count(),
            
        
            'recent_bookings' => Booking::with(['user:id,name,email', 'trip:id,title'])
                                        ->orderBy('created_at', 'desc')
                                        ->take(5)
                                        ->get()
        ];

        return response()->json($stats);
    }
}
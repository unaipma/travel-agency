<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Http\Resources\TripResource;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    
    public function index(Request $request)
    {
        
        $user = $request->user();
        
       
        $favorites = $user->favorites()->with('images')->get();

       
        return TripResource::collection($favorites);
    }

 
    public function toggle(Request $request, $tripId)
    {
        $user = $request->user();

      
        $trip = Trip::findOrFail($tripId);

       
        $user->favorites()->toggle($trip->id);

        return response()->json([
            'message' => 'Lista de favoritos actualizada correctamente'
        ]);
    }
}
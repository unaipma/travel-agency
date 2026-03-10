<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Http\Resources\TripResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TripController extends Controller
{

    public function index()
    {
    
        $trips = Trip::with('images')->orderBy('created_at', 'desc')->get();
        
        return TripResource::collection($trips);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048' 
        ]);

        $trip = Trip::create($request->only([
            'title', 'destination', 'description', 'price', 'start_date', 'end_date'
        ]));

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('trips', 'public');
                
                $trip->images()->create([
                    'image_path' => url('storage/' . $path),
                    'is_primary' => $index === 0 
                ]);
            }
        }

        return response()->json([
            'message' => 'Viaje creado correctamente en el catálogo.',
            'trip' => new TripResource($trip->load('images'))
        ], 201);
    }

  
    public function show($id)
    {
        $trip = Trip::with('images')->findOrFail($id);
        
        return new TripResource($trip);
    }

  
    public function update(Request $request, $id)
    {
        $trip = Trip::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'destination' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
        ]);

        $trip->update($request->only([
            'title', 'destination', 'description', 'price', 'start_date', 'end_date'
        ]));

        return response()->json([
            'message' => 'Viaje actualizado correctamente.',
            'trip' => new TripResource($trip->load('images'))
        ]);
    }

    public function destroy($id)
    {
        $trip = Trip::with('images')->findOrFail($id);
        foreach ($trip->images as $image) {
            $path = str_replace(url('storage') . '/', '', $image->image_path);
            
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $trip->delete();

        return response()->json([
            'message' => 'Viaje y sus imágenes eliminados correctamente.'
        ]);
    }
}
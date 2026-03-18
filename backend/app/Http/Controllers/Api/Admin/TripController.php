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
    // 1. Validar los datos (incluyendo la imagen opcional)
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'destination' => 'required|string|max:255',
        'description' => 'required|string',
        'price' => 'required|numeric',
        'start_date' => 'required|date',
        'end_date' => 'required|date',
        'images' => 'nullable|array',
        'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        'cover_index' => 'nullable|integer'
    ]);

    // 2. Crear el viaje con los datos de texto
    $trip = Trip::create($request->except(['images', 'cover_index']));

    // 3. LA MAGIA DE LA IMAGEN: Comprobar si viene un archivo y guardarlo
    if ($request->hasFile('images')) {
        $coverIndex = $request->input('cover_index', 0); // Por defecto la 0 si no llega

        foreach ($request->file('images') as $index => $file) {
            $path = $file->store('trips', 'public');
            
            $trip->images()->create([
                'image_path' => url('storage/' . $path),
                'is_cover' => ($index == $coverIndex) // true si el índice coincide, false si no
            ]);
        }
    }

    return response()->json(['message' => 'Viaje creado correctamente', 'data' => $trip], 201);
}

  
    public function show($id)
    {
        $trip = Trip::with('images')->findOrFail($id);
        
        return new TripResource($trip);
    }

  
    public function update(Request $request, $id)
{
    $trip = Trip::findOrFail($id);

    $validated = $request->validate([
        'title' => 'required|string|max:255',
        // ... el resto de tus validaciones ...
        'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048'
    ]);

    $trip->update($validated);

    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('trips', 'public');

        // Opción A: Si cada viaje solo tiene 1 foto, puedes borrar las anteriores de la base de datos
        $trip->images()->delete(); 

        $trip->images()->create([
            'image_path' => url('storage/' . $path)
        ]);
    }

    return response()->json(['message' => 'Viaje actualizado correctamente', 'data' => $trip]);
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
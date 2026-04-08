<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Http\Resources\TripResource;
use Illuminate\Http\Request;
class TripController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Trip::query()->with('images');

        // Filtro por Destino
        if ($request->filled('destination') && $request->destination !== 'null') {
            $query->where('destination', 'LIKE', '%' . $request->destination . '%');
        }

        // Filtro por Fecha
        if ($request->filled('date') && $request->date !== 'null') {
            $query->where('start_date', '>=', $request->date);
        }

        // Filtro por Precio
        if ($request->filled('price') && $request->price !== 'null') {
            $query->where('price', '<=', $request->price);
        }

        // Filtro por Personas
        if ($request->filled('people') && $request->people !== 'null') {
            $query->where('max_people', '>=', $request->people);
        }

        $trips = $query->latest()->get();

        return response()->json(['data' => $trips]);
    }

    public function show($id)
    {
        $trip = Trip::with(['images', 'reviews.user'])->findOrFail($id);
        
        return new TripResource($trip);
    }

    public function addReview(Request $request, $id)
    {
        // 1. Validamos que nos envían los datos correctos
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:3'
        ]);

        $trip = Trip::findOrFail($id);
        
        // 2. Cogemos el usuario actual
        $userId = $request->user()->id;

        // 3. Buscamos si ya tiene una reseña para este viaje y la actualizamos, o creamos una nueva
        $review = $trip->reviews()->updateOrCreate(
            ['user_id' => $userId], // Condición de búsqueda
            [
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

        // 4. Cargamos los datos del usuario para devolverlos al momento
        $review->load('user');

        return response()->json([
            'message' => 'Reseña guardada exitosamente',
            'review' => [
                'id' => $review->id,
                'user_id' => $review->user_id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'user_name' => $review->user->name ?? 'Tú',
                'created_at' => $review->created_at->format('d/m/Y')
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

   
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

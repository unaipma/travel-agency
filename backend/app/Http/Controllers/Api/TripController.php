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
        $trip = Trip::with('images')->findOrFail($id);
        return new TripResource($trip);
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

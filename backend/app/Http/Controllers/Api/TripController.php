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

       
        $query = Trip::with('images');

     
        if ($request->filled('destination')) {
          
            $query->where('destination', 'ilike', '%' . $request->destination . '%');
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        
        if ($request->filled('start_date')) {
            $query->where('start_date', '>=', $request->start_date);
        }

        
        $trips = $query->get();
        
   
        return TripResource::collection($trips);
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

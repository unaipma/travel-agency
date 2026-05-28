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

        if ($request->filled('destination') && $request->destination !== 'null') {
            $query->where('destination', 'LIKE', '%' . $request->destination . '%');
        }

        if ($request->filled('start_date') && $request->start_date !== 'null') {
            $query->where('start_date', '<=', $request->start_date);
        }
        if ($request->filled('end_date') && $request->end_date !== 'null') {
            $query->where('end_date', '>=', $request->end_date);
        }

        if ($request->filled('price') && $request->price !== 'null') {
            $query->where('price', '<=', $request->price);
        }

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

    public function destinations()
    {
        $destinations = Trip::distinct()->pluck('destination');
        return response()->json($destinations);
    }

    public function addReview(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:3'
        ]);

        $trip = Trip::findOrFail($id);
        
        $userId = $request->user()->id;

        $review = $trip->reviews()->updateOrCreate(
            ['user_id' => $userId],
            [
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

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
}

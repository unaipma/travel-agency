<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'destination' => $this->destination,
            'description' => $this->description,
            'price' => $this->price,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'images' => $this->whenLoaded('images'),
            'location' => $this->location,
            'max_people' => $this->max_people,
            'reviews' => $this->reviews->map(function($review) {
        return [
            'id' => $review->id,
            'user_id' => $review->user_id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'user_name' => $review->user->name ?? 'Usuario Anónimo', // Por si acaso
            'created_at' => $review->created_at->format('d/m/Y')
        ];
    }),
        ];
    }
}
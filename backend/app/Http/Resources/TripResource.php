<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'title' => $this->title,
        'destination' => $this->destination,
        'description' => $this->description,
        'price' => (float) $this->price,
        'start_date' => $this->start_date,
        'end_date' => $this->end_date,
      
        'images' => $this->images->map(function ($image) {
            return [
                'id' => $image->id,
                'url' => $image->image_path,
                'is_primary' => (bool) $image->is_primary,
            ];
        }),
    ];
}
}

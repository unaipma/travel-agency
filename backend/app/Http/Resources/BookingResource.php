<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
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
        'status' => $this->status,
        'booking_date' => $this->booking_date,
        
        'trip' => new TripResource($this->whenLoaded('trip')),
    ];
}
}

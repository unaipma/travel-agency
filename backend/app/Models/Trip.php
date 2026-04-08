<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Trip extends Model
{
    use HasFactory;
    protected $fillable = [
        'title', 'destination', 'description', 'price', 'start_date', 'end_date', 'max_people', 'location'
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }

    public function images()
    {
        return $this->hasMany(TripImage::class);
    }
}

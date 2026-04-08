<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = ['user_id', 'trip_id', 'rating', 'comment'];

    // Una reseña pertenece a un usuario
    public function user() {
        return $this->belongsTo(User::class);
    }

    // Una reseña pertenece a un viaje
    public function trip() {
        return $this->belongsTo(Trip::class);
    }
}
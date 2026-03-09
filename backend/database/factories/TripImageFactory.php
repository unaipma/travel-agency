<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TripImage>
 */
class TripImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
{
    return [
        'image_path' => 'https://picsum.photos/seed/' . fake()->uuid() . '/800/600',
        'is_primary' => false,
    ];
}
}

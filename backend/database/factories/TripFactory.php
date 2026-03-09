<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Trip>
 */
class TripFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
{
    $startDate = fake()->dateTimeBetween('+1 week', '+2 months');
    $endDate = (clone $startDate)->modify('+' . fake()->numberBetween(3, 14) . ' days');

    return [
        'title' => 'Viaje a ' . fake()->city(),
        'destination' => fake()->country(),
        'description' => fake()->paragraph(),
        'price' => fake()->randomFloat(2, 200, 3000),
        'start_date' => $startDate->format('Y-m-d'),
        'end_date' => $endDate->format('Y-m-d'),
    ];
}
}

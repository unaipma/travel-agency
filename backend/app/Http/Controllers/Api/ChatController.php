<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Trip;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'history' => 'nullable|array'
        ]);

        $apiKey = config('services.gemini.key');
        if (!$apiKey) {
            Log::error('Gemini API Key missing in services configuration.');
            return response()->json(['error' => 'Gemini API Key not configured'], 500);
        }

        $userMessage = $request->message;
        $history = $request->history ?? [];

        // Obtener viajes para dar contexto a la IA
        $trips = Trip::all(['title', 'destination', 'price', 'start_date', 'end_date', 'max_people']);
        $tripsContext = "Actualmente tenemos estos viajes disponibles:\n";
        foreach ($trips as $trip) {
            $tripsContext .= "- {$trip->title} a {$trip->destination}. Precio: {$trip->price}€. Del {$trip->start_date} al {$trip->end_date}. Capacidad máx: {$trip->max_people} personas.\n";
        }

        $systemPrompt = "Eres un asistente virtual de la agencia de viajes 'Triptoyou'. 
        Tu objetivo es ayudar a los usuarios con dudas sobre viajes, dar recomendaciones y buscar viajes específicos en nuestro catálogo.
        Responde de forma amable, profesional y entusiasta. 
        Usa la siguiente información de viajes para responder preguntas sobre disponibilidad:\n" . $tripsContext . "\n
        Si no tenemos un viaje que encaje exactamente con las fechas, intenta recomendar el más cercano o uno al mismo destino.
        Responde siempre en español.";

        // Formatear el cuerpo para Gemini API (Google AI)
        $contents = [];
        
        foreach ($history as $chat) {
            // Asegurarse de que el historial tenga el formato correcto para Gemini
            if (isset($chat['role']) && isset($chat['text'])) {
                $contents[] = [
                    'role' => $chat['role'] === 'user' ? 'user' : 'model',
                    'parts' => [['text' => $chat['text']]]
                ];
            }
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]]
        ];

        $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]]
            ],
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 800,
            ]
        ]);

        if ($response->failed()) {
            Log::error('Gemini API Error: ' . $response->status() . ' - ' . $response->body());
            return response()->json([
                'error' => 'Error al contactar con el servicio de IA',
                'details' => $response->json()
            ], 500);
        }

        $data = $response->json();
        $aiMessage = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Lo siento, no he podido procesar tu respuesta.';

        return response()->json([
            'response' => $aiMessage
        ]);
    }
}

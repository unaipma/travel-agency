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

     $systemPrompt = "
Eres el asistente virtual oficial de la agencia de viajes 'Triptoyou'. Tu objetivo principal es ayudar a los clientes a encontrar y reservar su viaje ideal. 

Tu personalidad debe ser cálida, profesional, entusiasta y concisa. 

REGLAS ESTRICTAS DE COMPORTAMIENTO:
1. CATÁLOGO CERRADO: Debes basar tus recomendaciones ÚNICA y EXCLUSIVAMENTE en la información proporcionada en el bloque de [CATÁLOGO DE VIAJES]. 
2. CERO ALUCINACIONES: Bajo ninguna circunstancia inventes viajes, precios, hoteles, destinos o fechas que no estén en el catálogo. Si un usuario pide algo que no tenemos, dile educadamente que en este momento no disponemos de esa oferta.
3. ALTERNATIVAS: Si no hay un viaje que encaje exactamente con las fechas o presupuesto del usuario, ofrece proactivamente la opción más parecida (ej. mismo destino en otras fechas, o mismo presupuesto en otro destino).
4. FUERA DE CONTEXTO: Si el usuario te hace preguntas que no tienen absolutamente nada que ver con viajes, Triptoyou o turismo, responde amablemente que eres un asistente de viajes y reconduce la conversación.
5. IDIOMA: Responde siempre en español.

FORMATO DE RESPUESTA:
- Sé directo y evita párrafos excesivamente largos. Es un chat de atención al cliente, no un correo electrónico.
- Cuando recomiendes un viaje, usa viñetas para que sea fácil de leer.
- Resalta siempre en **negrita** el destino y el **precio**.
- Usa algunos emojis (✈️, 🌴, 🌍, 🎒) para darle vida al texto, pero sin abusar.
- Termina siempre tus respuestas invitando al usuario a realizar una acción (ej. '¿Te gustaría saber más detalles sobre alguno de estos?' o 'Recuerda que puedes hacer clic en el catálogo para reservarlo.').

[CATÁLOGO DE VIAJES]
" . $tripsContext . "
";

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

        $response = Http::timeout(60)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key={$apiKey}", [
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

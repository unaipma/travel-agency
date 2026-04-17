<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Http\Resources\TripResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TripController extends Controller
{

    public function index()
    {
    
        $trips = Trip::with('images')->orderBy('created_at', 'desc')->get();
        
        return TripResource::collection($trips);
    }

    public function store(Request $request)
{
    // 1. Validar los datos (incluyendo la imagen opcional)
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'destination' => 'required|string|max:255',
        'description' => 'required|string',
        'price' => 'required|numeric',
        'max_people' => 'required|integer|min:1',
        'start_date' => 'required|date',
        'end_date' => 'required|date',
        'images' => 'nullable|array',
        'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        'cover_index' => 'nullable|integer'
    ]);

    // 2. Crear el viaje con los datos de texto
    $trip = Trip::create($request->except(['images', 'cover_index']));

    // 3. LA MAGIA DE LA IMAGEN: Comprobar si viene un archivo y guardarlo
    if ($request->hasFile('images')) {
        $coverIndex = $request->input('cover_index', 0);

        foreach ($request->file('images') as $index => $file) {
            $base64Image = $this->convertToWebpBase64($file);
            
            $trip->images()->create([
                'image_path' => $base64Image,
                'is_primary' => ($index == $coverIndex)
            ]);
        }
    }

    return response()->json(['message' => 'Viaje creado correctamente', 'data' => $trip], 201);
}

/**
 * Convierte una imagen subida a formato WebP comprimido en Base64
 */
private function convertToWebpBase64($file)
{
    $mime = $file->getMimeType();
    $path = $file->getRealPath();

    // Crear recurso de imagen según el tipo
    if ($mime == 'image/jpeg' || $mime == 'image/jpg') {
        $image = imagecreatefromjpeg($path);
    } elseif ($mime == 'image/png') {
        $image = imagecreatefrompng($path);
        // Preservar transparencia
        imagepalettetotruecolor($image);
        imagealphablending($image, true);
        imagesavealpha($image, true);
    } elseif ($mime == 'image/webp') {
        $image = imagecreatefromwebp($path);
    } else {
        // Si no es compatible, devolvemos el base64 original sin comprimir
        return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($path));
    }

    // Usar un buffer para capturar la salida de WebP
    ob_start();
    // Calidad 75 es el estándar de oro para WebP (gran ahorro, buena calidad)
    imagewebp($image, null, 75);
    $webpData = ob_get_clean();
    
    // Liberar memoria
    imagedestroy($image);

    return 'data:image/webp;base64,' . base64_encode($webpData);
}

  
    public function show($id)
    {
        $trip = Trip::with('images')->findOrFail($id);
        
        return new TripResource($trip);
    }

  
    public function update(Request $request, $id)
{
    $trip = Trip::findOrFail($id);

    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'destination' => 'required|string|max:255',
        'description' => 'required|string',
        'price' => 'required|numeric',
        'max_people' => 'required|integer|min:1',
        'start_date' => 'required|date',
        'end_date' => 'required|date',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120'
    ]);

    $trip->update($validated);

    if ($request->hasFile('image')) {
        $file = $request->file('image');
        $base64Image = $this->convertToWebpBase64($file);

        // Opción A: Si cada viaje solo tiene 1 foto, puedes borrar las anteriores de la base de datos
        $trip->images()->delete(); 

        $trip->images()->create([
            'image_path' => $base64Image,
            'is_primary' => true
        ]);
    }

    return response()->json(['message' => 'Viaje actualizado correctamente', 'data' => $trip]);
}

    public function destroy($id)
    {
        $trip = Trip::with('images')->findOrFail($id);
        
        // No necesitamos borrar archivos del disco porque están en la DB (Base64)
        $trip->delete();

        return response()->json([
            'message' => 'Viaje y sus imágenes eliminados correctamente.'
        ]);
    }
}
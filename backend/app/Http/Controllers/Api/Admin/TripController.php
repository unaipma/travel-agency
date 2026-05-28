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
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'destination' => 'required|string|max:255',
        'location' => 'nullable|string|max:255',
        'description' => 'required|string',
        'price' => 'required|numeric',
        'max_people' => 'required|integer|min:1',
        'start_date' => 'required|date',
        'end_date' => 'required|date',
        'images' => 'nullable|array',
        'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        'cover_index' => 'nullable|integer'
    ]);

    $trip = Trip::create($request->except(['images', 'cover_index']));

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

private function convertToWebpBase64($file)
{
    $mime = $file->getMimeType();
    $path = $file->getRealPath();

    if ($mime == 'image/jpeg' || $mime == 'image/jpg') {
        $image = imagecreatefromjpeg($path);
    } elseif ($mime == 'image/png') {
        $image = imagecreatefrompng($path);
        imagepalettetotruecolor($image);
        imagealphablending($image, true);
        imagesavealpha($image, true);
    } elseif ($mime == 'image/webp') {
        $image = imagecreatefromwebp($path);
    } else {
        return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($path));
    }

    ob_start();
    imagewebp($image, null, 75);
    $webpData = ob_get_clean();
    
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
        'location' => 'nullable|string|max:255',
        'description' => 'required|string',
        'price' => 'required|numeric',
        'max_people' => 'required|integer|min:1',
        'start_date' => 'required|date',
        'end_date' => 'required|date',
        'images' => 'nullable|array',
        'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        'cover_index' => 'nullable|integer',
        'cover_image_id' => 'nullable|integer',
        'deleted_image_ids' => 'nullable|array',
        'deleted_image_ids.*' => 'integer'
    ]);

    $trip->update($request->except(['images', 'cover_index', 'cover_image_id', 'deleted_image_ids']));

    if ($request->has('deleted_image_ids')) {
        $trip->images()->whereIn('id', $request->input('deleted_image_ids'))->delete();
    }

    $newImages = [];
    if ($request->hasFile('images')) {
        $coverIndex = $request->input('cover_index', -1);

        foreach ($request->file('images') as $index => $file) {
            $base64Image = $this->convertToWebpBase64($file);
            
            $newImg = $trip->images()->create([
                'image_path' => $base64Image,
                'is_primary' => false
            ]);
            $newImages[$index] = $newImg;
        }
    }

    $remainingImages = $trip->images()->get();

    if ($remainingImages->count() > 0) {
        $trip->images()->update(['is_primary' => false]);

        $coverSet = false;

        if ($request->has('cover_image_id')) {
            $coverImageId = (int)$request->input('cover_image_id');
            $exist = $trip->images()->where('id', $coverImageId)->first();
            if ($exist) {
                $exist->update(['is_primary' => true]);
                $coverSet = true;
            }
        }

        if (!$coverSet && $request->has('cover_index')) {
            $coverIndex = (int)$request->input('cover_index');
            if (isset($newImages[$coverIndex])) {
                $newImages[$coverIndex]->update(['is_primary' => true]);
                $coverSet = true;
            }
        }

        if (!$coverSet) {
            $firstImg = $trip->images()->first();
            if ($firstImg) {
                $firstImg->update(['is_primary' => true]);
            }
        }
    }

    return response()->json(['message' => 'Viaje actualizado correctamente', 'data' => $trip->load('images')]);
}

    public function destroy($id)
    {
        $trip = Trip::with('images')->findOrFail($id);
        
        $trip->delete();

        return response()->json([
            'message' => 'Viaje y sus imágenes eliminados correctamente.'
        ]);
    }
}
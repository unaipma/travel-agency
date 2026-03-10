<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
  
    public function index()
    {
        
        $users = User::orderBy('created_at', 'desc')->get();
        
        return response()->json($users);
    }

  
    public function show($id)
    {
      
        $user = User::with(['bookings.trip', 'favorites'])->findOrFail($id);
        
        return response()->json($user);
    }

   
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
          
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
 
            'is_admin' => 'sometimes|boolean'
        ]);

        $user->update($request->only(['name', 'email', 'is_admin']));

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'user' => $user
        ]);
    }

  
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

      
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'Por seguridad, no puedes eliminar tu propia cuenta de administrador.'
            ], 403);
        }

       
        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente del sistema.'
        ]);
    }
}
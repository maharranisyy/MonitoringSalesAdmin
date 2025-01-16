<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class Authcontroller extends Controller
{
    public function register(Request $request)
    {
        return User::create([
            'name' => $request->input(key:'name'),
            'email' => $request->input(key:'email'),
            'password'=> Hash::make($request->input(key:'password'))
        ]);
    }

    public function login(Request $request)
    {
        // Validate request data
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Attempt to authenticate the user
        if (!Auth::attempt($request->only('email', 'password'))) {
            // Log failed login attempt
            \Log::warning('Login attempt failed for email: ' . $request->email);

            return response()->json(['message' => 'Invalid credentials!'], Response::HTTP_UNAUTHORIZED);
        }

        $user = Auth::user();

        // Create token for the authenticated user
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }
    

    public function user()
    {
        $user = Auth::user();
    
        if ($user) {
            // Mengembalikan data pengguna yang sedang login
            return response()->json($user, 200);
        }
    
        return response()->json([
            'message' => 'Unauthenticated.'
        ], 401);
    }

    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully!']);
    }
    
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserSales;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UserSalesController extends Controller
{
    // Get all user sales
    public function index()
    {
        return response()->json(UserSales::all(), 200); // Return all users with a 200 OK response
    }

    // Register a new user
    public function create(Request $request)
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:user_sales',
            'password' => 'required|string|min:8',
            'merk_hp' => 'required|string',
            'address' => 'required|string',
            'phone' => 'required|string|unique:user_sales', // Ensure phone is unique
            'birthdate' => 'required|date',
            'gender' => 'required|in:male,female,other', // Ensure gender is one of the valid values
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Create a new user in the user_sales table
        $user = UserSales::create([
            'kode_sales' => $this->generateKodeSales(),
            'kode_unik' => $this->generateKodeUnik(),
            'merk_hp' => $request->merk_hp,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'address' => $request->address,
            'phone' => $request->phone,
            'birthdate' => $request->birthdate,
            'gender' => $request->gender, // Accept 'male', 'female', or 'other'  // Default inactive status
            'verification_code' => Str::random(6),
        ]);

        return response()->json([
            'message' => 'User registered successfully!',
            'user' => $user,
        ], 201);
    }

    // Login user
    public function login(Request $request)
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Check if email and password match
        $user = UserSales::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Skip phone verification status check
        // if (!$user->phone_verified_at) {
        //     return response()->json(['message' => 'Phone number not verified.'], 403);
        // }

        // Create token for the user
        $token = $user->createToken('auth_token')->plainTextToken;

        // Return token and user info
        return response()->json([
            'message' => 'Login successful!',
            'token' => $token,
            'user' => $user,
        ], 200);
    }

    // Get user by ID
    public function show($id)
    {
        $user = UserSales::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user, 200);
    }

    // Update user by ID
    public function update(Request $request, $id)
    {
        $user = UserSales::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Validate input
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:user_sales,email,' . $id,
            'password' => 'sometimes|required|string|min:8',
            'merk_hp' => 'sometimes|required|string',
            'address' => 'sometimes|required|string',
            'phone' => 'sometimes|required|string|unique:user_sales,phone,' . $id, // Ensure phone is unique
            'status' => 'sometimes|in:0,1',
            'birthdate' => 'sometimes|required|date', // Add validation for birthdate
            'gender' => 'sometimes|in:male,female,other', // Gender validation
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Update user data
        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('email')) $user->email = $request->email;
        if ($request->has('password')) $user->password = Hash::make($request->password);
        if ($request->has('merk_hp')) $user->merk_hp = $request->merk_hp;
        if ($request->has('address')) $user->address = $request->address;
        if ($request->has('phone')) $user->phone = $request->phone;
        if ($request->has('status')) $user->status = $request->status;
        if ($request->has('birthdate')) $user->birthdate = $request->birthdate; // Update birthdate if provided
        if ($request->has('gender')) $user->gender = $request->gender; // Update gender if provided

        $user->save();

        return response()->json([
            'message' => 'User updated successfully!',
            'user' => $user,
        ], 200);
    }

    // Delete user by ID
    public function destroy($id)
    {
        $user = UserSales::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully!'], 200);
    }

    // Generate automatic sales code
    private function generateKodeSales()
    {
        // Get the last sales code in the database
        $lastUser = UserSales::orderBy('kode_sales', 'desc')->first();

        // If no users, start from SL000001
        if (!$lastUser) {
            return 'SL000001';
        }

        // Extract the number from the last sales code
        $lastKodeSales = $lastUser->kode_sales;
        $lastNumber = intval(substr($lastKodeSales, 2)); // Get number part after 'SL'

        // Increment the number
        $newNumber = $lastNumber + 1;

        // Generate the new sales code with leading zeros (example: SL000001)
        return 'SL' . str_pad($newNumber, 6, '0', STR_PAD_LEFT);
    }

    // Generate unique code for user
    private function generateKodeUnik()
    {
        // Combine timestamp with 4 random characters to generate a unique code
        return 'SL' . time() . Str::random(4); // Example: SL1695833450ABCD
    }
}

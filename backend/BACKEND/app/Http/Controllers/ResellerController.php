<?php

namespace App\Http\Controllers;

use App\Models\Reseller;
use Illuminate\Http\Request;

class ResellerController extends Controller
{
    public function index()
    {
        $resellers = Reseller::all();
        return response()->json($resellers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'birthdate' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'phone' => 'required|unique:resellers,phone',
            'address' => 'required',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'profile_photo' => 'nullable|string', 
            'user_sales_id' => 'required|exists:user_sales,id',
        ]);

        $lastReseller = Reseller::orderBy('id', 'desc')->first();
        $nextNumber = $lastReseller ? ((int)substr($lastReseller->kode_reseller, 2)) + 1 : 1;
        $kode_reseller = 'RS' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);

        $resellerData = $request->all();
        $resellerData['kode_reseller'] = $kode_reseller;
        $resellerData['status'] = 'unverified'; // Default to unverified

        $reseller = Reseller::create($resellerData);

        return response()->json([
            'message' => 'Reseller successfully created. Please verify to activate.',
            'reseller' => $reseller,
        ], 201);
    }

    public function show($id)
    {
        $reseller = Reseller::findOrFail($id);

        if ($reseller->status === 'unverified') {
            return response()->json([
                'message' => 'Reseller is not verified and cannot be used.',
            ], 403); // Forbidden status
        }

        return response()->json($reseller);
    }

    public function update(Request $request, $id)
    {

        // return response()->json([
        //     'data' => $request->all(),
        // ], 400);

        $reseller = Reseller::findOrFail($id);

        $request->validate([
            'name' => 'required',
            'birthdate' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'phone' => 'required|unique:resellers,phone,' . $reseller->id,
            'address' => 'required',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'profile_photo' => 'nullable|string', 
            'user_sales_id' => 'required|exists:user_sales,id',
            'status' => 'required|in:verified,unverified', // Ensure valid status
        ]);

        $reseller->update($request->all());

        return response()->json([
            'message' => 'Reseller successfully updated.',
            'reseller' => $reseller,
        ], 200);
    }

    public function destroy($id)
    {
        $reseller = Reseller::findOrFail($id);
        $reseller->delete();

        return response()->json([
            'message' => 'Reseller successfully deleted.',
        ], 200);
    }

    public function filterByStatus($status)
    {
        $resellers = Reseller::where('status', $status)->get();
        return response()->json($resellers);
    }

    // Method to update status
    public function updateStatus(Request $request, $id)
    {
        // Validate the status input
        $request->validate([
            'status' => 'required|in:verified,unverified',
        ]);

        // Find the reseller by ID
        $reseller = Reseller::findOrFail($id);

        // Update the status
        $reseller->status = $request->status;
        $reseller->save();

        return response()->json([
            'message' => 'Reseller status successfully updated.',
            'reseller' => $reseller,
        ], 200);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Reseller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $tasks = Task::where('user_sales_id', $user->id)
            ->with('reseller')
            ->get();

        return response()->json($tasks, 200);
    }

    public function store(Request $req)
    {
        $req->validate([
            'task' => 'required|string',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|in:warehouse,maintenance,reseller',
            'deadline' => 'required|date', // Tambahkan validasi untuk deadline
        ]);

        $user = auth()->user();
        $reseller = null;

        // Jika task ditugaskan ke reseller
        if ($req->assigned_to == 'reseller') {
            $req->validate(['reseller_id' => 'required|exists:resellers,id']);
            $reseller = Reseller::where('id', $req->reseller_id)
                ->where('user_sales_id', $user->id)
                ->first();

            if (!$reseller) {
                return response()->json(['message' => 'Reseller tidak ditemukan'], 404);
            }
        }

        // Buat task baru
        $task = Task::create([
            'task' => $req->task,
            'description' => $req->description,
            'user_sales_id' => $user->id,
            'assigned_to' => $req->assigned_to,
            'status' => 'pending',
            'reseller_id' => $reseller ? $reseller->id : null,
            'deadline' => $req->deadline, // Simpan deadline
        ]);

        return response()->json(['message' => 'Task berhasil ditambahkan', 'task' => $task], 201);
    }

    public function markAsCompleted(Request $req, $id)
    {
        $task = Task::with('reseller')->find($id);
    
        if (!$task || $task->user_sales_id != auth()->user()->id) {
            return response()->json(['message' => 'Task tidak ditemukan'], 404);
        }
    
        // Validasi upload foto
        $validator = Validator::make($req->all(), [
            'photo_url' => 'required|string', // Validasi URL foto
            'latitude' => 'required_with:photo_url|numeric', // Latitude wajib jika ada foto
            'longitude' => 'required_with:photo_url|numeric', // Longitude wajib jika ada foto
        ]);
    
        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }
    
        // Jika task terkait reseller, validasi radius
        if ($task->reseller) {
            $distance = $this->calculateDistance(
                $task->reseller->latitude,
                $task->reseller->longitude,
                $req->latitude,
                $req->longitude
            );
    
            if ($distance > 10) {
                return response()->json(['message' => 'Foto harus diunggah dalam radius 10 meter dari lokasi reseller'], 400);
            }
        }
    
        // Simpan waktu upload
        $uploadTime = now();
    
        // Cek apakah upload melebihi deadline
        if ($uploadTime > $task->deadline) {
            $task->status = 'late'; // Misalnya, ubah status menjadi 'late' jika upload melewati deadline
            return response()->json(['message' => 'Task diselesaikan terlambat', 'task' => $task], 400);
        }
    
        // Tandai task sebagai selesai
        $task->update([
            'status' => 'completed',
            'photo_url' => $req->photo_url,
            'upload_time' => $uploadTime, // Menyimpan waktu upload
        ]);
    
        return response()->json(['message' => 'Task selesai', 'task' => $task], 200);
    }    

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371 * 1000; // Radius bumi dalam meter

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c; // Jarak dalam meter
    }
}
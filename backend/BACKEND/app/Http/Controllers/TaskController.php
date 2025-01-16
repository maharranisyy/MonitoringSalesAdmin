<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Http\Controllers\ResellerController;
use App\Http\Controllers\UserSalesController;

class TaskController extends Controller
{
    // Tampilkan semua tugas
    public function index()
    {
        $tasks = Task::all();
        $tasks = Task::with(['reseller', 'sales'])->get();

        return response()->json($tasks, 200);
    }

    // Tambahkan tugas baru
    public function store(Request $req)
    {
        $req->validate([
            'task' => 'required|string', // Nama tugas wajib
            'description' => 'nullable|string', // Deskripsi opsional
            'reseller_id' => 'required|exists:resellers,id', // ID reseller wajib
            'user_sales_id' => 'required|exists:user_sales,id', // ID sales wajib
            'assigned_to' => 'nullable|string', // Nama yang ditugaskan
            'status' => 'required|in:pending,completed,canceled', // Status wajib
            'photo_url' => 'nullable|string', // URL foto opsional
            'deadline' => 'nullable|date', // Deadline opsional
            'upload_time' => 'nullable|date', // Waktu upload opsional
        ]);

        // Buat tugas baru
        $task = Task::create([
            'task' => $req->task,
            'description' => $req->description,
            'reseller_id' => $req->reseller_id,
            'user_sales_id' => $req->user_sales_id,
            'assigned_to' => $req->assigned_to,
            'status' => $req->status,
            'photo_url' => $req->photo_url,
            'deadline' => $req->deadline,
            'upload_time' => $req->upload_time,
        ]);

        return response()->json(['message' => 'Tugas berhasil ditambahkan', 'task' => $task], 201);
    }

    // Perbarui tugas
    public function update(Request $req, $id)
    {
        $req->validate([
            'task' => 'nullable|string',
            'description' => 'nullable|string',
            'reseller_id' => 'nullable|exists:resellers,id',
            'user_sales_id' => 'nullable|exists:users,id',
            'assigned_to' => 'nullable|string',
            'status' => 'nullable|in:pending,completed,canceled',
            'photo_url' => 'nullable|string',
            'deadline' => 'nullable|date',
            'upload_time' => 'nullable|date',
        ]);

        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'Tugas tidak ditemukan'], 404);
        }

        $task->update([
            'task' => $req->task ?? $task->task,
            'description' => $req->description ?? $task->description,
            'reseller_id' => $req->reseller_id ?? $task->reseller_id,
            'user_sales_id' => $req->user_sales_id ?? $task->user_sales_id,
            'assigned_to' => $req->assigned_to ?? $task->assigned_to,
            'status' => $req->status ?? $task->status,
            'photo_url' => $req->photo_url ?? $task->photo_url,
            'deadline' => $req->deadline ?? $task->deadline,
            'upload_time' => $req->upload_time ?? $task->upload_time,
        ]);

        return response()->json(['message' => 'Tugas berhasil diperbarui', 'task' => $task], 200);
    }

    // Hapus tugas
    public function destroy($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'Tugas tidak ditemukan'], 404);
        }

        $task->delete();

        return response()->json(['message' => 'Tugas berhasil dihapus'], 200);
    }

    // Tandai tugas sebagai selesai
    public function markAsCompleted($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'Tugas tidak ditemukan'], 404);
        }

        $task->update([
            'status' => 'completed',
        ]);

        return response()->json(['message' => 'Tugas berhasil ditandai sebagai selesai', 'task' => $task], 200);
    }
}

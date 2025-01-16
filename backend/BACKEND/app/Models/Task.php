<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'task',
        'description',
        'reseller_id',
        'user_sales_id',
        'assigned_to',
        'status',
        'photo_url',
        'deadline', // Deadline
        'upload_time', // Waktu upload foto
    ];    

    public function reseller()
    {
        return $this->belongsTo(Reseller::class);
    }

    // Relasi ke sales (user)
    public function sales()
    {
        return $this->belongsTo(UserSales::class, 'user_sales_id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reseller extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'birthdate', 'gender', 'phone', 'address', 'latitude', 'longitude', 'profile_photo', 'user_sales_id', 'status'
    ];

    // Optionally add status scope for easy filtering
    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopeUnverified($query)
    {
        return $query->where('status', 'unverified');
    }

    // Define the relationship to the UserSales model
    public function sales()
    {
        return $this->belongsTo(UserSales::class, 'user_sales_id');
    }
}

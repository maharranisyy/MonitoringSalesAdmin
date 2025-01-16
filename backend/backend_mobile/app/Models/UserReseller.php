<?php

// app/Models/Reseller.php

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

    public function user()
    {
        return $this->belongsTo(UserSales::class);
    }

    public function visits()
    {
        return $this->hasMany(Visit::class); // User memiliki banyak reseller
    }
}

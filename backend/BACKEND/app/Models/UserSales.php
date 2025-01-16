<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSales extends Model
{
    use HasFactory;

    protected $table = 'user_sales'; // Correct table name (it was 'users_sales', now 'user_sales')
    
    protected $fillable = [
        'kode_sales',
        'name',
        'email',
        'password',
        'merk_hp',
        'address',
        'phone',  // Updated field name
        'birthdate', // Updated field name
        'gender',    // Updated field name
        'kode_unik',
        'phone_verified_at',
        'verification_code', // Added verification code field
    ];
}

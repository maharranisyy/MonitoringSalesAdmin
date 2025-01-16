<?php

// Database Migration for Resellers Table

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateResellersTable extends Migration
{
    public function up()
    {
        Schema::create('resellers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('birthdate');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('phone')->unique();
            $table->string('address');
            $table->string('profile_photo')->nullable(); // Kolom foto profil
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->enum('status', ['verified', 'unverified']); // Menambahkan status
            $table->foreignId('user_sales_id')->constrained()->onDelete('cascade'); // Relasi ke user
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('resellers');
    }
}

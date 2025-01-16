<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateResellersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('resellers', function (Blueprint $table) {
            $table->id();
           $table->string('name');
            $table->date('birthdate');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('phone')->unique();
            $table->text('address');
            $table->string('profile_photo')->nullable(); // Path to profile photo
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->foreignId('user_sales_id')->constrained('user_sales')->onDelete('cascade');
            $table->enum('status', ['verified', 'unverified'])->default('unverified'); // New status field
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('resellers');
    }
}

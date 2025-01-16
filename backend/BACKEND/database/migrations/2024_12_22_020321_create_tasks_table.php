<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTasksTable extends Migration
{
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('task');
            $table->text('description')->nullable();
            $table->foreignId('reseller_id')->nullable()->constrained()->onDelete('cascade'); // Reseller can be optional
            $table->foreignId('user_sales_id')->constrained()->onDelete('cascade'); // Link to user_sales
            $table->enum('assigned_to', ['warehouse', 'maintenance', 'reseller'])->nullable(); // Role of the task assignee
            $table->enum('status', ['pending', 'completed'])->default('pending'); // Task status
            $table->string('photo_url')->nullable(); // Store photo URL or path
            $table->timestamp('deadline')->nullable(); // Deadline for the task
            $table->timestamp('upload_time')->nullable(); // Time the photo was uploaded
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tasks');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizResult extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'answers', 'top_majors'];

    protected $casts = [
        'answers'    => 'array',
        'top_majors' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

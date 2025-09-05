<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Job extends Model
{
    use HasFactory;

    protected $appends = ['file_url'];

    public function getFileUrlAttribute()
    {
        return $this->pdf_path ? Storage::url($this->pdf_path) : null;
    }

    protected $fillable = [
        'title',
        'pdf_path',
        'jd_text',
    ];

    public function analysis()
    {
        return $this->hasOne(Analysis::class);
    }

    // 1 job = many candidates
    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }

}

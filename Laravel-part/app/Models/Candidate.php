<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Candidate extends Model
{

    protected $appends = ['file_url'];

    public function getFileUrlAttribute()
    {
        return $this->pdf_path ? Storage::url($this->pdf_path) : null;
    }

    protected $fillable = ['name', 'pdf_path', 'resume_text', 'job_id'];

     public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function candidateAnalyses()
    {
        return $this->hasMany(CandidateAnalysis::class);
    }

}

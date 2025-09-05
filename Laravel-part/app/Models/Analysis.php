<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Analysis extends Model
{
    protected $fillable = [
        'job_id',
        'status',
        'model_used',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function candidateAnalyses()
    {
        return $this->hasMany(CandidateAnalysis::class);
    }
}


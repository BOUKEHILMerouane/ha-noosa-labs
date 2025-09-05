<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CandidateAnalysis extends Model
{
    protected $fillable = [
        'candidate_id',
        'analysis_id',
        'final_score',
        'score_color',
        'coverage_json',
        'subscores_json',
        'strengths',
        'weaknesses'
    ];

    public function analysis()
    {
        return $this->belongsTo(Analysis::class);
    }

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

}


<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Candidate;
use App\Models\CandidateAnalysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\PdfTextExtractor;

class CandidateController extends Controller
{
    /**
     * List all candidates for a job (with their analysis results if exist)
     */
    public function list(Job $job)
    {
        $analysis = $job->analysis;

        return $job->candidates()
            ->get()
            ->map(function ($candidate) use ($analysis) {
                $candidateAnalysis = $analysis
                    ? $candidate->candidateAnalyses()->where('analysis_id', $analysis->id)->first()
                    : null;

                return [
                    'id'          => $candidate->id,
                    'name'        => $candidate->name,
                    'resume_file' => Storage::url($candidate->pdf_path),
                    'final_score' => $candidateAnalysis->final_score ?? null,
                    'score_color' => $candidateAnalysis->score_color ?? null,
                    'strengths'   => $candidateAnalysis ? json_decode($candidateAnalysis->strengths, true) : [],
                    'weaknesses'  => $candidateAnalysis ? json_decode($candidateAnalysis->weaknesses, true) : [],
                ];
            });
    }

    /**
     * Upload a candidate resume
     */
    public function store(Request $request, Job $job, PdfTextExtractor $pdf)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'file' => 'required|mimes:pdf|max:2048',
        ]);

        $safeTitle = preg_replace('/[^A-Za-z0-9_\-]/', '_', $job->title);
        $filename = time() . '_' . $request->file('file')->getClientOriginalName();
        $path = $request->file('file')->storeAs("jobs/{$safeTitle}/candidates", $filename, 'public');
        $text = $pdf->extractText($request->file('file')->getRealPath());

        $candidate = Candidate::create([
            'name'        => $request->name,
            'pdf_path'    => $path,
            'resume_text' => $text,
            'job_id'      => $job->id,
        ]);

        return response()->json([
            'id'          => $candidate->id,
            'name'        => $candidate->name,
            'resume_file' => Storage::url($candidate->pdf_path),
        ], 201);
    }

    /**
     * Upload multiple candidate resumes
     */
    public function storeMany(Request $request, Job $job, PdfTextExtractor $pdf)
    {
        $request->validate([
            'files'   => 'required|array',
            'files.*' => 'required|mimes:pdf|max:2048',
        ]);

        $safeTitle = preg_replace('/[^A-Za-z0-9_\-]/', '_', $job->title);
        $results = [];

        foreach ($request->file('files') as $file) {
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs("jobs/{$safeTitle}/candidates", $filename, 'public');
            $text = $pdf->extractText($file->getRealPath());
            $candidateName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

            $candidate = Candidate::create([
                'name'        => $candidateName,
                'pdf_path'    => $path,
                'resume_text' => $text,
                'job_id'      => $job->id,
            ]);

            $results[] = [
                'id'          => $candidate->id,
                'name'        => $candidate->name,
                'resume_file' => Storage::url($candidate->pdf_path),
            ];
        }

        return response()->json($results, 201);
    }

    /**
     * Show candidate detail (resume + analysis result if exists)
     */
    public function show(Job $job, Candidate $candidate)
    {
        $analysis = $job->analysis;
        $candidateAnalysis = $analysis
            ? $candidate->candidateAnalyses()->where('analysis_id', $analysis->id)->first()
            : null;

        return [
            'id'          => $candidate->id,
            'name'        => $candidate->name,
            'resume_file' => Storage::url($candidate->pdf_path),
            'resume_text' => $candidate->resume_text,
            'analysis'    => $candidateAnalysis ? [
                'final_score'   => $candidateAnalysis->final_score,
                'score_color'   => $candidateAnalysis->score_color,
                'coverage_map'  => json_decode($candidateAnalysis->coverage_json, true),
                'subscores'     => json_decode($candidateAnalysis->subscores_json, true),
                'strengths'     => json_decode($candidateAnalysis->strengths, true),
                'weaknesses'    => json_decode($candidateAnalysis->weaknesses, true),
            ] : null,
        ];
    }
}

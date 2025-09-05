<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\PdfTextExtractor;

class JobController extends Controller
{
    /**
     * List all jobs with their analysis and candidate count
     */
    public function index()
    {
        return Job::withCount('candidates')
            ->with('analysis')
            ->latest()
            ->get(['id', 'title', 'pdf_path', 'created_at', 'updated_at']);
    }

    /**
     * Show a single job with analysis + candidates
     */
    public function show(Job $job)
    {
        return $job->load([
            'analysis.candidateAnalyses.candidate',
            'candidates'
        ]);
    }

    /**
     * Create a new job and attach an empty analysis
     */
    public function store(Request $request, PdfTextExtractor $pdf)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'file'  => 'required|mimes:pdf|max:2048',
        ]);

        // Clean title for folder name
        $safeTitle = preg_replace('/[^A-Za-z0-9_\-]/', '_', $request->title);

        // Store JD file
        $filename = time() . '_' . $request->file('file')->getClientOriginalName();
        $path = $request->file('file')->storeAs("jobs/{$safeTitle}/job_description", $filename, 'public');

        // Extract JD text
        $text = $pdf->extractText($request->file('file')->getRealPath());

        // Create Job
        $job = Job::create([
            'title'    => $request->title,
            'pdf_path' => $path,
            'jd_text'  => $text,
        ]);

        // Create associated Analysis (1:1)
        $job->analysis()->create([
            'status'     => 'processing',
            'model_used' => 'gemini-1.5', // default placeholder
        ]);

        return response()->json($job->load('analysis'), 201);
    }
}

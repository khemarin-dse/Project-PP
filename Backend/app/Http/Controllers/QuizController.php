<?php

namespace App\Http\Controllers;

use App\Models\QuizResult;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    private array $majors = [
        [
            'id'      => 'data-science',
            'name'    => 'Data Science',
            'icon'    => '📊',
            'weights' => [3, 5, 4, 3, 2],
        ],
        [
            'id'      => 'computer-science',
            'name'    => 'Computer Science',
            'icon'    => '💻',
            'weights' => [4, 5, 3, 3, 1],
        ],
        [
            'id'      => 'cloud-engineering',
            'name'    => 'Cloud Engineering',
            'icon'    => '☁️',
            'weights' => [3, 4, 4, 4, 2],
        ],
        [
            'id'      => 'psychology',
            'name'    => 'Psychology',
            'icon'    => '🧠',
            'weights' => [4, 1, 3, 4, 5],
        ],
        [
            'id'      => 'business',
            'name'    => 'Business Administration',
            'icon'    => '📈',
            'weights' => [3, 3, 2, 5, 4],
        ],
        [
            'id'      => 'biology',
            'name'    => 'Biology',
            'icon'    => '🔬',
            'weights' => [3, 3, 5, 3, 4],
        ],
    ];

    // ── POST /api/quiz/submit ───────────────────────────────────
    public function submit(Request $request)
    {
        $data = $request->validate([
            'answers'   => 'required|array|size:5',
            'answers.*' => 'required|integer|min:1|max:5',
        ]);

        $answers = array_values($data['answers']); // [a1, a2, a3, a4, a5]

        // Score each major
        $scores = array_map(function ($major) use ($answers) {
            $score = 0;
            foreach ($major['weights'] as $i => $w) {
                $score += ($answers[$i] ?? 0) * $w;
            }
            return [
                'id'    => $major['id'],
                'name'  => $major['name'],
                'icon'  => $major['icon'],
                'score' => $score,
            ];
        }, $this->majors);

        usort($scores, fn ($a, $b) => $b['score'] <=> $a['score']);
        $top3 = array_slice($scores, 0, 3);

        // Persist if authenticated
        $result = null;
        if ($request->user()) {
            $result = QuizResult::create([
                'user_id'    => $request->user()->id,
                'answers'    => $answers,
                'top_majors' => $top3,
            ]);
        }

        return response()->json([
            'top_majors' => $top3,
            'result_id'  => $result?->id,
        ]);
    }

    // ── GET /api/quiz/history  (auth user) ─────────────────────
    public function history(Request $request)
    {
        $results = QuizResult::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($results);
    }
}

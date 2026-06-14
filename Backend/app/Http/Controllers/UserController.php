<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // ── GET /api/users  (admin+) ────────────────────────────────
    public function index(Request $request)
    {
        $query = User::where('role', 'user');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    // ── POST /api/users  (admin+) ───────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'active'   => 'boolean',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => strtolower($data['email']),
            'password' => $data['password'],
            'role'     => 'user',
            'active'   => $data['active'] ?? true,
        ]);

        $this->log("User \"{$user->name}\" added", $request->user());

        return response()->json($user, 201);
    }

    // ── PATCH /api/users/{user}  (admin+) ───────────────────────
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'email'  => "sometimes|email|unique:users,email,{$user->id}",
            'active' => 'sometimes|boolean',
        ]);

        $user->update($data);
        $this->log("Updated user \"{$user->name}\"", $request->user());

        return response()->json($user);
    }

    // ── PATCH /api/users/{user}/toggle  (admin+) ────────────────
    public function toggleStatus(Request $request, User $user)
    {
        $user->update(['active' => ! $user->active]);
        $verb = $user->active ? 'Activated' : 'Deactivated';
        $this->log("{$verb} user \"{$user->name}\"", $request->user());

        return response()->json($user);
    }

    // ── DELETE /api/users/{user}  (admin+) ──────────────────────
    public function destroy(Request $request, User $user)
    {
        $name = $user->name;
        $user->delete();
        $this->log("Deleted user \"{$name}\"", $request->user());

        return response()->json(['message' => "User \"{$name}\" deleted."]);
    }

    // ── Helper ──────────────────────────────────────────────────
    private function log(string $action, User $admin): void
    {
        ActivityLog::create([
            'action'         => $action,
            'performed_by'   => $admin->name,
            'performed_role' => ucfirst($admin->role),
        ]);
    }
}

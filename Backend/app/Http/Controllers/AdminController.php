<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // ── GET /api/admins  (superadmin) ───────────────────────────
    public function index()
    {
        return response()->json(
            User::whereIn('role', ['admin', 'superadmin'])
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    // ── POST /api/admins  (superadmin) ──────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role'     => 'required|in:admin,superadmin',
        ]);

        $admin = User::create([
            'name'     => $data['name'],
            'email'    => strtolower($data['email']),
            'password' => $data['password'],
            'role'     => $data['role'],
            'active'   => true,
        ]);

        $roleLabel = $admin->role === 'superadmin' ? 'Super Admin' : 'Admin';
        $this->log("{$roleLabel} \"{$admin->name}\" added", $request->user());

        return response()->json($admin, 201);
    }

    // ── PATCH /api/admins/{user}  (superadmin) ──────────────────
    public function update(Request $request, User $user)
    {
        abort_if(! in_array($user->role, ['admin', 'superadmin']), 404);

        $data = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'email'  => "sometimes|email|unique:users,email,{$user->id}",
            'role'   => 'sometimes|in:admin,superadmin',
            'active' => 'sometimes|boolean',
        ]);

        $user->update($data);
        $this->log("Updated admin \"{$user->name}\"", $request->user());

        return response()->json($user);
    }

    // ── DELETE /api/admins/{user}  (superadmin) ─────────────────
    public function destroy(Request $request, User $user)
    {
        abort_if(! in_array($user->role, ['admin', 'superadmin']), 404);

        // Prevent self-delete
        abort_if($user->id === $request->user()->id, 403, 'Cannot delete yourself.');

        $name = $user->name;
        $user->delete();
        $this->log("Deleted admin \"{$name}\"", $request->user());

        return response()->json(['message' => "Admin \"{$name}\" deleted."]);
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

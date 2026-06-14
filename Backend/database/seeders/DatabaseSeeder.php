<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admins ───────────────────────────────────────────────
        $super = User::create([
            'name'     => 'Super Admin',
            'email'    => 'super@uniguide.com',
            'password' => Hash::make('super123'),
            'role'     => 'superadmin',
            'active'   => true,
        ]);

        $admin = User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@uniguide.com',
            'password' => Hash::make('admin123'),
            'role'     => 'admin',
            'active'   => true,
        ]);

        // ── Regular users ────────────────────────────────────────
        $users = [
            ['name' => 'Kong Tana',        'email' => 'tana@student.com',     'active' => true],
            ['name' => 'Phat Khemarin',    'email' => 'khemarin@student.com', 'active' => true],
            ['name' => 'Chrin Bunsopiney', 'email' => 'bun@student.com',      'active' => false],
            ['name' => 'Phan Sokunmakara', 'email' => 'soku@student.com',     'active' => true],
            ['name' => 'Sum Sopheranut',   'email' => 'soph@student.com',     'active' => false],
        ];

        foreach ($users as $u) {
            User::create([
                'name'     => $u['name'],
                'email'    => $u['email'],
                'password' => Hash::make('pass123'),
                'role'     => 'user',
                'active'   => $u['active'],
            ]);
        }

        // ── Activity logs ────────────────────────────────────────
        $logs = [
            'Promoted Timothy Green to Super Admin',
            "Changed Ashley Carter's permissions",
            'Added a new admin, Daniel Kim',
            'Deleted user Olivia Brown',
            'Password reset for Lisa Thompson',
            'Created a new admin profile for Emily White',
            'Deleted the admin profile for Sarah Jordan',
            'Added a new admin, Daniel Kim',
        ];

        foreach ($logs as $log) {
            ActivityLog::create([
                'action'         => $log,
                'performed_by'   => 'Michael Lee',
                'performed_role' => 'Super Admin',
            ]);
        }
    }
}

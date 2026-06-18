<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@junta.local',
            'password' => Hash::make('password'),
            'phone' => '214123456',
            'department' => 'Administração',
            'is_active' => true,
        ]);

        // Demo users
        $users = [
            [
                'name' => 'João Silva',
                'email' => 'joao@junta.local',
                'department' => 'Operações',
            ],
            [
                'name' => 'Maria Santos',
                'email' => 'maria@junta.local',
                'department' => 'Finanças',
            ],
            [
                'name' => 'Pedro Oliveira',
                'email' => 'pedro@junta.local',
                'department' => 'Técnico',
            ],
            [
                'name' => 'Ana Costa',
                'email' => 'ana@junta.local',
                'department' => 'Recursos Humanos',
            ],
        ];

        foreach ($users as $user) {
            User::create([
                'name' => $user['name'],
                'email' => $user['email'],
                'password' => Hash::make('password'),
                'department' => $user['department'],
                'is_active' => true,
            ]);
        }
    }
}

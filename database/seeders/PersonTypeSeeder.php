<?php

namespace Database\Seeders;

use App\Models\PersonType;
use Illuminate\Database\Seeder;

class PersonTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Munícipe',    'category' => 'externo', 'color' => '#2563eb', 'sort_order' => 1, 'is_system' => true],
            ['name' => 'Associação',  'category' => 'externo', 'color' => '#7c3aed', 'sort_order' => 2, 'is_system' => false],
            ['name' => 'Empresa',     'category' => 'externo', 'color' => '#0891b2', 'sort_order' => 3, 'is_system' => false],
            ['name' => 'Fornecedor',  'category' => 'externo', 'color' => '#d97706', 'sort_order' => 4, 'is_system' => false],
            ['name' => 'Parceiro',    'category' => 'externo', 'color' => '#059669', 'sort_order' => 5, 'is_system' => false],
            ['name' => 'Outro',       'category' => 'externo', 'color' => '#6b7280', 'sort_order' => 9, 'is_system' => false],
        ];

        foreach ($types as $type) {
            PersonType::firstOrCreate(
                ['organization_id' => 1, 'name' => $type['name']],
                array_merge($type, ['organization_id' => 1])
            );
        }
    }
}

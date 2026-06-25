<?php

use App\Models\Contact;
use App\Models\PersonType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Para utilizadores com contact_id: sincronizar users.name ← contacts.name
        DB::statement('
            UPDATE users
            SET name = contacts.name
            FROM contacts
            WHERE users.contact_id = contacts.id
        ');

        // 2. Para utilizadores sem contact_id: encontrar contact pelo email ou criar
        $orgId = DB::table('organizations')->value('id') ?? 1;

        $ptFuncionario = DB::table('person_types')
            ->where('organization_id', $orgId)
            ->where('name', 'Funcionário')
            ->value('id');

        DB::table('users')->whereNull('contact_id')->orderBy('id')->each(function ($user) use ($orgId, $ptFuncionario) {
            // Tentar encontrar contact com o mesmo email
            $contact = DB::table('contacts')
                ->where('organization_id', $orgId)
                ->where('email', $user->email)
                ->first();

            if (!$contact) {
                $contactId = DB::table('contacts')->insertGetId([
                    'organization_id' => $orgId,
                    'name'            => $user->name,
                    'email'           => $user->email,
                    'person_type_id'  => $ptFuncionario,
                    'is_active'       => true,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);
            } else {
                $contactId = $contact->id;
            }

            DB::table('users')->where('id', $user->id)->update(['contact_id' => $contactId]);
            // Sincronizar nome
            DB::table('users')->where('id', $user->id)->update([
                'name' => DB::table('contacts')->where('id', $contactId)->value('name'),
            ]);
        });
    }

    public function down(): void
    {
        // irreversível — não faz sentido desfazer a sincronização
    }
};

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateVapidKeys extends Command
{
    protected $signature   = 'vapid:generate';
    protected $description = 'Generate VAPID keys for Web Push notifications';

    public function handle(): void
    {
        // Gera par de chaves EC P-256 com openssl (sem necessidade de extensão gmp)
        $res = openssl_pkey_new([
            'curve_name'       => 'prime256v1',
            'private_key_type' => OPENSSL_KEYTYPE_EC,
        ]);

        if (!$res) {
            $this->error('Falha ao gerar chaves: ' . openssl_error_string());
            return;
        }

        $detail = openssl_pkey_get_details($res);
        if (!$detail || !isset($detail['ec'])) {
            $this->error('Não foi possível extrair detalhes EC da chave.');
            return;
        }

        // Chave pública: ponto não comprimido 04 || x || y (65 bytes)
        $pubKey = "\x04" . $detail['ec']['x'] . $detail['ec']['y'];
        // Chave privada: componente d (32 bytes)
        $privKey = $detail['ec']['d'];

        $pub  = rtrim(strtr(base64_encode($pubKey),  '+/', '-_'), '=');
        $priv = rtrim(strtr(base64_encode($privKey), '+/', '-_'), '=');

        $this->info('Chaves VAPID geradas. Adiciona às variáveis de ambiente do Railway:');
        $this->newLine();
        $this->line('VAPID_PUBLIC_KEY='  . $pub);
        $this->line('VAPID_PRIVATE_KEY=' . $priv);
        $this->newLine();
        $this->comment('A chave pública também é partilhada via Inertia (vapidPublicKey) para o frontend registar push.');
    }
}

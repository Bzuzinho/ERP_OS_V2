<?php

return [
    /*
    |--------------------------------------------------------------------------
    | VAPID Keys for Web Push
    |--------------------------------------------------------------------------
    | Generate with: php artisan vapid:generate
    | Or use: https://vapidkeys.com/
    |
    | Set in Railway environment:
    |   VAPID_PUBLIC_KEY=...
    |   VAPID_PRIVATE_KEY=...
    */
    'public_key'  => env('VAPID_PUBLIC_KEY', ''),
    'private_key' => env('VAPID_PRIVATE_KEY', ''),
    'subject'     => env('APP_URL', 'https://jf-santamaria.pt'),
];

<?php

// Suporte a DATABASE_URL (Railway injeta esta variável automaticamente)
$url = env('DATABASE_URL');
if ($url) {
    $p = parse_url($url);
    $dbHost     = $p['host']            ?? '127.0.0.1';
    $dbPort     = $p['port']            ?? 5432;
    $dbDatabase = ltrim($p['path'] ?? '', '/');
    $dbUsername = $p['user']            ?? '';
    $dbPassword = $p['pass']            ?? '';
} else {
    $dbHost     = env('DB_HOST',     '127.0.0.1');
    $dbPort     = env('DB_PORT',     '5432');
    $dbDatabase = env('DB_DATABASE', 'juntaos');
    $dbUsername = env('DB_USERNAME', '');
    $dbPassword = env('DB_PASSWORD', '');
}

return [
    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [

        'sqlite' => [
            'driver'   => 'sqlite',
            'url'      => env('DB_URL'),
            'database' => env('DB_DATABASE', database_path('juntaos.sqlite')),
            'prefix'   => '',
            'foreign_key_constraints' => true,
        ],

        'pgsql' => [
            'driver'         => 'pgsql',
            'url'            => env('DB_URL'),
            'host'           => $dbHost,
            'port'           => $dbPort,
            'database'       => $dbDatabase,
            'username'       => $dbUsername,
            'password'       => $dbPassword,
            'charset'        => 'utf8',
            'prefix'         => '',
            'prefix_indexes' => true,
            'search_path'    => 'public',
            'sslmode'        => env('DB_SSLMODE', 'prefer'),
        ],

        'mysql' => [
            'driver'         => 'mysql',
            'url'            => env('DB_URL'),
            'host'           => env('DB_HOST', '127.0.0.1'),
            'port'           => env('DB_PORT', '3306'),
            'database'       => env('DB_DATABASE', 'juntaos'),
            'username'       => env('DB_USERNAME', 'root'),
            'password'       => env('DB_PASSWORD', ''),
            'charset'        => 'utf8mb4',
            'collation'      => 'utf8mb4_unicode_ci',
            'prefix'         => '',
            'strict'         => true,
            'engine'         => null,
        ],
    ],

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),
        'default' => [
            'url'      => env('REDIS_URL'),
            'host'     => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port'     => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],
    ],
];

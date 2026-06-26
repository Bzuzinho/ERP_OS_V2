<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
    {{-- PWA --}}
    <link rel="manifest" href="/pwa-manifest">
    @php
        $pwaIcon = $org?->logo
            ? \Illuminate\Support\Facades\Storage::disk('public')->url($org->logo)
            : '/icons/icon-192.png';
    @endphp
    <link rel="apple-touch-icon" href="{{ $pwaIcon }}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="{{ $org?->name ?? 'JuntaOS' }}">
    {{-- Tema dinamico da organizacao --}}
    @php
        $org = \App\Models\Organization::find(1);

        $t = [
            'primary'        => $org?->primary_color   ?? '#4f46e5',
            'accent'         => $org?->accent_color    ?? '#7c3aed',
            'sidebar'        => $org?->sidebar_color   ?? '#0f172a',
            'header'         => $org?->header_color    ?? '#ffffff',
            'page_bg'        => $org?->page_bg_color   ?? '#f9fafb',
            'card_bg'        => $org?->card_bg_color   ?? '#ffffff',
            'heading'        => $org?->heading_color   ?? '#111827',
            'text'           => $org?->text_color      ?? '#374151',
            'menu_text'      => $org?->menu_text_color ?? '#94a3b8',
        ];

        // Gera as 10 sombras (50–900) de um hex: claras (mistura com branco) e escuras (mistura com preto)
        $shades = function(string $hex): array {
            $hex = ltrim($hex, '#');
            if (strlen($hex) === 3) $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
            [$r,$g,$b] = array_map('hexdec', str_split($hex, 2));
            $lt = fn($f) => sprintf('rgb(%d,%d,%d)', round($r+(255-$r)*$f), round($g+(255-$g)*$f), round($b+(255-$b)*$f));
            $dk = fn($f) => sprintf('rgb(%d,%d,%d)', round($r*(1-$f)), round($g*(1-$f)), round($b*(1-$f)));
            return [50=>$lt(.95),100=>$lt(.88),200=>$lt(.75),300=>$lt(.55),400=>$lt(.30),
                    500=>$lt(.10),600=>sprintf('rgb(%d,%d,%d)',$r,$g,$b),
                    700=>$dk(.15),800=>$dk(.30),900=>$dk(.45)];
        };
        $ps = $shades($t['primary']);
    @endphp
    <style>
        :root {
            /* Sombras do primary (usadas pelo Tailwind via var(--p-*)) */
            --p-50:{{ $ps[50] }};--p-100:{{ $ps[100] }};--p-200:{{ $ps[200] }};
            --p-300:{{ $ps[300] }};--p-400:{{ $ps[400] }};--p-500:{{ $ps[500] }};
            --p-600:{{ $ps[600] }};--p-700:{{ $ps[700] }};--p-800:{{ $ps[800] }};--p-900:{{ $ps[900] }};
            /* Cores de tema */
            --sidebar-bg:    {{ $t['sidebar'] }};
            --header-bg:     {{ $t['header'] }};
            --page-bg:       {{ $t['page_bg'] }};
            --card-bg:       {{ $t['card_bg'] }};
            --heading-color: {{ $t['heading'] }};
            --text-color:    {{ $t['text'] }};
            --menu-text:     {{ $t['menu_text'] }};
            --color-accent:  {{ $t['accent'] }};
        }
    </style>
    <meta name="theme-color" content="{{ $t['primary'] }}">
</head>
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error)
  })
}
</script>
<body class="antialiased">
    @inertia
</body>
</html>

// Gera chaves VAPID para Web Push — node generate-vapid.js
const { webcrypto } = require('crypto')
const { subtle } = webcrypto

;(async () => {
  const kp = await subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  )

  const pubJwk  = await subtle.exportKey('jwk', kp.publicKey)
  const privJwk = await subtle.exportKey('jwk', kp.privateKey)

  // Descodificar componentes base64url → buffer
  const dec = s => Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/') + '='.repeat((4-s.length%4)%4), 'base64')
  // Recodificar buffer → base64url
  const enc = b => b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')

  // Chave pública: ponto não-comprimido 04 || x || y
  const pubRaw = Buffer.concat([Buffer.from([0x04]), dec(pubJwk.x), dec(pubJwk.y)])
  const privRaw = dec(privJwk.d)

  console.log('\n=== VAPID Keys ===\n')
  console.log('VAPID_PUBLIC_KEY='  + enc(pubRaw))
  console.log('VAPID_PRIVATE_KEY=' + enc(privRaw))
  console.log('\nCopia estes valores para as Variables do Railway.')
})()

const { webcrypto } = require('crypto')
const { subtle } = webcrypto

;(async () => {
  const kp = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey'])
  const pubJwk  = await subtle.exportKey('jwk', kp.publicKey)
  const privJwk = await subtle.exportKey('jwk', kp.privateKey)
  const dec = s => Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/') + '='.repeat((4-s.length%4)%4), 'base64')
  const enc = b => b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')
  const pubRaw = Buffer.concat([Buffer.from([0x04]), dec(pubJwk.x), dec(pubJwk.y)])
  console.log('\nVAPID_PUBLIC_KEY='  + enc(pubRaw))
  console.log('VAPID_PRIVATE_KEY=' + enc(dec(privJwk.d)) + '\n')
})()

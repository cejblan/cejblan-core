const fs = require('fs');

const base64 = 'AGFzbQEAAAABDgNgBH9/f38Bf2AAAGACf38BfwMFBAABAgMHJwQMdmFsaWRhdGVEb21haW4AAARtYWxsb2MAAQxmcmVlAAIMbWVtb3J5AgAKQwFBACAAIAJrIQQgASADayEFIAQgBUYNAEEACw==';

fs.writeFileSync('./public/wasm/validate.wasm', Buffer.from(base64, 'base64'));
console.log('Archivo WASM guardado en /public/wasm/validate.wasm');

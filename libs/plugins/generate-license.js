const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateLicense(domain) {
  const privateKey = fs.readFileSync(path.resolve('keys/private.pem'), 'utf-8');

  const license = {
    domain,
    issuedAt: Date.now(),
    valid: true,
    forever: true,
  };

  const licenseString = JSON.stringify(license);
  const signature = crypto.sign('sha256', Buffer.from(licenseString), privateKey);

  return {
    license,
    signature: signature.toString('base64')
  };
}

module.exports = generateLicense;

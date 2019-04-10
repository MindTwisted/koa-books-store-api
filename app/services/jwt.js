const fs = require('fs');
const jwt = require('jsonwebtoken');
const privateKey = fs.readFileSync('private.key', 'utf8');
const publicKey = fs.readFileSync('public.key', 'utf8');
const options = {
    expiresIn: '1h',
    algorithm: 'RS256',
};

module.exports = {
    sign(payload) {
        return jwt.sign(payload, privateKey, options);
    },
    verify(token) {
        try {
            return jwt.verify(token, publicKey, options);
        } catch (err) {
            return false;
        }
    },
    decode(token) {
        return jwt.decode(token, {
            complete: true,
        });
    },
};

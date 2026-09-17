/**
 * URL Identifier Encryption & Obfuscation Utility
 * Encrypts sensitive database IDs (e.g. order UUIDs, internal identifiers)
 * into opaque, URL-safe tokens, preventing exposure in address bars, analytics, or links.
 */

const SECRET_SALT = 'DNS_GOLDSMITH_KEY_1960_SECURE_TOKEN';

function xorTransform(input: string, key: string): string {
    let output = '';
    for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        output += String.fromCharCode(charCode);
    }
    return output;
}

function toBase64Url(str: string): string {
    if (typeof window === 'undefined') {
        return Buffer.from(str, 'binary')
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    } else {
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
}

function fromBase64Url(base64Url: string): string {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    if (typeof window === 'undefined') {
        return Buffer.from(base64, 'base64').toString('binary');
    } else {
        return atob(base64);
    }
}

/**
 * Encrypts an order ID or database identifier into a URL-safe token.
 * Output format: enc_<random_salt>_<obfuscated_payload>
 */
export function encryptId(id: string): string {
    if (!id) return '';
    try {
        const randomSalt = Math.random().toString(36).substring(2, 8);
        const combinedKey = `${SECRET_SALT}_${randomSalt}`;
        const transformed = xorTransform(id, combinedKey);
        const encoded = toBase64Url(transformed);
        return `dns_${randomSalt}_${encoded}`;
    } catch (e) {
        console.error('Error encrypting ID:', e);
        return id;
    }
}

/**
 * Decrypts a URL token back into the original database ID.
 * Returns the decoded ID, or original token if it's already a raw ID or unencrypted.
 */
export function decryptId(token: string | null | undefined): string | null {
    if (!token) return null;
    const cleanToken = token.trim();
    
    // Check if token follows our encrypted format: dns_<salt>_<payload>
    if (!cleanToken.startsWith('dns_')) {
        return cleanToken; // Already raw ID / legacy format
    }

    try {
        const parts = cleanToken.split('_');
        if (parts.length < 3) return cleanToken;
        const salt = parts[1];
        const payload = parts.slice(2).join('_');
        const combinedKey = `${SECRET_SALT}_${salt}`;
        const binary = fromBase64Url(payload);
        const decrypted = xorTransform(binary, combinedKey);
        return decrypted || cleanToken;
    } catch (e) {
        console.warn('Could not decrypt token, falling back to raw:', e);
        return cleanToken;
    }
}

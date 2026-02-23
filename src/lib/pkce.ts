// Helper to generate a random string for code verifier
export function generateCodeVerifier(length = 64) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let verifier = '';
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        verifier += charset[randomValues[i] % charset.length];
    }
    return verifier;
}

// Helper to base64url encode an array buffer
function base64urlencode(buffer: ArrayBuffer) {
    let str = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Generate code challenge using SHA-256
export async function generateCodeChallenge(verifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return base64urlencode(hash);
}

// Generate a random state string to prevent CSRF
export function generateState(length = 32) {
    return generateCodeVerifier(length);
}

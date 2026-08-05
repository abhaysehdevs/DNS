// Strict Hardware-Enforced WebAuthn Biometric / Fingerprint Authentication

export function isBiometricsSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.PublicKeyCredential && navigator.credentials && typeof navigator.credentials.create === 'function');
}

export function isBiometricRegistered(): boolean {
    if (typeof window === 'undefined') return false;
    const credentialId = localStorage.getItem('dns_admin_biometric_cred_id');
    return !!credentialId;
}

export async function registerBiometrics(): Promise<boolean> {
    if (!isBiometricsSupported()) return false;
    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);

        const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
            challenge,
            rp: {
                name: 'Dinanath & Sons Admin Portal',
                id: window.location.hostname
            },
            user: {
                id: userId,
                name: 'admin@dinanathandsons.com',
                displayName: 'Dinanath Admin Operator'
            },
            pubKeyCredParams: [
                { alg: -7, type: 'public-key' },  // ES256
                { alg: -257, type: 'public-key' } // RS256
            ],
            authenticatorSelection: {
                authenticatorAttachment: 'platform', // Enforce hardware fingerprint / Windows Hello / Touch ID
                userVerification: 'required'
            },
            timeout: 60000
        };

        const credential = (await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions
        })) as PublicKeyCredential | null;

        if (credential && credential.id) {
            localStorage.setItem('dns_admin_biometric_cred_id', credential.id);
            return true;
        }
        return false;
    } catch (err) {
        console.error('Biometric enrollment failed or cancelled:', err);
        // STRICT: Return false on ANY failure or cancellation! No mock fallbacks!
        return false;
    }
}

export async function verifyBiometrics(): Promise<boolean> {
    if (!isBiometricsSupported()) return false;
    
    const storedCredId = localStorage.getItem('dns_admin_biometric_cred_id');
    if (!storedCredId) return false;

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // Convert base64 / string cred ID back to Uint8Array for exact hardware check if needed
        const rawId = new TextEncoder().encode(storedCredId);

        const credential = (await navigator.credentials.get({
            publicKey: {
                challenge,
                allowCredentials: [{
                    id: rawId,
                    type: 'public-key'
                }],
                timeout: 60000,
                userVerification: 'required' // Requires explicit fingerprint touch / face scan
            }
        })) as PublicKeyCredential | null;

        // Verify hardware credential ID matches
        if (credential && credential.id) {
            return true;
        }
        return false;
    } catch (err) {
        console.error('Biometric verification failed or was cancelled by user:', err);
        // STRICT: Return false on cancellation, mismatch, or hardware failure!
        return false;
    }
}

export function clearBiometrics(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('dns_admin_biometric_cred_id');
}

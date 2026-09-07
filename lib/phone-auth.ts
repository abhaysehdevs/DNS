interface PhoneOtpEntry {
    phone: string;
    otp: string;
    expiresAt: number;
    attempts: number;
}

// Global in-memory OTP cache across API requests
const globalOtpStore: Map<string, PhoneOtpEntry> = (global as any).__phoneOtpStore || new Map<string, PhoneOtpEntry>();
(global as any).__phoneOtpStore = globalOtpStore;

export function savePhoneOtp(phone: string, otp: string) {
    const cleanPhone = phone.replace(/\s+/g, '');
    globalOtpStore.set(cleanPhone, {
        phone: cleanPhone,
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
        attempts: 0
    });
}

export function verifyStoredOtp(phone: string, inputOtp: string): { valid: boolean; reason?: string } {
    const cleanPhone = phone.replace(/\s+/g, '');
    const entry = globalOtpStore.get(cleanPhone);

    if (!entry) {
        return { valid: false, reason: 'No verification code requested for this number or code expired.' };
    }

    if (Date.now() > entry.expiresAt) {
        globalOtpStore.delete(cleanPhone);
        return { valid: false, reason: 'Verification code has expired. Please request a new code.' };
    }

    if (entry.attempts >= 5) {
        globalOtpStore.delete(cleanPhone);
        return { valid: false, reason: 'Too many incorrect attempts. Please request a new code.' };
    }

    if (entry.otp === inputOtp.trim()) {
        globalOtpStore.delete(cleanPhone);
        return { valid: true };
    }

    entry.attempts += 1;
    return { valid: false, reason: 'Incorrect verification code. Please check and re-enter.' };
}

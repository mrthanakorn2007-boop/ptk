import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

// Lazy load key to ensure env vars are loaded
const getKey = () => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY is not defined');
    }
    // If key is hex string, convert to buffer
    if (key.length === 64) {
        return Buffer.from(key, 'hex');
    }
    // Otherwise assume it's raw string (must be 32 chars) or base64? 
    // For safety, let's demand Hex or Base64. 
    // Let's assume Hex for easier generation.
    return Buffer.from(key, 'hex');
};

export const encrypt = (text: string): string => {
    const key = getKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Return format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

export const decrypt = (text: string): string => {
    const key = getKey();
    const parts = text.split(':');
    if (parts.length !== 3) {
        // Fallback: maybe it's not encrypted? or legacy?
        // In strict enterprise mode, we should fail or return null, but for migration safety:
        // throw new Error('Invalid encrypted format');
        return text; // Return as-is if doesn't match format (dangerous but helpful during partial migration)
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

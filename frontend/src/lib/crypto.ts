/**
 * Cryptographic utilities for MediChain
 * Implements AES-256-GCM encryption with patient-held keys using Web Crypto API
 */

// Encryption configuration
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for AES-GCM
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

/**
 * Generate a random initialization vector
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Generate a random salt for key derivation
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Derive an AES-256 key from a passphrase using PBKDF2
 * @param passphrase The patient's passphrase
 * @param salt Salt for key derivation
 * @returns Derived CryptoKey
 */
export async function deriveKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    passphraseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-256-GCM
 * @param plaintext The data to encrypt
 * @param key The AES key (or passphrase to derive from)
 * @param usePassphrase Whether to treat key as passphrase and derive a key
 * @returns Object containing encrypted data, IV, and salt (if derived from passphrase)
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey | string,
  usePassphrase: boolean = false
): Promise<{
  ciphertext: string;
  iv: string;
  salt?: string;
}> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  let cryptoKey: CryptoKey;
  let salt: Uint8Array | undefined;

  if (usePassphrase && typeof key === 'string') {
    salt = generateSalt();
    cryptoKey = await deriveKey(key, salt);
  } else if (typeof key === 'string') {
    throw new Error('Invalid key type');
  } else {
    cryptoKey = key;
  }

  const iv = generateIV();

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    cryptoKey,
    data
  );

  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv),
    salt: salt ? bufferToBase64(salt) : undefined
  };
}

/**
 * Decrypt data using AES-256-GCM
 * @param ciphertext The encrypted data (base64)
 * @param iv The initialization vector (base64)
 * @param key The AES key (or passphrase to derive from)
 * @param salt Salt used during encryption (required if key was derived from passphrase)
 * @returns Decrypted plaintext string
 */
export async function decrypt(
  ciphertext: string,
  iv: string,
  key: CryptoKey | string,
  salt?: string
): Promise<string> {
  const decoder = new TextDecoder();
  const ciphertextBuffer = base64ToBuffer(ciphertext);
  const ivBuffer = base64ToBuffer(iv);

  let cryptoKey: CryptoKey;

  if (usePassphrase(key) && typeof key === 'string' && salt) {
    const saltBuffer = base64ToBuffer(salt);
    cryptoKey = await deriveKey(key, saltBuffer);
  } else if (typeof key === 'string') {
    throw new Error('Invalid key type');
  } else {
    cryptoKey = key;
  }

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: ivBuffer },
    cryptoKey,
    ciphertextBuffer
  );

  return decoder.decode(plaintext);
}

/**
 * Check if a value is a CryptoKey
 */
function usePassphrase(key: CryptoKey | string): boolean {
  return typeof key === 'string';
}

/**
 * Generate a new AES-256 key pair (for key exchange scenarios)
 * Note: AES is symmetric, so this generates a single key that can be exported
 */
export async function generateKeyPair(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to raw bytes for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const rawKey = await crypto.subtle.exportKey('raw', key);
  return bufferToBase64(rawKey);
}

/**
 * Import a raw key from bytes
 */
export async function importKey(keyData: string): Promise<CryptoKey> {
  const rawKey = base64ToBuffer(keyData);
  return crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random patient ID
 */
export function generatePatientId(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  return bufferToHex(randomBytes);
}

/**
 * Hash data using SHA-256
 */
export async function hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return bufferToHex(hashBuffer);
}

/**
 * Verify data integrity by comparing hashes
 */
export async function verifyHash(data: string, expectedHash: string): Promise<boolean> {
  const actualHash = await hash(data);
  return actualHash === expectedHash;
}

// Utility functions for buffer conversions
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// React hook for encryption/decryption operations
import { useState, useCallback } from 'react';

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt?: string;
}

export function useCrypto() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const encryptData = useCallback(async (
    plaintext: string,
    passphrase: string
  ): Promise<EncryptedData | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await encrypt(plaintext, passphrase, true);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const decryptData = useCallback(async (
    ciphertext: string,
    iv: string,
    passphrase: string,
    salt?: string
  ): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await decrypt(ciphertext, iv, passphrase, salt);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generateAndEncrypt = useCallback(async (
    plaintext: string
  ): Promise<{ encrypted: EncryptedData; key: string } | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Generate a random key
      const key = bufferToHex(crypto.getRandomValues(new Uint8Array(32)));
      
      // Import key for encryption
      const cryptoKey = await importKey(key);
      
      // Encrypt with the key
      const result = await encrypt(plaintext, cryptoKey);
      
      return {
        encrypted: result,
        key
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const decryptWithKey = useCallback(async (
    ciphertext: string,
    iv: string,
    key: string
  ): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const cryptoKey = await importKey(key);
      const result = await decrypt(ciphertext, iv, cryptoKey);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    error,
    encryptData,
    decryptData,
    generateAndEncrypt,
    decryptWithKey,
    generatePatientId,
    hash,
    verifyHash
  };
}

export default {
  encrypt,
  decrypt,
  deriveKey,
  generateKeyPair,
  exportKey,
  importKey,
  generatePatientId,
  hash,
  verifyHash,
  useCrypto
};

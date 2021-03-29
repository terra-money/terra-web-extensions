import CryptoJS from 'crypto-js';

export interface Crypto {
  encrypt: (message: string, password: string) => string;
  decrypt: (transitMessage: string, password: string) => string;
}

export function createCryptoVersion1(): Crypto {
  const keySize = 256;
  const iterations = 100;

  function encrypt(message: string, password: string): string {
    try {
      const salt = CryptoJS.lib.WordArray.random(128 / 8);

      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: keySize / 32,
        iterations: iterations,
      });

      const iv = CryptoJS.lib.WordArray.random(128 / 8);

      const encrypted = CryptoJS.AES.encrypt(message, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      });

      const transitmessage =
        salt.toString() + iv.toString() + encrypted.toString();
      return transitmessage;
    } catch (error) {
      return '';
    }
  }

  function decrypt(transitmessage: string, password: string): string {
    try {
      const salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
      const iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32));
      const encrypted = transitmessage.substring(64);

      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: keySize / 32,
        iterations: iterations,
      });

      const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      }).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      return '';
    }
  }

  return {
    encrypt,
    decrypt,
  };
}

export const { encrypt, decrypt } = createCryptoVersion1();

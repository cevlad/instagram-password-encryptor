import crypto from "crypto";
import nacl from "tweetnacl";
import { blake2bFinal, blake2bInit, blake2bUpdate } from "blakejs";

export interface InstagramPasswordEncryptorOptions {
  keyId: number;
  publicKey: string;
  version?: number;
}

export class InstagramPasswordEncryptor {
  public keyId: number;
  public publicKey: string;
  public version: number;

  constructor({ keyId, publicKey, version = 10 }: InstagramPasswordEncryptorOptions) {
    this.keyId = keyId;
    this.publicKey = publicKey;
    this.version = version;
  }

  public encrypt(password: string): string {
    const { keyId, publicKey, version } = this;

    if (!keyId || !publicKey) {
      throw new Error("Encryption Failure: failed to retrieve keyId and/or publicKey");
    }

    if (publicKey.length !== 64) {
      throw new Error("Encryption Failure: public key is not a valid hex string");
    }

    const publicKeyBuffer = InstagramPasswordEncryptor.hexToByte(publicKey);
    const timestamp = InstagramPasswordEncryptor.getTimestamp();
    const timestampBuffer = InstagramPasswordEncryptor.utf8ToByte(timestamp);
    const passwordBuffer = InstagramPasswordEncryptor.utf8ToByte(password);
    const encryptedPasswordLength = InstagramPasswordEncryptor.getPasswordOverheadLength(
      passwordBuffer
    );
    const encryptedPasswordBuffer = new Uint8Array(encryptedPasswordLength);

    let encryptedPasswordBufferOffset = 0;
    encryptedPasswordBuffer[encryptedPasswordBufferOffset] = 1;
    encryptedPasswordBufferOffset++;
    encryptedPasswordBuffer[encryptedPasswordBufferOffset] = keyId;
    encryptedPasswordBufferOffset++;

    const { key: aesKey, ciphertext: aesCiphertext } = InstagramPasswordEncryptor.aesEncrypt(
      passwordBuffer,
      timestampBuffer
    );

    const seal = InstagramPasswordEncryptor.seal(aesKey, publicKeyBuffer);

    encryptedPasswordBuffer[encryptedPasswordBufferOffset] = 255 & seal.length;
    encryptedPasswordBufferOffset++;
    encryptedPasswordBuffer[encryptedPasswordBufferOffset] = (seal.length >> 8) & 255;
    encryptedPasswordBufferOffset++;
    encryptedPasswordBuffer.set(seal, encryptedPasswordBufferOffset);
    encryptedPasswordBufferOffset += seal.length;

    if (seal.length !== InstagramPasswordEncryptor.getOverheadLength() + 32) {
      throw new Error("Encryption Failure: encrypted key is the wrong length");
    }

    const aesCipherOffset = 16;
    const aesCiphertextStart = aesCiphertext.slice(0, -aesCipherOffset);
    const aesCiphertextEnd = aesCiphertext.slice(-aesCipherOffset);

    encryptedPasswordBuffer.set(aesCiphertextEnd, encryptedPasswordBufferOffset);
    encryptedPasswordBufferOffset += aesCipherOffset;
    encryptedPasswordBuffer.set(aesCiphertextStart, encryptedPasswordBufferOffset);

    return InstagramPasswordEncryptor.format(
      InstagramPasswordEncryptor.byteToBase64(encryptedPasswordBuffer),
      timestamp,
      version
    );
  }

  private static getPasswordOverheadLength(password: Uint8Array): number {
    return 36 + InstagramPasswordEncryptor.getOverheadLength() + 16 + password.length;
  }

  private static aesEncrypt(
    data: Uint8Array,
    aad: Uint8Array
  ): { key: Uint8Array; ciphertext: Uint8Array } {
    const key = crypto.randomBytes(32);
    const iv = Buffer.alloc(12, 0);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    cipher.setAAD(aad);

    const ciphertext = Buffer.concat([cipher.update(data), cipher.final(), cipher.getAuthTag()]);

    return {
      key: new Uint8Array(key),
      ciphertext: new Uint8Array(ciphertext),
    };
  }

  private static seal(aesKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
    const sealLength = InstagramPasswordEncryptor.getOverheadLength() + aesKey.length;
    const seal = new Uint8Array(sealLength);
    const boxKeyPair = nacl.box.keyPair();

    seal.set(boxKeyPair.publicKey);

    const blake2bHash = InstagramPasswordEncryptor.getBlake2bHash(boxKeyPair.publicKey, publicKey);
    const box = nacl.box(aesKey, blake2bHash, publicKey, boxKeyPair.secretKey);

    seal.set(box, boxKeyPair.publicKey.length);
    InstagramPasswordEncryptor.zero(boxKeyPair.secretKey);

    return seal;
  }

  private static getOverheadLength(): number {
    return nacl.box.publicKeyLength + nacl.box.overheadLength;
  }

  private static zero(array: Uint8Array): void {
    for (let i = 0; i < array.length; i++) {
      array[i] = 0;
    }
  }

  private static getBlake2bHash(publicKey1: Uint8Array, publicKey2: Uint8Array): Uint8Array {
    const blake2bContext = blake2bInit(nacl.box.nonceLength);

    blake2bUpdate(blake2bContext, publicKey1);
    blake2bUpdate(blake2bContext, publicKey2);

    return blake2bFinal(blake2bContext);
  }

  private static getTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  private static utf8ToByte(data: string): Uint8Array {
    const asciiData = unescape(encodeURIComponent(data));
    const byteData = new Uint8Array(asciiData.length);

    for (let i = 0; i < asciiData.length; i++) {
      byteData[i] = asciiData.charCodeAt(i);
    }

    return byteData;
  }

  private static hexToByte(data: string): Uint8Array {
    return new Uint8Array(Buffer.from(data, "hex"));
  }

  private static byteToBase64(data: Uint8Array): string {
    return Buffer.from(data).toString("base64");
  }

  private static format(data: string, time: string | number, version: string | number): string {
    return `#PWD_INSTAGRAM_BROWSER:${version}:${time}:${data}`;
  }
}

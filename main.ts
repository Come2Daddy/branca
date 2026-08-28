import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { randomBytes } from "@noble/ciphers/utils.js";
import { Packer, Unpacker } from "@sck/bitpacker";
import BaseCodec from "./base.ts";

/**
 * Internal header structure for a Branca token.
 */
interface Header {
  /** Protocol version identifier. Currently `0xBA`. */
  version: number;
  /** Unsigned 32-bit Unix timestamp in seconds. */
  timestamp: number;
  /** Cryptographically random 24-byte nonce. */
  nonce: Uint8Array;
}

/**
 * Branca token encoder/decoder using XChaCha20-Poly1305 AEAD encryption.
 *
 * Branca produces compact, authenticated, and encrypted tokens suitable for
 * secure API communication, session management, or as a JWT alternative.
 *
 * @example
 * ```ts
 * import Branca from "./main.ts";
 *
 * const branca = new Branca("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");
 * const token = branca.encode(JSON.stringify({ user: "alice" }));
 * const payload = branca.decode(token, 3600); // 1-hour TTL
 * ```
 */
class Branca {
  /** Protocol version magic byte. All valid Branca tokens start with `0xBA`. */
  static readonly VERSION = 0xba;

  /** Base62 character alphabet used for token encoding. */
  static readonly BASE =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  /** Expected nonce length in bytes (24 bytes for XChaCha20). */
  static readonly NONCE_LENGTH = 24;

  /** Total header size in bytes (1 version + 4 timestamp + 24 nonce). */
  static readonly HEADER_LENGTH = 29;

  /** Override nonce for testing purposes. Set to `null` (default) for automatic generation. */
  nonce: Uint8Array | null;

  private key: Uint8Array;

  private base: BaseCodec;

  /**
   * Create a new Branca instance with the given secret key.
   *
   * @param key - A 32-byte secret key provided as a lowercase hex string (64 characters).
   * @throws {Error} If the key length isn't a string or doesn't match the required bytes length.
   */
  constructor(key: string) {
    if ("string" !== typeof key) throw new Error("Key must be a string");
    if (key.length != xchacha20poly1305.blockSize)
      throw new Error(
        `Invalid key - Expected length is ${xchacha20poly1305.blockSize}`,
      );

    this.key = Uint8Array.fromHex(key);

    this.base = new BaseCodec(Branca.BASE);

    this.nonce = null;
  }

  /**
   * Encrypt a payload and return a Branca token string.
   *
   * The token includes a timestamp (defaults to current time), a random nonce,
   * and the encrypted payload authenticated with XChaCha20-Poly1305 AEAD.
   *
   * @param payload - The data to encrypt. Accepts a string or raw bytes.
   * @param timestamp - Optional One of
   *                      * Unix timestamp in seconds. Defaults to current time.
   *                        Must be between 0 and 4294967295.
   *                      * Date instance
   * @returns A base62-encoded Branca token string.
   * @throws {Error} If
   *                    * the payload is not a string nor raw bytes
   *                    * the timestamp is neither a number nor a Date instance nor undefined
   *                    * the timestamp is out of valid range.
   */
  encode(payload: string | Uint8Array, timestamp?: number | Date): string {
    if ("string" !== typeof payload && !(payload instanceof Uint8Array))
      throw new Error("Payload must be a string");
    if (
      undefined !== timestamp &&
      "number" !== typeof timestamp &&
      !(timestamp instanceof Date)
    )
      throw new Error("Timestamp must be a number or a Date instance");
    const nonce = this.nonce || randomBytes(Branca.NONCE_LENGTH);

    const tokenTimestamp =
      (timestamp instanceof Date
        ? Math.floor(timestamp.getTime() / 1000)
        : timestamp) ?? Math.floor(Date.now() / 1000);

    if (tokenTimestamp < 0 || tokenTimestamp > 0xffffffff)
      throw new Error("Invalid timestamp");

    const packedHeader = this.pack({
      version: Branca.VERSION,
      timestamp: tokenTimestamp,
      nonce,
    });

    const bytes =
      "string" === typeof payload ? new TextEncoder().encode(payload) : payload;
    const cipher = xchacha20poly1305(this.key, nonce, packedHeader);
    const cipherText = cipher.encrypt(Uint8Array.from(bytes));

    const buffer = new Uint8Array(packedHeader.length + cipherText.length);
    buffer.set(packedHeader);
    buffer.set(cipherText, packedHeader.length);

    return this.base.encode(buffer);
  }

  /**
   * Verify and decrypt a Branca token, returning the original payload.
   *
   * Optionally validates the token's age against a TTL. Expiration checks
   * occur after successful decryption to prevent timing side-channels.
   *
   * @param token - The base62-encoded Branca token to decode.
   * @param ttl - Optional maximum token age in seconds. Omit to skip expiration checks.
   * @returns The decrypted payload as a UTF-8 string.
   * @throws {Error} If
   *                    * the token isn't a string
   *                    * the TTL isn't a number nor undefined
   *                    * the token version is invalid, TTL check fails, or decryption fails.
   */
  decode(token: string, ttl?: number): string {
    if ("string" !== typeof token) throw new Error("Token must be a string");
    if (undefined !== ttl && "number" !== typeof ttl)
      throw new Error("TTL must be a number");

    const buffer = this.base.decode(token);
    const header = buffer.slice(0, Branca.HEADER_LENGTH);
    const cipherText = buffer.slice(Branca.HEADER_LENGTH);
    const { version, timestamp, nonce } = this.unpack(header);

    if (version != Branca.VERSION) throw new Error("Invalid version");

    if (undefined !== ttl && Math.abs(ttl) > 0xffffffff - timestamp)
      throw new Error("TTL is to big");

    if (
      undefined !== ttl &&
      timestamp + Math.abs(ttl) < Math.round(Date.now() / 1000)
    )
      throw new Error("Token has expired");

    const cipher = xchacha20poly1305(this.key, nonce, header);

    const payload = cipher.decrypt(cipherText);

    return new TextDecoder().decode(payload);
  }

  /**
   * Extract the embedded timestamp from a token without decrypting it.
   *
   * Useful for inspecting token age or sorting tokens by creation time
   * without performing full decryption.
   *
   * @param token - The base62-encoded Branca token to inspect.
   * @returns The Unix timestamp (seconds) stored in the token header.
   *
   * @throws {Error} If
   *                    * the token isn't a string
   *                    * the token is an empty string
   */
  timestamp(token: string): number {
    if ("string" !== typeof token) throw new Error("Token must be a string");
    if (token.trim().length === 0)
      throw new Error("Token must not be an empty string");

    const binary = this.base.decode(token);
    const header = binary.slice(0, Branca.HEADER_LENGTH);
    const { timestamp } = this.unpack(header);

    return timestamp;
  }

  /**
   * Serialize a header object into its binary representation.
   *
   * @param header - The header containing version, timestamp, and nonce.
   * @returns A 29-byte Uint8Array representing the packed header.
   */
  private pack(header: Header): Uint8Array {
    const packer = new Packer();

    packer.putUint8(header.version);
    packer.putUint32(header.timestamp);
    packer.putBytes(header.nonce);

    return packer.getBuffer();
  }

  /**
   * Deserialize a binary header back into a Header object.
   *
   * @param pack - A 29-byte Uint8Array containing the packed header.
   * @returns The parsed Header with version, timestamp, and nonce.
   */
  private unpack(pack: Uint8Array): Header {
    const unpacker = new Unpacker(pack);

    const version = unpacker.readUint8();
    const timestamp = unpacker.readUint32();
    const nonce = unpacker.readBytes(Branca.NONCE_LENGTH);

    return { version, timestamp, nonce: Uint8Array.from(nonce) };
  }
}

export default Branca;

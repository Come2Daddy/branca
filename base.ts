/**
 * Generic base-N codec for encoding and decoding binary data using a custom character set.
 *
 * Supports any radix between 2 and 254 unique characters. Useful for base62, base58,
 * or any custom alphabet encoding scheme. Leading 0x00 are kept in the encoded output.
 *
 * @example
 * ```ts
 * const codec = new BaseCodec("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
 * const encoded = codec.encode(new Uint8Array([0xba, 0x00, 0x01]));
 * const decoded = codec.decode(encoded);
 * ```
 */
class BaseCodec {
  private baseMap: string;

  private radix: number = 0;

  private lookup: Map<string, number>;

  /**
   * Create a new BaseCodec with the given character alphabet.
   *
   * @param dictionary - String of unique characters defining the encoding alphabet.
   *                     Must contain between 2 and 254 unique characters.
   * @throws {TypeError} If the dictionary has fewer than 2 or more than 254 unique characters.
   */
  constructor(dictionnary: string) {
    const uniqueDictionnary = new Set(dictionnary);
    if (uniqueDictionnary.size < 2)
      throw new TypeError("Dictionnary is too short: 2-254 unique characters");
    if (uniqueDictionnary.size > 254)
      throw new TypeError("Dictionnary is too long: 2-254 unique characters");

    this.baseMap = [...uniqueDictionnary].join("");

    this.lookup = [...uniqueDictionnary].reduce(
      (accu: Map<string, number>, char, index) => {
        accu.set(char, index);
        return accu;
      },
      new Map(),
    );

    this.radix = uniqueDictionnary.size;
  }

  /**
   * Encode a binary payload into a string using the configured alphabet.
   *
   * @param data - The binary data to encode.
   * @returns The encoded string, or an empty string if input is empty.
   */
  encode(data: Uint8Array): string {
    if (!data || data.length === 0) return "";

    const zeroChar = this.baseMap[0];

    let leadingZeros = 0;
    while (leadingZeros < data.length && data[leadingZeros] === 0) {
      leadingZeros++;
    }

    if (leadingZeros === data.length) {
      return zeroChar.repeat(leadingZeros);
    }

    const significantData = data.slice(leadingZeros);
    const result: string[] = [];
    let buffer = new Uint8Array(significantData);

    while (buffer.length > 0) {
      let remainder = 0;
      const nextBuffer: number[] = [];

      for (let i = 0; i < buffer.length; i++) {
        const currentVal = buffer[i] + remainder * 256;
        const quotient = Math.floor(currentVal / this.radix);
        remainder = currentVal % this.radix;

        if (quotient !== 0 || nextBuffer.length > 0) {
          nextBuffer.push(quotient);
        }
      }

      result.push(this.baseMap[remainder]);
      buffer = new Uint8Array(nextBuffer);
    }

    const encodedSignificantPart = result.reverse().join("");

    return zeroChar.repeat(leadingZeros) + encodedSignificantPart;
  }

  /**
   * Decode an encoded string back into its original binary representation.
   *
   * @param encoded - The string to decode.
   * @returns The decoded binary data as a Uint8Array.
   * @throws {Error} If the encoded string contains characters not in the alphabet.
   */
  decode(encoded: string): Uint8Array<ArrayBuffer> {
    if (!encoded || encoded.length === 0) return new Uint8Array(0);

    // 1. Décodage mathématique de la valeur (Base N -> Base 256)
    let buffer = [0]; // Grand nombre initialisé à 0

    const leadingZerosRE = new RegExp(`^(${this.baseMap[0]}*)`);
    const leadingZeros = (encoded.match(leadingZerosRE) || [])[1].length;

    for (const char of encoded.slice(leadingZeros)) {
      if (!this.lookup.has(char)) {
        throw new Error(`Invalide character "${char}" in the encoded string.`);
      }

      const digit = this.lookup.get(char)!;
      let carry = digit;
      const tempBuffer: number[] = [];

      for (let i = 0; i < buffer.length; i++) {
        const val = buffer[i] * this.radix + carry;
        tempBuffer.push(val % 256);
        carry = Math.floor(val / 256);
      }

      while (carry > 0) {
        tempBuffer.push(carry % 256);
        carry = Math.floor(carry / 256);
      }

      buffer = tempBuffer;
    }

    const decodedBytes = new Uint8Array(
      buffer.concat(Array.from({ length: leadingZeros }, () => 0)).reverse(),
    );

    return decodedBytes;
  }
}

export default BaseCodec;

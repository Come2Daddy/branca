import { expect } from "@std/expect";
import { assertThrows } from "@std/assert";
import Branca, { type Success, type Failure } from "./main.ts";

class BrancaTest extends Branca {
  constructor(key: string) {
    super(key);
  }

  setNonce(nonce: Uint8Array | null): void {
    this.nonce = nonce;
  }
}

const commonBranca = new Branca(
  "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
);

const testVectors = {
  version: "0.3.0",
  numberOfTests: 25,
  testGroups: [
    {
      testType: "encoding",
      tests: [
        {
          id: 0,
          comment: "Hello world with zero timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: "beefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          timestamp: 0,
          token:
            "870S4BYxgHw0KnP3W9fgVUHEhT5g86vJ17etaC5Kh5uIraWHCI1psNQGv298ZmjPwoYbjDQ9chy2z",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 1,
          comment: "Hello world with max timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: "beefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          timestamp: 4294967295,
          token:
            "89i7YCwu5tWAJNHUDdmIqhzOi5hVHOd4afjZcGMcVmM4enl4yeLiDyYv41eMkNmTX6IwYEFErCSqr",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 2,
          comment: "Hello world with November 27 timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: "beefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          timestamp: 123206400,
          token:
            "875GH23U0Dr6nHFA63DhOyd9LkYudBkX8RsCTOMz5xoYAMw9sMd5QwcEqLDRnTDHPenOX7nP2trlT",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 3,
          comment: "Eight null bytes with zero timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: "beefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          timestamp: 0,
          token:
            "1jIBheHbDdkCDFQmtgw4RUZeQoOJgGwTFJSpwOAk3XYpJJr52DEpILLmmwYl4tjdSbbNqcF1",
          msg: "0000000000000000",
          message: "\x00\x00\x00\x00\x00\x00\x00\x00",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 4,
          comment: "Eight null bytes with max timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: "beefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          timestamp: 4294967295,
          token:
            "1jrx6DUu5q06oxykef2e2ZMyTcDRTQot9ZnwgifUtzAphGtjsxfbxXNhQyBEOGtpbkBgvIQx",
          msg: "0000000000000000",
          message: "\x00\x00\x00\x00\x00\x00\x00\x00",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 5,
          comment: "Eight null bytes with November 27th timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: "beefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          timestamp: 123206400,
          token:
            "1jJDJOEjuwVb9Csz1Ypw1KBWSkr0YDpeBeJN6NzJWx1VgPLmcBhu2SbkpQ9JjZ3nfUf7Aytp",
          msg: "0000000000000000",
          message: "\x00\x00\x00\x00\x00\x00\x00\x00",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 6,
          comment: "Empty payload",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: "beefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          timestamp: 0,
          token:
            "4sfD0vPFhIif8cy4nB3BQkHeJqkOkDvinI4zIhMjYX4YXZU5WIq9ycCVjGzB5",
          msg: "",
          message: "",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 7,
          comment: "Non-UTF8 payload",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: "beefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          timestamp: 123206400,
          token:
            "K9u6d0zjXp8RXNUGDyXAsB9AtPo60CD3xxQ2ulL8aQoTzXbvockRff0y1eXoHm",
          msg: "80",
          message: Uint8Array.fromHex("80"),
          isValid: true,
          constructorThrows: false,
        },
      ],
    },
    {
      testType: "decoding",
      tests: [
        {
          id: 8,
          comment: "Hello world with zero timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 0,
          token:
            "870S4BYxgHw0KnP3W9fgVUHEhT5g86vJ17etaC5Kh5uIraWHCI1psNQGv298ZmjPwoYbjDQ9chy2z",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 9,
          comment: "Hello world with max timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 4294967295,
          token:
            "89i7YCwu5tWAJNHUDdmIqhzOi5hVHOd4afjZcGMcVmM4enl4yeLiDyYv41eMkNmTX6IwYEFErCSqr",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 10,
          comment: "Hello world with November 27 timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 123206400,
          token:
            "875GH23U0Dr6nHFA63DhOyd9LkYudBkX8RsCTOMz5xoYAMw9sMd5QwcEqLDRnTDHPenOX7nP2trlT",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 11,
          comment: "Eight null bytes with zero timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 0,
          token:
            "1jIBheHbDdkCDFQmtgw4RUZeQoOJgGwTFJSpwOAk3XYpJJr52DEpILLmmwYl4tjdSbbNqcF1",
          msg: "0000000000000000",
          message: "\x00\x00\x00\x00\x00\x00\x00\x00",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 12,
          comment: "Eight null bytes with max timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 4294967295,
          token:
            "1jrx6DUu5q06oxykef2e2ZMyTcDRTQot9ZnwgifUtzAphGtjsxfbxXNhQyBEOGtpbkBgvIQx",
          msg: "0000000000000000",
          message: "\x00\x00\x00\x00\x00\x00\x00\x00",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 13,
          comment: "Eight null bytes with November 27th timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 123206400,
          token:
            "1jJDJOEjuwVb9Csz1Ypw1KBWSkr0YDpeBeJN6NzJWx1VgPLmcBhu2SbkpQ9JjZ3nfUf7Aytp",
          msg: "0000000000000000",
          message: "\x00\x00\x00\x00\x00\x00\x00\x00",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 14,
          comment: "Empty payload",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 0,
          token:
            "4sfD0vPFhIif8cy4nB3BQkHeJqkOkDvinI4zIhMjYX4YXZU5WIq9ycCVjGzB5",
          msg: "",
          message: "",
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 15,
          comment: "Non-UTF8 payload",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 123206400,
          token:
            "K9u6d0zjXp8RXNUGDyXAsB9AtPo60CD3xxQ2ulL8aQoTzXbvockRff0y1eXoHm",
          msg: "80",
          message: new TextDecoder().decode(Uint8Array.fromHex("80")),
          isValid: true,
          constructorThrows: false,
        },
        {
          id: 16,
          comment: "Wrong version 0xBB",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 0,
          token:
            "89mvl3RkwXjpEj5WMxK7GUDEHEeeeZtwjMIOogTthvr44qBfYtQSIZH5MHOTC0GzoutDIeoPVZk3w",
          msg: "",
          message: "",
          isValid: false,
          constructorThrows: false,
        },
        {
          id: 17,
          comment: "Invalid base62 characters",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 123206400,
          token:
            "875GH23U0Dr6nHFA63DhOyd9LkYudBkX8RsCTOMz5xoYAMw9sMd5QwcEqLDRnTDHPenOX7nP2trlT_",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: false,
          constructorThrows: true,
        },
        {
          id: 18,
          comment: "Modified version",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 0,
          token:
            "89mvl3S0BE0UCMIY94xxIux4eg1w5oXrhvCEXrDAjusSbO0Yk7AU6FjjTnbTWTqogLfNPJLzecHVb",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: false,
          constructorThrows: false,
        },
        {
          id: 19,
          comment: "Modified first byte of the nonce",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 0,
          token:
            "875GH233SUysT7fQ711EWd9BXpwOjB72ng3ZLnjWFrmOqVy49Bv93b78JU5331LbcY0EEzhLfpmSx",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: false,
          constructorThrows: true,
        },

        {
          id: 20,
          comment: "Modified timestamp",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 0,
          token:
            "870g1RCk4lW1YInhaU3TP8u2hGtfol16ettLcTOSoA0JIpjCaQRW7tQeP6dQmTvFIB2s6wL5deMXr",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: false,
          constructorThrows: true,
        },

        {
          id: 21,
          comment: "Modified last byte of the ciphertext",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 0,
          token:
            "875GH23U0Dr6nHFA63DhOyd9LkYudBkX8RsCTOMz5xoYAMw9sMd5Qw6Jpo96myliI3hHD7VbKZBYh",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: false,
          constructorThrows: true,
        },
        {
          id: 22,
          comment: "Modified last byte of the Poly1305 tag",
          key: "73757065727365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 0,
          token:
            "875GH23U0Dr6nHFA63DhOyd9LkYudBkX8RsCTOMz5xoYAMw9sMd5QwcEqLDRnTDHPenOX7nP2trk0",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: false,
          constructorThrows: true,
        },
        {
          id: 23,
          comment: "Wrong key",
          key: "77726f6e677365637265746b6579796f7573686f756c646e6f74636f6d6d6974",
          nonce: null,
          timestamp: 0,
          token:
            "870S4BYxgHw0KnP3W9fgVUHEhT5g86vJ17etaC5Kh5uIraWHCI1psNQGv298ZmjPwoYbjDQ9chy2z",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: false,
          constructorThrows: true,
        },
        {
          id: 24,
          comment: "Invalid key",
          key: "746f6f73686f72746b6579",
          nonce: null,
          timestamp: 0,
          token:
            "870S4BYxgHw0KnP3W9fgVUHEhT5g86vJ17etaC5Kh5uIraWHCI1psNQGv298ZmjPwoYbjDQ9chy2z",
          msg: "48656c6c6f20776f726c6421",
          message: "Hello world!",
          isValid: false,
          constructorThrows: true,
        },
      ],
    },
  ],
};

Deno.test(`Test vectors ${testVectors.version}`, async (test) => {
  for (const vectorGroup of testVectors.testGroups) {
    for (const vector of vectorGroup.tests) {
      await test.step(`Group: ${vectorGroup.testType} ${vector.id}/${testVectors.numberOfTests - 1} ${vector.comment}`, () => {
        if (vector.isValid === true) {
          const branca = new BrancaTest(vector.key);

          if (vectorGroup.testType === "decoding") {
            const message = branca.decode(vector.token);
            const timestamp = branca.timestamp(vector.token);

            expect(message).toEqual(vector.message);
            expect(timestamp).toEqual(vector.timestamp);
          } else if (vectorGroup.testType === "encoding") {
            branca.setNonce(
              vector.nonce ? Uint8Array.fromHex(vector.nonce) : null,
            );

            const token = branca.encode(vector.message, vector.timestamp);

            expect(token).toEqual(vector.token);
          }
        } else {
          assertThrows(() => {
            const branca = new BrancaTest(vector.key);
            if (vectorGroup.testType === "decoding") {
              branca.decode(vector.token);
            } else if (vectorGroup.testType === "encoding") {
              branca.encode(
                vector.message,
                vector.timestamp ? vector.timestamp : undefined,
              );
            }
          });
        }
      });
    }
  }
});

Deno.test(
  `Test vectors ${testVectors.version} - safe methods`,
  async (test) => {
    for (const vectorGroup of testVectors.testGroups) {
      for (const vector of vectorGroup.tests) {
        await test.step(`Group: ${vectorGroup.testType} ${vector.id}/${testVectors.numberOfTests - 1} ${vector.comment}`, () => {
          if (vector.isValid === true) {
            const branca = new BrancaTest(vector.key);

            if (vectorGroup.testType === "decoding") {
              const decodeResult = branca.safeDecode(vector.token);
              const timestampResult = branca.safeTimestamp(vector.token);

              expect(decodeResult.success).toEqual(true);
              expect(decodeResult.data).toEqual(vector.message);
              expect(timestampResult.success).toEqual(true);
              expect(timestampResult.data).toEqual(vector.timestamp);
            } else if (vectorGroup.testType === "encoding") {
              branca.setNonce(
                vector.nonce ? Uint8Array.fromHex(vector.nonce) : null,
              );

              const encodeResult = branca.safeEncode(
                vector.message,
                vector.timestamp,
              );

              expect(encodeResult.success).toEqual(true);
              expect(encodeResult.data).toEqual(vector.token);
            }
          } else {
            try {
              const branca = new BrancaTest(vector.key);

              if (vectorGroup.testType === "decoding") {
                const decodeResult = branca.safeDecode(vector.token);
                expect(decodeResult.success).toEqual(false);
                expect(decodeResult.error).toBeInstanceOf(Error);
              } else if (vectorGroup.testType === "encoding") {
                const encodeResult = branca.safeEncode(
                  vector.message,
                  vector.timestamp ? vector.timestamp : undefined,
                );

                expect(encodeResult.success).toBe(false);
                expect(encodeResult.error).toBeInstanceOf(Error);
              }
            } catch (error) {
              expect(vector.constructorThrows).toEqual(true);
              expect(error).toBeInstanceOf(Error);
            }
          }
        });
      }
    }
  },
);

Deno.test("Implementation and edge cases", async (test) => {
  await test.step("Wrong key type should fail", () => {
    // @ts-ignore Omitting type restriction
    assertThrows(() => new Branca(32));
  });

  await test.step("Wront type for payload should fail", () => {
    // @ts-ignore Omitting type restriction
    assertThrows(() => commonBranca.encode(true, -8));
  });

  await test.step("Wront type for timestamp should fail", () => {
    // @ts-ignore Omitting type restriction
    assertThrows(() => commonBranca.encode("ok", "12"));
  });

  await test.step("Out of boundaries timestamp should fail", () => {
    assertThrows(() => commonBranca.encode("ok", -8));
  });

  await test.step("Encode with timestamp as number", () => {
    const token = commonBranca.encode("payload", 123206400);

    expect(commonBranca.timestamp(token)).toEqual(123206400);
  });

  await test.step("Encode with timestamp as a date", () => {
    const date = new Date(123206400000);

    const token = commonBranca.encode("payload", date);

    expect(commonBranca.timestamp(token)).toEqual(123206400);
  });

  await test.step("Wront type for token should fail", () => {
    // @ts-ignore Omitting type restriction
    assertThrows(() => commonBranca.decode(["ok"]));
  });

  await test.step("Wront type for ttl should fail", () => {
    // @ts-ignore Omitting type restriction
    assertThrows(() => commonBranca.decode("token", true));
  });

  // safeEncode - invalid payload type
  await test.step("safeEncode with invalid payload type should return Failure", () => {
    // @ts-ignore Omitting type restriction
    const result = commonBranca.safeEncode(123);
    expect(result.success).toEqual(false);
    expect((result as Failure<Error>).error.message).toEqual(
      "Payload must be a string",
    );
  });

  // safeEncode - invalid timestamp type
  await test.step("safeEncode with invalid timestamp type should return Failure", () => {
    // @ts-ignore Omitting type restriction
    const result = commonBranca.safeEncode("payload", "invalid");
    expect(result.success).toEqual(false);
    expect((result as Failure<Error>).error.message).toEqual(
      "Timestamp must be a number or a Date instance",
    );
  });

  // safeEncode - invalid timestamp range (negative)
  await test.step("safeEncode with negative timestamp should return Failure", () => {
    const result = commonBranca.safeEncode("payload", -1);
    expect(result.success).toEqual(false);
    expect((result as Failure<Error>).error.message).toEqual(
      "Invalid timestamp",
    );
  });

  // safeEncode - invalid timestamp range (overflow)
  await test.step("safeEncode with timestamp > 0xffffffff should return Failure", () => {
    const result = commonBranca.safeEncode("payload", 0x100000000);
    expect(result.success).toEqual(false);
    expect((result as Failure<Error>).error.message).toEqual(
      "Invalid timestamp",
    );
  });

  // safeEncode - undefined timestamp (uses current time)
  await test.step("safeEncode with undefined timestamp uses current time", () => {
    const before = Math.floor(Date.now() / 1000);
    const result = commonBranca.safeEncode("payload", undefined);
    const after = Math.floor(Date.now() / 1000);
    expect(result.success).toEqual(true);
    const data = (result as Success<string>).data;
    expect(typeof data).toEqual("string");
    const extractedTimestamp = commonBranca.timestamp(data);
    expect(extractedTimestamp).toBeGreaterThanOrEqual(before);
    expect(extractedTimestamp).toBeLessThanOrEqual(after);
  });

  // safeEncode - timestamp as Date
  await test.step("safeEncode with timestamp as Date", () => {
    const date = new Date(123206400000);
    const result = commonBranca.safeEncode("payload", date);
    expect(result.success).toEqual(true);
    const data = (result as Success<string>).data;
    expect(typeof data).toEqual("string");
    expect(commonBranca.timestamp(data)).toEqual(123206400);
  });

  // safeEncode - Uint8Array payload
  await test.step("safeEncode with Uint8Array payload", () => {
    const payload = Uint8Array.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
    const result = commonBranca.safeEncode(payload);
    expect(result.success).toEqual(true);
    const data = (result as Success<string>).data;
    expect(typeof data).toEqual("string");
    const decoded = commonBranca.decode(data);
    expect(new TextEncoder().encode(decoded)).toEqual(payload);
  });

  // decode - TTL too big
  await test.step("decode with TTL too big should throw", () => {
    const token = commonBranca.encode("payload", 0);
    // @ts-ignore Omitting type restriction
    assertThrows(() => commonBranca.decode(token, 0x100000000));
  });

  // decode - token expired
  await test.step("decode with expired token should throw", () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 100;
    const token = commonBranca.encode("payload", pastTimestamp);
    assertThrows(() => commonBranca.decode(token, 50));
  });

  // decode - token not expired (edge: exactly at TTL boundary)
  await test.step("decode with token at TTL boundary should succeed", () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 50;
    const token = commonBranca.encode("payload", pastTimestamp);
    // Use a TTL that makes the token just barely not expired
    const result = commonBranca.decode(token, 60);
    expect(result).toEqual("payload");
  });

  // decode - token not expired (TTL omitted)
  await test.step("decode without TTL never expires", () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 1000000;
    const token = commonBranca.encode("payload", pastTimestamp);
    const result = commonBranca.decode(token);
    expect(result).toEqual("payload");
  });

  // safeDecode - invalid token type
  await test.step("safeDecode with invalid token type should return Failure", () => {
    // @ts-ignore Omitting type restriction
    const result = commonBranca.safeDecode(123);
    expect(result.success).toEqual(false);
    expect((result as Failure<Error>).error.message).toEqual(
      "Token must be a string",
    );
  });

  // safeDecode - invalid TTL type
  await test.step("safeDecode with invalid TTL type should return Failure", () => {
    // @ts-ignore Omitting type restriction
    const result = commonBranca.safeDecode("token", true);
    expect(result.success).toEqual(false);
    expect((result as Failure<Error>).error.message).toEqual(
      "TTL must be a number",
    );
  });

  // safeDecode - TTL too big
  await test.step("safeDecode with TTL too big should return Failure", () => {
    const token = commonBranca.encode("payload", 0);
    // @ts-ignore Omitting type restriction
    const result = commonBranca.safeDecode(token, 0x100000000);
    expect(result.success).toEqual(false);
    expect((result as Failure<Error>).error.message).toEqual("TTL is to big");
  });

  // safeDecode - token expired
  await test.step("safeDecode with expired token should return Failure", () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 100;
    const token = commonBranca.encode("payload", pastTimestamp);
    const result = commonBranca.safeDecode(token, 50);
    expect(result.success).toEqual(false);
    expect((result as Failure<Error>).error.message).toEqual(
      "Token has expired",
    );
  });

  // safeDecode - token not expired
  await test.step("safeDecode with non-expired token should succeed", () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 50;
    const token = commonBranca.encode("payload", pastTimestamp);
    const result = commonBranca.safeDecode(token, 60);
    expect(result.success).toEqual(true);
    expect((result as Success<string>).data).toEqual("payload");
  });

  // safeDecode - token not expired (no TTL)
  await test.step("safeDecode without TTL never expires", () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 1000000;
    const token = commonBranca.encode("payload", pastTimestamp);
    const result = commonBranca.safeDecode(token);
    expect(result.success).toEqual(true);
    expect((result as Success<string>).data).toEqual("payload");
  });

  // timestamp() - invalid token type
  await test.step("timestamp with invalid token type should throw", () => {
    // @ts-ignore Omitting type restriction
    assertThrows(() => commonBranca.timestamp(123));
  });

  // timestamp() - empty token
  await test.step("timestamp with empty token should throw", () => {
    assertThrows(() => commonBranca.timestamp(""));
  });

  // timestamp() - whitespace-only token
  await test.step("timestamp with whitespace-only token should throw", () => {
    assertThrows(() => commonBranca.timestamp("   "));
  });

  // safeTimestamp() - invalid token type
  await test.step("safeTimestamp with invalid token type should return Failure", () => {
    // @ts-ignore Omitting type restriction
    const result = commonBranca.safeTimestamp(123);
    expect(result.success).toEqual(false);
    expect((result as Failure<Error>).error.message).toEqual(
      "Token must be a string",
    );
  });

  // safeTimestamp() - empty token
  await test.step("safeTimestamp with empty token should return Failure", () => {
    const result = commonBranca.safeTimestamp("");
    expect(result.success).toEqual(false);
    expect((result as Failure<Error>).error.message).toEqual(
      "Token must not be an empty string",
    );
  });

  // safeTimestamp() - whitespace-only token
  await test.step("safeTimestamp with whitespace-only token should return Failure", () => {
    const result = commonBranca.safeTimestamp("   ");
    expect(result.success).toEqual(false);
    expect((result as Failure<Error>).error.message).toEqual(
      "Token must not be an empty string",
    );
  });

  // safeTimestamp() - valid token
  await test.step("safeTimestamp with valid token should succeed", () => {
    const token = commonBranca.encode("payload", 123206400);
    const result = commonBranca.safeTimestamp(token);
    expect(result.success).toEqual(true);
    expect((result as Success<number>).data).toEqual(123206400);
  });

  // encode with Uint8Array payload
  await test.step("encode with Uint8Array payload", () => {
    const payload = Uint8Array.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
    const token = commonBranca.encode(payload);
    expect(typeof token).toEqual("string");
    const decoded = commonBranca.decode(token);
    expect(new TextEncoder().encode(decoded)).toEqual(payload);
  });

  // encode with Date timestamp
  await test.step("encode with Date timestamp", () => {
    const date = new Date(123206400 * 1000);
    const token = commonBranca.encode("payload", date);
    expect(commonBranca.timestamp(token)).toEqual(123206400);
  });

  // encode with negative timestamp boundary (should fail)
  await test.step("encode with timestamp at -1 should fail", () => {
    assertThrows(() => commonBranca.encode("payload", -1));
  });

  // encode with timestamp at 0xffffffff (should succeed)
  await test.step("encode with timestamp at 0xffffffff should succeed", () => {
    const token = commonBranca.encode("payload", 0xffffffff);
    expect(commonBranca.timestamp(token)).toEqual(0xffffffff);
  });

  // encode with timestamp at 0xffffffff + 1 (should fail)
  await test.step("encode with timestamp at 0xffffffff + 1 should fail", () => {
    assertThrows(() => commonBranca.encode("payload", 0x100000000));
  });
});

new TextDecoder().decode(Uint8Array.from([80]));

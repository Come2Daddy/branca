import { expect } from "@std/expect";
import { assertThrows } from "@std/assert";
import Branca from "./main.ts";

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
});

new TextDecoder().decode(Uint8Array.from([80]));

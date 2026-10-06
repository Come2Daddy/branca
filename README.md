# Branca

Authenticated and encrypted API tokens for Deno using modern cryptography.

## Overview

Branca is a secure, easy-to-use token format that makes it hard to shoot
yourself in the foot. It uses **IETF XChaCha20-Poly1305 AEAD** symmetric
encryption to create encrypted and tamper-proof tokens. The payload can be any
arbitrary sequence of bytes — a JSON object, plain text string, or even binary
data serialized by MessagePack or Protocol Buffers.

Although not a primary goal, Branca can be used as an alternative to JWT. It is
closely based on the
[Fernet specification](https://github.com/fernet/spec/blob/master/Spec.md).

### Design Goals

1. **Secure** — based on modern, well-vetted cryptography
2. **Easy to implement** — minimal API surface
3. **Small token size** — compact binary format with base62 encoding

### Token Format

A Branca token consists of a header, ciphertext, and an authentication tag:

```
Version (1B) || Timestamp (4B) || Nonce (24B) || Ciphertext (*B) || Tag (16B)
```

The string representation uses base62 encoding with the character set:
`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`

### Result Pattern

Branca provides a functional error-handling approach through the `Result`
pattern. The safe methods (`safeEncode`, `safeDecode`, `safeTimestamp`) never
throw exceptions. Instead, they return a `Result<T, E>` discriminated union:

- **`Success<T>`** — `success: true`, `data` holds the result
- **`Failure<E>`** — `success: false`, `error` describes the issue

```ts
import type { Failure, Result, Success } from "@c2d/branca";
```

Use the `success` discriminant to branch your logic:

```ts
const result = branca.safeDecode(token, 3600);

if (result.success) {
  console.log("Payload:", result.data);
} else {
  console.error("Failed:", result.error.message);
}
```

### Safe Methods

| Method            | Signature                                                                              | Description                                                         |
| ----------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `safeEncode()`    | `(payload: string \| Uint8Array, timestamp?: number \| Date) => Result<string, Error>` | Encrypt without throwing. Returns `Success` or `Failure`.           |
| `safeDecode()`    | `(token: string, ttl?: number) => Result<string, Error>`                               | Decrypt without throwing. Returns `Success` or `Failure`.           |
| `safeTimestamp()` | `(token: string) => Result<number, Error>`                                             | Extract timestamp without throwing. Returns `Success` or `Failure`. |

## API

### Constructor

```ts
new Branca(key: string)
```

Create a new `Branca` instance with a 32-byte (256-bit) secret key provided as a
hex string.

```ts
import Branca from "@c2d/branca";

const branca = new Branca(
  "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
);
```

### `encode(payload, timestamp?)`

Encrypt a payload and return a Branca token string.

| Parameter   | Type                   | Description                                          |
| ----------- | ---------------------- | ---------------------------------------------------- |
| `payload`   | `string \| Uint8Array` | The data to encrypt                                  |
| `timestamp` | `number` (optional)    | Unix timestamp in seconds. Defaults to current time. |

```ts
const token = branca.encode("Hello, World!");
const jsonToken = branca.encode(
  JSON.stringify({ user: "alice", role: "admin" }),
);
```

### `safeEncode(payload, timestamp?)`

Encrypt a payload and return a `Result<string, Error>` instead of throwing.

| Parameter   | Type                   | Description                                          |
| ----------- | ---------------------- | ---------------------------------------------------- |
| `payload`   | `string \| Uint8Array` | The data to encrypt                                  |
| `timestamp` | `number` (optional)    | Unix timestamp in seconds. Defaults to current time. |

```ts
const result = branca.safeEncode("Hello, World!");

if (result.success) {
  console.log("Token:", result.data);
} else {
  console.error("Encode failed:", result.error.message);
}
```

### `decode(token, ttl?)`

Verify and decrypt a Branca token, returning the original payload as a string.

| Parameter | Type                | Description                                              |
| --------- | ------------------- | -------------------------------------------------------- |
| `token`   | `string`            | The Branca token to decode                               |
| `ttl`     | `number` (optional) | Maximum age in seconds. Throws if the token has expired. |

```ts
const payload = branca.decode(token);
const freshPayload = branca.decode(token, 3600); // Token must be less than 1 hour old
```

### `safeDecode(token, ttl?)`

Verify and decrypt a Branca token, returning a `Result<string, Error>` instead
of throwing.

| Parameter | Type                | Description                                           |
| --------- | ------------------- | ----------------------------------------------------- |
| `token`   | `string`            | The Branca token to decode                            |
| `ttl`     | `number` (optional) | Maximum age in seconds. Returns `Failure` if expired. |

```ts
const result = branca.safeDecode(token);

if (result.success) {
  console.log("Payload:", result.data);
} else {
  console.error("Decode failed:", result.error.message);
}
```

### `timestamp(token)`

Extract the timestamp from a token without decrypting it.

| Parameter | Type     | Description                 |
| --------- | -------- | --------------------------- |
| `token`   | `string` | The Branca token to inspect |

Returns a `number` representing the Unix timestamp embedded in the token.

```ts
const ts = branca.timestamp(token);
console.log(`Token created at: ${new Date(ts * 1000)}`);
```

### `safeTimestamp(token)`

Extract the timestamp from a token without decrypting it, without throwing.

| Parameter | Type     | Description                 |
| --------- | -------- | --------------------------- |
| `token`   | `string` | The Branca token to inspect |

Returns a `Result<number, Error>` with the Unix timestamp on success, or a
`Failure<Error>` on validation failure.

```ts
const result = branca.safeTimestamp(token);

if (result.success) {
  console.log(`Token created at: ${new Date(result.data * 1000)}`);
} else {
  console.error("Failed to extract timestamp:", result.error.message);
}
```

## Deno Examples

### Install

```shell
deno add jsr:@c2d/branca
```

### Basic usage

### With TTL validation

```ts
import Branca from "@c2d/branca";

const branca = new Branca(
  "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
);

const token = branca.encode(JSON.stringify({ id: 1, name: "Alice" }));

try {
  const data = branca.decode(token, 300); // Valid for 5 minutes
  console.log("Decoded:", data);
} catch (err) {
  console.error("Token expired or invalid:", err.message);
}
```

### With Result pattern

```ts
import Branca from "@c2d/branca";

const branca = new Branca(
  "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
);

const encodeResult = branca.safeEncode(
  JSON.stringify({ id: 1, name: "Alice" }),
);

if (encodeResult.success) {
  const decodeResult = branca.safeDecode(encodeResult.data, 300);

  if (decodeResult.success) {
    console.log("Decoded:", decodeResult.data);
  } else {
    console.error("Decode failed:", decodeResult.error.message);
  }
} else {
  console.error("Encode failed:", encodeResult.error.message);
}
```

### Inspecting token timestamp

```ts
import Branca from "@c2d/branca";

const branca = new Branca(
  "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
);

const token = branca.encode("some data");

// Traditional (throws on error)
const ts = branca.timestamp(token);
console.log(`Token created: ${new Date(ts * 1000).toISOString()}`);

// Safe (returns Result)
const tsResult = branca.safeTimestamp(token);
if (tsResult.success) {
  console.log(`Token created: ${new Date(tsResult.data * 1000).toISOString()}`);
} else {
  console.error("Failed to extract timestamp:", tsResult.error.message);
}
```

## Security Notes

- The key must be **32 bytes** (256 bits) of cryptographically strong random
  data, provided as a hex string.
- Never reuse a nonce with the same key. Nonce generation is handled
  automatically.
- The `ttl` parameter is optional. Without it, tokens never expire. Set a TTL
  appropriate for your use case.
- The header (version, timestamp, nonce) is authenticated but not encrypted. It
  can be seen but cannot be tampered with.
- Choose between `encode`/`decode` (throws on error) and
  `safeEncode`/`safeDecode` (returns `Result`) based on your error-handling
  strategy. The safe methods are recommended when you want to handle errors
  programmatically without try/catch.

## License

GNU

# Branca

Authenticated and encrypted API tokens for Deno using modern cryptography.

## Overview

Branca is a secure, easy-to-use token format that makes it hard to shoot yourself in the foot. It uses **IETF XChaCha20-Poly1305 AEAD** symmetric encryption to create encrypted and tamper-proof tokens. The payload can be any arbitrary sequence of bytes — a JSON object, plain text string, or even binary data serialized by MessagePack or Protocol Buffers.

Although not a primary goal, Branca can be used as an alternative to JWT. It is closely based on the [Fernet specification](https://github.com/fernet/spec/blob/master/Spec.md).

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

## API

### Constructor

```ts
new Branca(key: string)
```

Create a new `Branca` instance with a 32-byte (256-bit) secret key provided as a hex string.

```ts
import Branca from "main.ts";

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

## Deno Examples

### Install

```shell
deno add jsr:@c2d/branca
```

### Basic usage

```ts
import Branca from "@c2d/branca";

const key = "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";
const branca = new Branca(key);

// Create a token
const token = branca.encode("my secret payload");
console.log(token);

// Decode the token
const payload = branca.decode(token);
console.log(payload); // "my secret payload"
```

### With TTL validation

```ts
import Branca from "./main.ts";

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

### Inspecting token timestamp

```ts
import Branca from "./main.ts";

const branca = new Branca(
  "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
);

const token = branca.encode("some data");
const ts = branca.timestamp(token);
console.log(`Token created: ${new Date(ts * 1000).toISOString()}`);
```

## Security Notes

- The key must be **32 bytes** (256 bits) of cryptographically strong random data, provided as a hex string.
- Never reuse a nonce with the same key. Nonce generation is handled automatically.
- The `ttl` parameter is optional. Without it, tokens never expire. Set a TTL appropriate for your use case.
- The header (version, timestamp, nonce) is authenticated but not encrypted. It can be seen but cannot be tampered with.

## License

GNU

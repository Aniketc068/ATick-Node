# Encryption

ATick reads and writes password-protected PDFs through the same `atick.signPfx` entry point,
plus a dedicated `atick.decrypt` helper. All passwords are passed as keys inside the
options JSON string.

```js
const atick = require("atick");
const fs = require("fs");
```

| Option key        | Applies to    | Meaning                                                              |
| ----------------- | ------------- | -------------------------------------------------------------------- |
| `open_password`   | Input PDF     | Password used to open an already-encrypted PDF before signing it.    |
| `encrypt_password`| Output PDF    | User password — required to open the signed PDF that ATick produces. |
| `owner_password`  | Output PDF    | Owner/permissions password for the signed output (optional).         |

## Password-protect the output

Add `encrypt_password` to encrypt the signed PDF that ATick writes. Supply `owner_password`
as well to set a separate owner/permissions password; if you omit it, the owner password
defaults to the user password.

```js
const atick = require("atick");
const fs = require("fs");

const pdf = fs.readFileSync("contract.pdf");
const pfx = fs.readFileSync("signer.pfx");

const signed = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "••••",
  encrypt_password: "open-me",
  owner_password: "owner",
}));

fs.writeFileSync("contract-signed.pdf", signed);
```

```{admonition} The signature stays valid
:class: note
The output is AES-128 encrypted. The signature's `/Contents` is exempt from encryption,
so the signed byte range still verifies in any compliant PDF reader.
```

## Sign an encrypted input

If the input PDF is already password-protected, pass `open_password` so ATick can open it
before signing. The decrypted document is signed and then written back out (encrypt the
output again with `encrypt_password` if you want the result to stay protected).

```js
const atick = require("atick");
const fs = require("fs");

const pdf = fs.readFileSync("locked.pdf");
const pfx = fs.readFileSync("signer.pfx");

const signed = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "••••",
  open_password: "the-input-password",
}));

fs.writeFileSync("locked-signed.pdf", signed);
```

```{tip}
You can combine the keys: open an encrypted input with `open_password` and re-encrypt the
signed output in one call by also passing `encrypt_password` (and optionally `owner_password`).
```

## Decrypt a PDF

Use `atick.decrypt` to strip the password protection from a PDF and obtain its plaintext bytes.

```js
const atick = require("atick");
const fs = require("fs");

const encrypted = fs.readFileSync("locked.pdf");

const plain = atick.decrypt(encrypted, "the-password");

fs.writeFileSync("unlocked.pdf", plain);
```

## Handling failures

Both `atick.signPfx` and `atick.decrypt` throw an `Error` on failure — for
example, when a password is wrong or the input PDF is not actually encrypted.

```js
const atick = require("atick");
const fs = require("fs");

try {
  const plain = atick.decrypt(fs.readFileSync("locked.pdf"), "wrong-pw");
  fs.writeFileSync("unlocked.pdf", plain);
} catch (err) {
  console.error("Could not decrypt PDF: " + err.message);
}
```

# API reference

All operations are functions on the `atick` module. Load it with CommonJS:

```js
const atick = require("atick");
```

Every function takes raw Node `Buffer` values for PDFs and certificates, and an options JSON string
where applicable. On any failure a function throws a normal `Error`; the message is available from
`err.message`. Full TypeScript types ship in `index.d.ts`.

```ts
import * as atick from "atick";

interface Prepared {
  prepared: Buffer;
  bytesToSign: Buffer;
}
```

ATick runs server-side only. There is no browser build and no command-line interface.

## Signing

```js
atick.signPfx(pdf, pfx, optionsJson) // -> Buffer
```

Sign `pdf` with a `.pfx`/`.p12`/`.pem` credential (the format is auto-detected). For a PEM file pass
the password as the empty string `""` inside the options. Returns the signed PDF bytes.

- **pdf** — the PDF to sign (`Buffer`).
- **pfx** — the credential bytes (`.pfx`, `.p12`, or `.pem`) as a `Buffer`.
- **optionsJson** — the options JSON string (see the [Options](#options-json) table). Pass the
  credential password as the `password` key; use `""` for PEM.
- **returns** — the signed PDF as a `Buffer`.

```js
const fs = require("fs");
const atick = require("atick");

const pdf = fs.readFileSync("in.pdf");
const pfx = fs.readFileSync("signer.pfx");

const options = JSON.stringify({
  password: "secret",
  cn: "Axonate Tech",
  reason: "Approval",
  page: 1,
  rect: [40, 40, 240, 140],
  pades: true,
  timestamp: true,
  tsa_url: "http://timestamp.example/tsa",
});

try {
  const signed = atick.signPfx(pdf, pfx, options);
  fs.writeFileSync("signed.pdf", signed);
} catch (err) {
  console.error("signing failed: " + err.message);
}
```

```js
atick.signField(pdf, pfx, optionsJson) // -> Buffer
```

Sign an existing empty signature field. Use the `field_name` option to select the field. Returns the
signed PDF bytes.

- **pdf** — a PDF containing an empty signature field (see [`prepareFields`](#field-templates)).
- **pfx** — the credential bytes (`Buffer`).
- **optionsJson** — must include `field_name`; same credential and signing keys as `signPfx`.
- **returns** — the signed PDF as a `Buffer`.

## Deferred / remote-key signing

These three functions cover the deferred (eSign / HSM / remote-key) flow: prepare the PDF, sign the
returned bytes elsewhere, then embed the resulting CMS.

```js
atick.prepare(pdf, optionsJson) // -> { prepared: Buffer, bytesToSign: Buffer }
```

Step 1 of deferred signing. Adds an empty signature field, the appearance, and the signature
container, then returns the exact bytes that must be signed. Returns an object with two `Buffer`
properties:

- **prepared** — the **prepared PDF** (`Buffer`).
- **bytesToSign** — the **bytes to sign** (`Buffer`); hash and sign these with the remote key.

- **pdf** — the PDF to prepare (`Buffer`).
- **optionsJson** — appearance and signing options (see the [Options](#options-json) table).
- **returns** — `{ prepared, bytesToSign }` (the `Prepared` interface in TypeScript).

```js
atick.cmsPfx(data, pfx, optionsJson) // -> Buffer
```

Produce a detached PKCS#7 / CMS signature over `data` using a PFX. Useful for producing the CMS that
[`embed`](#embed) expects when the signing credential is a local PFX.

- **data** — the bytes to sign (typically `bytesToSign` from `prepare`) as a `Buffer`.
- **pfx** — the credential bytes (`Buffer`).
- **optionsJson** — `password`, `hash_algo`, `pades`, `timestamp`, `tsa_url`, `tsa_auth`, `ltv`.
- **returns** — the detached CMS as a `Buffer`.

(embed)=
```js
atick.embed(prepared, cms) // -> Buffer
```

Embed a detached CMS / PKCS#7 into a prepared PDF. Returns the signed PDF bytes.

- **prepared** — the prepared PDF (`prepared` from `prepare`) as a `Buffer`.
- **cms** — the detached CMS (from `cmsPfx`, an eSign reply, or an HSM) as a `Buffer`.
- **returns** — the signed PDF as a `Buffer`.

```js
const { prepared, bytesToSign } = atick.prepare(pdf, options);

const cms = atick.cmsPfx(bytesToSign, pfx, JSON.stringify({ password: "secret" }));
const signed = atick.embed(prepared, cms);
```

## Field templates

(field-templates)=
```js
atick.prepareFields(pdf, optionsJson) // -> Buffer
```

Create an empty signature field as a template: the appearance is drawn, but the signature is left
empty so it can be signed later with [`signField`](#signing). Returns the PDF bytes.

- **pdf** — the PDF to add the field to (`Buffer`).
- **optionsJson** — appearance options plus `field_name`, `page`, `rect` / `placements`.
- **returns** — the PDF with an empty field as a `Buffer`.

## Long-term validation & timestamps

```js
atick.addDocTimestamp(pdf, optionsJson) // -> Buffer
```

Add an archive DocTimeStamp (and the DSS validation material) to an already-signed PDF, producing a
PAdES-B-LTA document. Returns the timestamped PDF bytes.

- **pdf** — an already-signed PDF (`Buffer`).
- **optionsJson** — `tsa_url`, `tsa_auth`, `ltv`, `contents_size`.
- **returns** — the timestamped PDF as a `Buffer`.

## Documents & utilities

(documents-utilities)=
```js
atick.setMetadata(pdf, optionsJson) // -> Buffer
```

Set the document information (`/Info`) metadata on a PDF. Returns the updated PDF bytes.

- **pdf** — the PDF to update (`Buffer`).
- **optionsJson** — `title`, `author`, `subject`, `keywords`, `application`, `created`, `modified`
  (see the [Metadata options](#metadata-options) table).
- **returns** — the updated PDF as a `Buffer`.

```js
atick.decrypt(pdf, password) // -> Buffer
```

Decrypt a password-protected PDF. Returns the plaintext PDF bytes.

- **pdf** — the encrypted PDF (`Buffer`).
- **password** — the open (user) password as a string.
- **returns** — the decrypted PDF as a `Buffer`.

```js
atick.setFastSigning(on) // -> void
```

Enable or disable the in-memory revocation cache (used to speed up repeated CRL/OCSP lookups).
Passing `false` disables it.

- **on** — `true` to enable the cache, `false` to disable it (boolean).

```js
atick.version() // -> string
```

Return the engine version string.

- **returns** — the version as a `string`.

```js
console.log("ATick " + atick.version());
```

(options-json)=
## Options JSON

The `optionsJson` argument is a JSON object string, built with `JSON.stringify({ ... })`. All keys
are optional unless a function note says otherwise. Keys are grouped below by purpose.

### Identity & appearance text

| Key | Type | Meaning |
| --- | --- | --- |
| `cn` | string | Common name shown in the appearance. |
| `org` | string | Organisation line. |
| `ou` | string | Organisational unit line. |
| `location` | string | Signing location, also written to the signature. |
| `reason` | string | Reason for signing, also written to the signature. |
| `text` | string | Free text shown in the appearance. |
| `date` | string | Date string shown in the appearance. |
| `dn` | string | Full distinguished name line. |
| `body` | string | Custom-text-only appearance body (`\n` = new line, `*x*` = bold). |
| `heading` | string | Heading line above the signature details. |

### Verified mark

| Key | Type | Meaning |
| --- | --- | --- |
| `show_mark` | bool | Draw the verified mark. |
| `green_tick` | bool | Use the "?" verified mark. |
| `always_check` | bool | Always draw the verified/checked mark. |
| `mark_color` | string hex / name / `[r,g,b]` | Colour of the mark. |
| `mark_gradient` | array of colours | Gradient fill for the mark. |
| `mark_scale` | number | Scale factor for the mark size. |

### Layout & styling

| Key | Type | Meaning |
| --- | --- | --- |
| `text_color` | string hex / name / `[r,g,b]` | Text colour. |
| `bg_color` | string hex / name / `[r,g,b]` | Background colour of the appearance. |
| `border` | bool | Draw a border around the appearance. |
| `font_size` | number | Font size of the appearance text. |
| `width` | number | Appearance width. |
| `height` | number | Appearance height. |

### Placement

| Key | Type | Meaning |
| --- | --- | --- |
| `page` | int | Page number for the signature (1-based). |
| `rect` | `[x1, y1, x2, y2]` | Rectangle of the appearance on `page`. |
| `placements` | `[[page, [x1, y1, x2, y2]], ...]` | Multiple appearance placements (one signature, several pages). |
| `mode` | `"single"` \| `"shared"` | Whether placements share one signature (`"single"`) or are separate. |
| `field_name` | string | Name of the signature field. |

### Cryptography & PAdES

| Key | Type | Meaning |
| --- | --- | --- |
| `pades` | bool | Produce a PAdES signature. |
| `hash_algo` | `"sha256"` \| `"sha384"` \| `"sha512"` | Digest algorithm. |
| `timestamp` | bool | Add an RFC-3161 signature timestamp. |
| `tsa_url` | string | Timestamp authority URL. |
| `tsa_auth` | `["user", "pass"]` | Basic-auth credentials for the TSA. |
| `ltv` | bool | Add long-term validation material (DSS). |
| `lta` | bool | Add an archive DocTimeStamp (PAdES-B-LTA). |
| `contents_size` | int | Size of the signature `/Contents` placeholder (default `16384`). |

### Certification & locking

| Key | Type | Meaning |
| --- | --- | --- |
| `certify` | int | Certification level: `1` = no changes, `2` = form filling, `3` = form filling + annotations. |
| `lock_fields` | `["*"]` or names | Fields to lock after signing (`["*"]` = all). |

### Verification

| Key | Type | Meaning |
| --- | --- | --- |
| `verify` | bool | Verify the certificate before signing. |
| `verify_expiry` | bool | Check certificate validity dates. |
| `verify_crl` | bool | Check the CRL. |
| `verify_ocsp` | bool | Check OCSP. |

### Document security

| Key | Type | Meaning |
| --- | --- | --- |
| `open_password` | string | User/open password for the output PDF. |
| `encrypt_password` | string | Password used to encrypt the output PDF. |
| `owner_password` | string | Owner/permissions password for the output PDF. |

(metadata-options)=
## Metadata options

These keys apply to [`setMetadata`](#documents-utilities).

| Key | Type | Meaning |
| --- | --- | --- |
| `title` | string | Document title. |
| `author` | string | Document author. |
| `subject` | string | Document subject. |
| `keywords` | string | Document keywords. |
| `application` | string | Creating/producing application. |
| `created` | string | Creation date. |
| `modified` | string | Modification date. |

## Errors

Every `atick` function throws a normal `Error` on failure — bad password, malformed PDF, network
error, invalid options, and so on. The error text is available from `err.message`.

```js
try {
  const signed = atick.signPfx(pdf, pfx, options);
} catch (err) {
  console.error("ATick error: " + err.message);
}
```

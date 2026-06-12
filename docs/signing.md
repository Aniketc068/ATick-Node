# Signing methods

ATick for Node.js signs with a credential file or with an external key holder (USB token,
smart-card, HSM, OS certificate store, or a remote eSign service). Every signing call takes its
configuration as a single **JSON options string**, and every failure throws a normal `Error`.

```js
const atick = require("atick");
const fs = require("fs");
```

```{note}
ATick for Node.js runs server-side. All inputs and outputs are Node `Buffer`s, and the options
argument is a JSON **string** — build it with `JSON.stringify({ ... })`.
```

## 1. PFX / P12 / PEM file

`atick.signPfx` is the primary method. It accepts both **PKCS#12** (`.pfx` / `.p12`) and **PEM** —
the format is auto-detected.

```js
const pdf = fs.readFileSync("in.pdf");
const pfx = fs.readFileSync("signer.pfx");

const signed = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "••••",
  cn: "Aniket",
  reason: "Approved",
  pades: true,
}));

fs.writeFileSync("out.pdf", signed);
```

### PEM credentials

A PEM credential is an unencrypted PKCS#8 / PKCS#1 private key plus one or more `CERTIFICATE`
blocks. Pass its bytes as the `pfx` argument and use an empty `password` (`""`):

```js
const pem = fs.readFileSync("signer.pem");

const signed = atick.signPfx(pdf, pem, JSON.stringify({
  password: "",
  cn: "Aniket",
  pades: true,
}));
```

```{note}
Because the format is auto-detected, the same `signPfx` call works for `.pfx`, `.p12`, and `.pem`.
Only the `password` differs: the PKCS#12 passphrase for `.pfx`/`.p12`, and `""` for PEM.
```

## 2. USB token / smart-card / HSM / OS store / eSign (deferred flow)

ATick for Node.js does not load PKCS#11 libraries, the OS certificate store, or a remote eSign
service itself. To sign with a key that never leaves a token, card, HSM, OS store, or eSign ESP,
use the **deferred flow**: ATick prepares the document and hands you the exact bytes to sign, you
produce the CMS signature with your own signer, and ATick embeds it.

```js
// Step 1 — prepare. Returns { prepared, bytesToSign }.
const { prepared, bytesToSign } = atick.prepare(pdf, JSON.stringify({
  cn: "Aniket",
  reason: "Approved",
  pades: true,
  hash_algo: "sha256",
}));

// Step 2 — produce a CMS signature with your own signer.
//   Sign `bytesToSign` using the token / smart-card / HSM / OS-store / eSign key.
//   This is your own code (PKCS#11 binding, OS store, or a remote eSign ESP).
const cms = await signWithMySigner(bytesToSign);   // returns a CMS/PKCS#7 SignedData Buffer

// Step 3 — embed the CMS into the prepared document.
const signed = atick.embed(prepared, cms);
fs.writeFileSync("out.pdf", signed);
```

```{tip}
The CMS you build in step 2 must cover **`bytesToSign`** exactly and use the same `hash_algo` you
passed to `atick.prepare`. This is the standard eSign / detached-signature pattern: ATick owns the
PDF structure, your signer owns the private key.
```

If you have the key material in software (a `.pfx`/`.p12`/`.pem`), ATick can also build the CMS for
you with `atick.cmsPfx`, then `atick.embed`:

```js
const { prepared, bytesToSign } = atick.prepare(pdf, JSON.stringify({
  cn: "Aniket",
  pades: true,
}));

const cms = atick.cmsPfx(bytesToSign, pfx, JSON.stringify({
  password: "••••",
  pades: true,
}));

const signed = atick.embed(prepared, cms);
```

## Common options

All signing calls (`signPfx`, `prepare` / `cmsPfx`, `signField`) accept the same JSON keys.

| Key | Meaning |
|---|---|
| `pades: true` | PAdES (`ETSI.CAdES.detached`); `false` → plain CMS (`adbe.pkcs7.detached`) |
| `hash_algo: "sha256"` | `"sha256"`, `"sha384"`, `"sha512"` |
| `timestamp: true` | add an RFC-3161 signature timestamp (B-T) |
| `tsa_url: "…"`, `tsa_auth: ["user", "pass"]` | choose / authenticate the timestamp authority |
| `ltv: true` | embed long-term validation (B-LT) |
| `lta: true` | add a document timestamp (B-LTA) |
| `certify: 1`, `lock_fields: …` | certification & locking |
| `verify: true`, `verify_expiry`, `verify_crl`, `verify_ocsp` | pre-sign expiry / CRL / OCSP / chain checks |
| `field_name: "…"` | the signature field name (auto-uniquified — `Atick_1`, `Atick_2`, …) |
| `mode: "single" \| "shared"` | one signature on many pages, or many fields sharing one value |

`signPfx` additionally accepts `open_password` (decrypt an encrypted input), and
`encrypt_password` / `owner_password` (password-protect the output).

### Appearance options

The visible signature block is also configured through the same JSON: `cn`, `org`, `ou`,
`location`, `reason`, `text`, `date`, `dn`, `body`, `heading`, `show_mark`, `green_tick`,
`always_check`, `mark_color` (hex `"#E53935"`, name `"blue"`, or `[r, g, b]`), `mark_gradient`,
`mark_scale`, `text_color`, `bg_color`, `border`, `font_size`, `width`, `height`, `page`,
`rect` (`[x1, y1, x2, y2]`), and `placements` (`[[page, [x1, y1, x2, y2]], …]`).

```js
const signed = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "••••",
  cn: "Aniket",
  reason: "Approved",
  show_mark: true,
  green_tick: true,
  mark_color: "#E53935",
  page: 1,
  rect: [36, 36, 236, 96],
  pades: true,
}));
```

## Multi-signatory (sign an already-signed PDF)

ATick signs as an **incremental update**: existing signatures keep their byte ranges and stay
valid. Just sign the already-signed PDF again — the field name is auto-uniquified so it never
collides.

```js
const v1 = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "••••",
  cn: "Aniket",
  pades: true,
})); // Atick_1

const v2 = atick.signPfx(v1, pfx, JSON.stringify({
  password: "••••",
  cn: "Reviewer",
  pades: true,
})); // Atick_2
```

The same holds for the deferred flow: run `atick.prepare` -> external CMS -> `atick.embed` on the
already-signed bytes to add another signature.

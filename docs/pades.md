# PAdES levels

ATick produces all four PAdES baseline levels. Adobe Acrobat shows the level in the advanced
signature properties.

| Level | Options | What it adds |
|---|---|---|
| **B-B** | `pades: true` | a PAdES (CAdES) signature with the ESS signing-certificate-v2 attribute |
| **B-T** | `+ timestamp: true` | an RFC-3161 signature timestamp |
| **B-LT** | `+ ltv: true` | the DSS: full chain + CRLs + OCSP responses + per-signature VRI |
| **B-LTA** | `+ lta: true` | a document timestamp over the whole file |

Options are passed as a JSON string built with `JSON.stringify`. Failures throw an `Error`.

```js
const atick = require("atick");
const fs = require("fs");

const pdf = fs.readFileSync("input.pdf");
const pfx = fs.readFileSync("signer.pfx");

// B-B
const bb = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "••••",
  pades: true
}));

// B-T
const bt = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "••••",
  pades: true,
  timestamp: true
}));

// B-LT
const blt = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "••••",
  pades: true,
  timestamp: true,
  ltv: true
}));

// B-LTA
const blta = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "••••",
  pades: true,
  timestamp: true,
  lta: true
}));

fs.writeFileSync("signed.pdf", blta);
```

For **B-LT** and **B-LTA** ATick embeds the complete validation material (the signer chain, its
CRLs and full `OCSPResponse`s, the OCSP responder certificates, a per-signature VRI, and the
`/Extensions /ESIC` declaration) so Adobe reports **"PAdES Signature Level: B-LT"**.

```{note}
Each level is cumulative: `lta: true` implies the document timestamp on top of B-LT validation
material, so a B-LTA call typically sets `pades`, `timestamp`, `ltv`, and `lta` together.
```

## PAdES vs. plain CMS, and `/M`

- `pades: true` → SubFilter `ETSI.CAdES.detached`; the signature dictionary carries `/M` (signing
  time), which Adobe uses to classify the PAdES level.
- `pades: false` → SubFilter `adbe.pkcs7.detached`, a plain PKCS#7 signature with **no `/M`**.

## Custom TSA

The timestamp authority is configurable. Set `tsa_url` to your RFC-3161 endpoint, and supply
HTTP Basic credentials with `tsa_auth` (a `["user", "pass"]` pair) when the TSA requires them.
`hash_algo` selects the digest (`"sha256"`, `"sha384"`, or `"sha512"`).

```js
const atick = require("atick");
const fs = require("fs");

const pdf = fs.readFileSync("input.pdf");
const pfx = fs.readFileSync("signer.pfx");

const signed = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "••••",
  pades: true,
  timestamp: true,
  ltv: true,
  tsa_url: "https://tsa.example.com/tsr",
  tsa_auth: ["user", "pass"],
  hash_algo: "sha256"
}));
```

## Document timestamp on an existing signature

`atick.addDocTimestamp` adds an archive `DocTimeStamp` over the whole file, upgrading an
already-signed PDF to **B-LTA**. It takes the same JSON options (for example `tsa_url` and
`tsa_auth`) so the archive timestamp can use a custom TSA.

```js
const atick = require("atick");
const fs = require("fs");

const signedPdf = fs.readFileSync("signed.pdf");

const archived = atick.addDocTimestamp(signedPdf, JSON.stringify({
  tsa_url: "https://tsa.example.com/tsr"
}));

fs.writeFileSync("signed-lta.pdf", archived);
```

```{tip}
Call `atick.version()` to confirm the library build in use when reporting an issue.
```

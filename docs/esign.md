# Indian eSign (CCA)

ATick for Node.js supports the CCA eSign Online Electronic Signature Service for **every API version**
(v1.x … v3.x). The flow is the same across versions — only the request XML attributes differ. The
same two-step pattern also covers any **remote key**: an HSM, USB token, smart-card, or the Windows
certificate store.

```
PDF  ->  SHA-256 of the ByteRange (the InputHash, hex)
     ->  build the <Esign …> request XML for your version, put the InputHash in <InputHash>
     ->  sign the request XML (your own means / your ESP's SDK)   [enveloped W3C XML-DSig]
     ->  POST it (multipart/form-data) to the ESP
     ->  EsignResp -> <DocSignature> (pkcs7 / pkcs7Pdf / pkcs7complete)
     ->  embed it into the PDF
```

```js
const atick = require("atick");
const fs = require("fs");
const crypto = require("crypto");
```

Every call takes its configuration as a single **JSON options string**, and every failure throws an
`Error`.

## Step 1 — prepare + hash

`atick.prepare` returns an object: `prepared` is the prepared PDF, and `bytesToSign` is the exact
bytes that must be signed (the ByteRange). The eSign **InputHash** is simply the SHA-256 of
`bytesToSign`.

```js
const pdf = fs.readFileSync("in.pdf");

// options: cn, reason, placements / page+rect, field_name, pades, contents_size.
// Leave room for the chain + revocation + timestamp that a pkcs7Pdf reply carries.
const { prepared, bytesToSign } = atick.prepare(pdf, JSON.stringify({
  cn: "DS TEST",
  reason: "eSign",
  placements: [[1, [300, 55, 575, 175]]],
  contents_size: 16384
}));

// The InputHash that goes into <InputHash> (hex).
const inputHashHex = crypto.createHash("sha256").update(bytesToSign).digest("hex");
```

## Step 2 — build and sign the request XML

Put `inputHashHex` into `<InputHash>`, then sign the request XML (an enveloped W3C XML-DSig) with
your own means — your ASP signing key or your ESP's SDK — and POST it to the ESP.

```js
const request =
    '<Esign ver="2.1" sc="Y" ts="…" txn="TXN1" ekycIdType="A" aspId="…" '
  + 'AuthMode="1" responseSigType="pkcs7Pdf" responseUrl="https://…/"><Docs>'
  + '<InputHash id="1" hashAlgorithm="SHA256" docInfo="Agreement">'
  + inputHashHex
  + '</InputHash></Docs></Esign>';

// Sign `request` (enveloped XML-DSig) with your own means / your ESP's SDK,
// then POST the signed XML (multipart/form-data) to the ESP.
```

```{note}
The request XML is signed with **your ASP credential**, not with ATick. ATick's job is the PDF: it
produced `inputHashHex` from the ByteRange in step 1, and it will embed the ESP's reply in step 3.
```

## Step 3 — embed the ESP response

The `EsignResp` carries the signature in `<DocSignature>` (Base64). Decode it and pass the resulting
CMS bytes to `atick.embed`, together with the prepared PDF from step 1.

```js
const cms = Buffer.from(docSignatureBase64, "base64");  // from <DocSignature>

const signed = atick.embed(prepared, cms);
fs.writeFileSync("signed.pdf", signed);
```

`pkcs7Pdf` and `pkcs7complete` responses already carry the full chain, the revocation (under
`pdfRevocationInfoArchival`) and a CA timestamp — so the embedded signature is **LTV-complete and
timestamped** out of the box.

## `responseSigType`

| Value | Returns | Embed with |
|---|---|---|
| `pkcs7` | a CMS, signer cert only (no revocation) | `atick.embed` |
| `pkcs7Pdf` | a CMS, full chain + CRL/OCSP (signed attr) + timestamp | `atick.embed` |
| `pkcs7complete` | a CMS, full chain + revocation (unsigned attr) | `atick.embed` |

Request a `pkcs7Pdf` or `pkcs7complete` reply so the embedded signature is LTV-complete.

## Other remote keys — HSM, token, card, Windows store

The same three steps cover any key that never leaves its holder. Instead of POSTing to an ESP, sign
`bytesToSign` directly with your own signer and produce a **detached CMS / PKCS#7 SignedData**:

- **HSM / USB token / smart-card** — your vendor's PKCS#11 module.
- **Windows certificate store** — the native certificate store API.

```js
const { prepared, bytesToSign } = atick.prepare(pdf, JSON.stringify({
  cn: "DS TEST",
  reason: "Approved",
  pades: true
}));

// Sign bytesToSign with your own signer; return a detached CMS over those exact bytes.
const cms = signWithMyProvider(bytesToSign);   // PKCS#11 module / native store / vendor signer

const signed = atick.embed(prepared, cms);
fs.writeFileSync("signed.pdf", signed);
```

```{tip}
The CMS you build in step 2 must cover **`bytesToSign`** exactly and use the same hash algorithm
(SHA-256 by default) that ATick used to prepare the document. ATick owns the PDF structure; your
signer owns the private key.
```

## Simulating the ESP for testing

To run the whole flow end-to-end without a live ESP, build the detached CMS yourself from a
credential file with `atick.cmsPfx`. It stands in for the external signer, producing a
`pkcs7Pdf`-style CMS over `bytesToSign`:

```js
const pfx = fs.readFileSync("signer.pfx");

const { prepared, bytesToSign } = atick.prepare(pdf, JSON.stringify({ cn: "DS TEST", pades: true }));
const cms  = atick.cmsPfx(bytesToSign, pfx, JSON.stringify({
  password: "••••",
  pades: true,
  timestamp: true
}));
const done = atick.embed(prepared, cms);

fs.writeFileSync("signed.pdf", done);
```

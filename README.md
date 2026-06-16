<div align="center">

<img src="https://raw.githubusercontent.com/Aniketc068/ATick-Node/main/assets/atick_logo.png" alt="ATick" width="260"/>

# ATick for Node.js

**Standalone PDF digital-signature library for Node.js — PAdES / CMS signing with no external services.**

[![npm](https://img.shields.io/npm/v/atick?color=2ea44f&label=npm)](https://www.npmjs.com/package/atick)
[![Node](https://img.shields.io/badge/node-10%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PAdES](https://img.shields.io/badge/PAdES-B--B%20%7C%20B--T%20%7C%20B--LT%20%7C%20B--LTA-success)](#pades-levels)
[![Cross-platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-brightgreen)](#compatibility--one-package-everywhere)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![Also for Python](https://img.shields.io/badge/also%20for-Python-3776AB?logo=python&logoColor=white)](https://github.com/Aniketc068/ATick-Python)
[![Also for Java](https://img.shields.io/badge/also%20for-Java-007396?logo=openjdk&logoColor=white)](https://github.com/Aniketc068/ATick-Java)
[![Also for .NET](https://img.shields.io/badge/also%20for-.NET-512BD4?logo=dotnet&logoColor=white)](https://github.com/Aniketc068/ATick-DotNet)
[![Also for PHP](https://img.shields.io/badge/also%20for-PHP-777BB4?logo=php&logoColor=white)](https://github.com/Aniketc068/ATick-PHP)

</div>

**Also available in other languages** — the same ATick engine, the same API, native to each ecosystem:

| Language | Install | Source · Docs |
|---|---|---|
| **Python** | `pip install atick` | [ATick-Python](https://github.com/Aniketc068/ATick-Python) · [docs](https://atick.readthedocs.io/docs/python/) |
| **Java** | `io.github.aniketc068:atick` (Maven) | [ATick-Java](https://github.com/Aniketc068/ATick-Java) · [docs](https://atick.readthedocs.io/docs/java/) |
| **.NET** | `dotnet add package ATick` | [ATick-DotNet](https://github.com/Aniketc068/ATick-DotNet) · [docs](https://atick.readthedocs.io/docs/dotnet/) |
| **PHP** | `composer require aniketc068/atick` | [ATick-PHP](https://github.com/Aniketc068/ATick-PHP) · [docs](https://atick.readthedocs.io/docs/php/) |

---

ATick signs PDFs the way Adobe Acrobat and the EU DSS do — **PAdES baseline** signatures with
timestamps and long-term validation. It ships a **prebuilt native addon** (N-API), so there is **no
build step**, **no external service** and **nothing to compile** — `npm install atick` and you are done.

```js
const atick = require("atick");
const fs = require("fs");

const pdf = fs.readFileSync("doc.pdf");
const pfx = fs.readFileSync("my.pfx");

const signed = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "••••", cn: "Axonate Tech", reason: "Approved",
  green_tick: true, page: 1, rect: [300, 55, 575, 175],
  pades: true, timestamp: true, ltv: true,           // PAdES-B-LT
}));

fs.writeFileSync("signed.pdf", signed);
```

> **Runs server-side** (Node runtime) — Next.js API routes / server actions, Express, NestJS,
> serverless functions, CLI tools. It is a native module, so it does **not** run in the browser.

---

## The green tick your readers trust

ATick draws a verified-signature appearance with a green tick. When the certificate is valid and
trusted, Adobe Reader / Acrobat shows **“Signed and all signatures are valid.”**

<div align="center">
<img src="https://raw.githubusercontent.com/Aniketc068/ATick-Node/main/assets/valid_signature_adobe.png" alt="Adobe — signed and all signatures are valid" width="560"/>
</div>

<table align="center">
<tr>
<td align="center"><img src="https://raw.githubusercontent.com/Aniketc068/ATick-Node/main/assets/signature_appearance.png" width="190"/><br/><b>Valid &amp; trusted</b><br/>green tick</td>
<td align="center"><img src="https://raw.githubusercontent.com/Aniketc068/ATick-Node/main/assets/sig_unknown.png" width="190"/><br/><b>Validity unknown</b><br/>yellow “?”</td>
<td align="center"><img src="https://raw.githubusercontent.com/Aniketc068/ATick-Node/main/assets/sig_notverified.png" width="190"/><br/><b>Not verified</b><br/>“?” not validated</td>
<td align="center"><img src="https://raw.githubusercontent.com/Aniketc068/ATick-Node/main/assets/sig_invalid.png" width="190"/><br/><b>Invalid</b><br/>red cross</td>
</tr>
</table>

---

## Install

```bash
npm install atick
```

The prebuilt native addon for your platform comes with the package — no `node-gyp`, no compiler,
no `postinstall` build.

---

## Quick start (TypeScript)

```ts
import * as atick from "atick";
import { readFileSync, writeFileSync } from "fs";

const signed = atick.signPfx(
  readFileSync("doc.pdf"),
  readFileSync("my.pfx"),
  JSON.stringify({ password: "••••", cn: "Aniket", pades: true, page: 1, rect: [300, 55, 575, 175] }),
);
writeFileSync("signed.pdf", signed);
```

Full TypeScript types ship in the package (`index.d.ts`).

---

## Features (A → Z)

| Feature | How |
|---|---|
| **Sign with a `.pfx` / `.p12` / `.pem`** | `atick.signPfx(pdf, pfx, options)` — PKCS#12 or PEM (key + certs), auto-detected |
| **PAdES levels** B-B / B-T / B-LT / B-LTA | `"pades":true` + `"timestamp":true` + `"ltv":true` + `"lta":true` |
| **Hash algorithm** | `"hash_algo":"sha256" \| "sha384" \| "sha512"` |
| **Timestamp authority** | built in — or your own with `"tsa_url":"…"` (and `"tsa_auth":["user","pass"]`) |
| **Long-term validation (LTV)** | `"ltv":true` embeds the chain + revocation (CRL/OCSP) |
| **Multi-page / custom coordinates** | `"placements":[[page,[x1,y1,x2,y2]], …]` |
| **Signature layout** | `"mode":"single"` (one signature on many pages) · `"mode":"shared"` (many fields, same value) |
| **Multi-signatory** | sign an already-signed PDF again — each signature is its own revision, all stay valid |
| **Certification (DocMDP)** | `"certify":1` (no changes) · `2` (form filling) · `3` (form filling + annotations) |
| **Field locking (FieldMDP)** | `"lock_fields":["*"]` or `["FieldA", …]` |
| **Pre-sign checks** | `"verify_expiry":true`, `"verify_crl":true`, `"verify_ocsp":true` (or `"verify":true`) |
| **Document metadata** | `atick.setMetadata(pdf, options)` |
| **Password protection** | `"encrypt_password"` (+ `"owner_password"`) for output; `"open_password"` for input; `atick.decrypt(pdf, pw)` |
| **Appearance** | options `cn, org, ou, location, reason, text, date, dn, body, heading, image` — auto-fit text, transparent logo |
| **The mark** | the `?` (Adobe greens it), an always-green tick, or nothing — see [The mark](#the-mark) |
| **CN on the left** (Adobe-style) | `"image":"cn"` |
| **Distinguished name** | `"dn":"CN=…, O=…, C=IN"` |
| **Custom-text-only appearance** | `"body":"*APPROVED*\nby *Aniket*"` — `\n` = line, `*x*` = bold |
| **Invisible signature** | `"placements":[]` |
| **Sign an already-signed PDF** | sign again (incremental) — existing signatures stay valid; use a fresh `"field_name"` |
| **Container only** | `atick.prepareFields(pdf, options)` |
| **Document timestamp** | `"lta":true` while signing; `atick.addDocTimestamp(pdf, options)` afterwards (PAdES-B-LTA) |
| **Fast signing** | revocation cache (ON by default) — `atick.setFastSigning(false)` to disable |
| **Deferred / eSign (2-step)** | `atick.prepare(pdf, options)` → external CMS → `atick.embed(prepared, cms)` |
| **Detached CMS** | `atick.cmsPfx(data, pfx, options)` |

---

## The API

```js
atick.signPfx(pdf, pfx, optionsJson)         // sign with a .pfx / .p12 / .pem (auto-detected)
atick.prepare(pdf, optionsJson)              // deferred / eSign: returns { prepared, bytesToSign }
atick.cmsPfx(data, pfx, optionsJson)         // detached CMS over data
atick.embed(prepared, cms)                   // embed a detached CMS into a prepared PDF
atick.prepareFields(pdf, optionsJson)        // make an empty signature field (template)
atick.signField(pdf, pfx, optionsJson)       // sign an existing empty field
atick.setMetadata(pdf, optionsJson)          // Title / Author / Subject / Keywords / …
atick.addDocTimestamp(pdf, optionsJson)      // archive DocTimeStamp (PAdES-B-LTA)
atick.setFastSigning(true | false)           // revocation-cache toggle
atick.decrypt(pdf, password)                 // decrypt a password-protected PDF
atick.version()                              // engine version
```

All buffers are Node `Buffer`s; all options are a JSON **string**. Any failure throws an `Error`
whose `.message` is the reason.

### Options (JSON)

`cn, org, ou, location, reason, text, date, dn, body, heading, show_mark, green_tick, always_check,
mark_color (hex / name / [r,g,b]), mark_gradient, mark_scale, text_color, bg_color, border, font_size,
width, height, page, rect, placements ([[page,[x1,y1,x2,y2]], …]), mode (single/shared), field_name,
pades, hash_algo (sha256/384/512), timestamp, tsa_url, tsa_auth, ltv, lta, certify, lock_fields,
verify, verify_expiry, verify_crl, verify_ocsp, open_password, encrypt_password, owner_password,
contents_size`.

---

## The mark

```js
"{… ,\"green_tick\":true}"      // the "?" mark — Adobe paints it GREEN for valid+trusted, RED if invalid
"{… ,\"always_check\":true}"    // the green-tick graphic as the base
"{… ,\"green_tick\":false}"     // no mark — a plain signature
```

Colour it: `"mark_color":"#E53935"`, `"blue"`, `[255,140,0]` — or a gradient `"mark_gradient":["red","orange","yellow"]`.

---

## Deferred signing & Indian eSign (two-step)

When the private key lives elsewhere (a token / HSM / smart-card, or an eSign ESP):

```js
const { prepared, bytesToSign } = atick.prepare(pdf, JSON.stringify({
  cn: "DS TEST", reason: "eSign", placements: [[1, [300, 55, 575, 175]]], contents_size: 16384,
}));

// the eSign InputHash is the SHA-256 of bytesToSign:
const crypto = require("crypto");
const inputHash = crypto.createHash("sha256").update(bytesToSign).digest("hex");
// ... sign with your provider / eSign ESP, get back a detached CMS ...

const signed = atick.embed(prepared, cms);
```

---

## PAdES levels

```js
atick.signPfx(pdf, pfx, "{… ,\"pades\":true}")                                       // B-B
atick.signPfx(pdf, pfx, "{… ,\"pades\":true,\"timestamp\":true}")                    // B-T
atick.signPfx(pdf, pfx, "{… ,\"pades\":true,\"timestamp\":true,\"ltv\":true}")       // B-LT
atick.signPfx(pdf, pfx, "{… ,\"pades\":true,\"timestamp\":true,\"lta\":true}")       // B-LTA
```

---

## Compatibility — one package everywhere

- **Node 10.16 → the latest** — the prebuilt addon uses N-API (ABI-stable), so one binary works
  across every Node version, no rebuild.
- **Every OS/arch** — a prebuilt addon ships for each platform:

  | platform-arch | Covers |
  |---|---|
  | `win32-x64` / `win32-ia32` | **Windows 7 → 11**, 64 / 32-bit |
  | `win32-arm64` | Windows on ARM64 |
  | `linux-x64` / `linux-arm64` / `linux-arm` / `linux-ia32` | Linux x64 / ARM64 / ARM / 32-bit (glibc 2.17+, every distro) |
  | `darwin-x64` / `darwin-arm64` | macOS Intel / Apple Silicon |

---

## Errors

```js
try {
  atick.signPfx(pdf, pfx, JSON.stringify({ password: "wrong" }));
} catch (e) {
  console.error("signing failed:", e.message);
}
```

---

## License

ATick is **dual-licensed** — free for personal & open use, paid if you sell:

- **Free under [GNU AGPL-3.0](LICENSE)** — personal projects, learning, internal use, and
  open-source projects (released publicly under AGPL-3.0).
- **Commercial license (paid)** — if you **build a product with ATick and sell it**, or use it in a
  **closed-source / commercial** product, you must buy a commercial license first. Contact
  **info@axonatetech.com** for a quote.

See [LICENSING.md](LICENSING.md) for details. © 2026 Axonate Tech.

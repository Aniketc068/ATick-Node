# Quickstart

Sign a PDF with a `.pfx` (or `.p12` / `.pem`) and a visible green-tick appearance.

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

Open `signed.pdf` in Adobe Reader — for a trusted certificate it shows a valid green tick and
**“Signed and all signatures are valid.”**

## TypeScript

```ts
import * as atick from "atick";
import { readFileSync, writeFileSync } from "fs";

const signed = atick.signPfx(readFileSync("doc.pdf"), readFileSync("my.pfx"),
  JSON.stringify({ password: "••••", cn: "Aniket", pades: true, page: 1, rect: [300, 55, 575, 175] }));
writeFileSync("signed.pdf", signed);
```

## A minimal, invisible signature

```js
const signed = atick.signPfx(pdf, pfx, JSON.stringify({ password: "••••", placements: [], pades: true }));
```

## Catching errors

```js
try {
  atick.signPfx(pdf, pfx, JSON.stringify({ password: "wrong" }));
} catch (e) {
  console.error("signing failed:", e.message);
}
```

Next: see [Signing](signing.md) for all the options, or the [API reference](api.md).

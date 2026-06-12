// ATick for Node.js example — Deferred (TWO-STEP) signing for a REMOTE key
// (eSign ESP / HSM / smart card), shown on several pages.
//
// When the private key lives elsewhere, ATick splits signing into two steps:
//   1) atick.prepare(pdf, options) -> { prepared, bytesToSign }
//        bytesToSign        = the exact bytes that must be signed (the ByteRange)
//        sha256(bytesToSign) = their hash -> send THIS to your eSign service if it wants a hash
//   2) your signer produces a DETACHED PKCS#7/CMS over bytesToSign
//   3) atick.embed(prepared, cms) -> signedPdf
//
// Below, ATick itself (atick.cmsPfx) stands in for the external signer so the demo runs with no extra
// setup — replace that block with YOUR eSign ESP / HSM / token call (it just returns a detached CMS
// over bytesToSign).
const atick = require("atick");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const SAMPLES = path.join(__dirname, "samples");
const SIGNED = path.join(__dirname, "signed");
fs.mkdirSync(SIGNED, { recursive: true });
function save(name, data) { fs.writeFileSync(path.join(SIGNED, name), data); console.log("  " + name + " (" + data.length + " bytes)"); }
function now() { return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }); }

const pfx = fs.readFileSync(path.join(SAMPLES, "ABC12.pfx"));
const pdf3 = fs.readFileSync(path.join(SAMPLES, "blank3.pdf"));

// ---- STEP 1: prepare (no key needed) -> appearance on every page + bytes-to-sign ----
const pl = [[1, [40, 640, 260, 750]], [2, [330, 380, 560, 490]], [3, [180, 60, 400, 170]]];
const { prepared, bytesToSign } = atick.prepare(pdf3, JSON.stringify({
  cn: "DS TEST CERTIFICATE 06",
  reason: "eSign",
  date: now(),
  placements: pl,
  mode: "single",
  field_name: "Signature1",
  signer_name: "DS TEST CERTIFICATE 06",
  contents_size: 16384,
}));
const hash = crypto.createHash("sha256").update(bytesToSign).digest("hex");
console.log("STEP 1: hash to send to the signer:", hash);

// ---- STEP 2: the EXTERNAL signer makes a detached CMS over bytesToSign ----
//   >>> Replace this whole block with your eSign ESP / HSM / token call. <<<
//   Here ATick itself stands in for the external signer (atick.cmsPfx makes a detached CMS over
//   the given bytes), so the demo runs with no extra setup. In production this CMS comes from the ESP.
const cms = atick.cmsPfx(bytesToSign, pfx, JSON.stringify({ password: "ABC12", hash_algo: "sha256" }));

// ---- STEP 3: embed the CMS ----
save("08_deferred.pdf", atick.embed(prepared, cms));
console.log("  signed on 3 pages via the two-step eSign flow");

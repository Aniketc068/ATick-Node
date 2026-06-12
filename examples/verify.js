// ATick for Node.js example (verify.js) — pre-sign certificate checks.
// verify_expiry / verify_crl / verify_ocsp (or verify:true for all). Signing is REFUSED if a check
// fails — so an invalid certificate never produces a signature.
const atick = require("atick");
const fs = require("fs");
const path = require("path");
const SAMPLES = path.join(__dirname, "samples");
const SIGNED = path.join(__dirname, "signed");
fs.mkdirSync(SIGNED, { recursive: true });
function save(name, data) { fs.writeFileSync(path.join(SIGNED, name), data); console.log("  " + name + " (" + data.length + " bytes)"); }
function now() { return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }); }

const pfx = fs.readFileSync(path.join(SAMPLES, "ABC12.pfx"));
const pdf = fs.readFileSync(path.join(SAMPLES, "blank.pdf"));

try {
  const signed = atick.signPfx(pdf, pfx, JSON.stringify({
    password: "ABC12",
    cn: "DS TEST CERTIFICATE 06",
    reason: "Approved",
    date: now(),
    green_tick: true,
    page: 1,
    rect: [300, 55, 575, 175],
    pades: true,
    verify_expiry: true   // reject if expired
  }));
  save("09_verified.pdf", signed);
} catch (e) {
  console.log("  verify rejected this certificate:", e.message);
}

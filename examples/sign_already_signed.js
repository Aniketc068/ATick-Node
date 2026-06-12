// ATick for Node.js example (sign_already_signed.js) — add a NEW signature to an ALREADY-signed
// PDF. Incremental update: the existing signature(s) keep their byte ranges and stay valid; the new
// one is valid too. Just sign the signed PDF with a NEW, unique field_name.
const atick = require("atick");
const fs = require("fs");
const path = require("path");
const SAMPLES = path.join(__dirname, "samples");
const SIGNED = path.join(__dirname, "signed");
fs.mkdirSync(SIGNED, { recursive: true });
function save(name, data) { fs.writeFileSync(path.join(SIGNED, name), data); console.log("  " + name + " (" + data.length + " bytes)"); }
function now() { return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }); }

const pfx = fs.readFileSync(path.join(SAMPLES, "ABC12.pfx"));
const alreadySigned = fs.readFileSync(path.join(SAMPLES, "signed.pdf"));   // an already-signed input

const resigned = atick.signPfx(alreadySigned, pfx, JSON.stringify({
  password: "ABC12",
  cn: "DS TEST CERTIFICATE 06",
  reason: "Counter-signed",
  date: now(),
  field_name: "Atick_2",
  page: 1,
  rect: [40, 640, 260, 750],
  pades: true
}));
save("added_signature.pdf", resigned);

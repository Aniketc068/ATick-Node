// ATick for Node.js example (pem.js) — sign with a .pem key+cert (not .pfx).
const atick = require("atick");
const fs = require("fs");
const path = require("path");
const SAMPLES = path.join(__dirname, "samples");
const SIGNED = path.join(__dirname, "signed");
fs.mkdirSync(SIGNED, { recursive: true });
function save(name, data) { fs.writeFileSync(path.join(SIGNED, name), data); console.log("  " + name + " (" + data.length + " bytes)"); }
function now() { return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }); }

const pem = fs.readFileSync(path.join(SAMPLES, "ABC12.pem"));   // a .pem holding the key + cert
const pdf = fs.readFileSync(path.join(SAMPLES, "blank.pdf"));

const signed = atick.signPfx(pdf, pem, JSON.stringify({
  password: "",
  cn: "DS TEST CERTIFICATE 06",
  reason: "Approved",
  date: now(),
  green_tick: true,
  page: 1,
  rect: [300, 55, 575, 175],
  pades: true
}));
save("18_sign_pem.pdf", signed);

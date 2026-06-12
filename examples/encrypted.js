// ATick for Node.js example — password-protected output, signature stays valid.
const atick = require("atick");
const fs = require("fs");
const path = require("path");
const SAMPLES = path.join(__dirname, "samples");
const SIGNED = path.join(__dirname, "signed");
fs.mkdirSync(SIGNED, { recursive: true });
function save(name, data) { fs.writeFileSync(path.join(SIGNED, name), data); console.log("  " + name + " (" + data.length + " bytes)"); }
function now() { return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }); }

const pfx = fs.readFileSync(path.join(SAMPLES, "ABC12.pfx"));
const pdf1 = fs.readFileSync(path.join(SAMPLES, "blank.pdf"));
const base = {
  password: "ABC12",
  cn: "DS TEST CERTIFICATE 06",
  reason: "Approved",
  date: now(),
  page: 1,
  rect: [300, 55, 575, 175],
  pades: true,
};

// encrypt_password -> output PDF needs this password to open; signature stays valid (B-B/B-T only)
save("10_signed_encrypted.pdf", atick.signPfx(pdf1, pfx, JSON.stringify({ ...base, encrypt_password: "secret" })));

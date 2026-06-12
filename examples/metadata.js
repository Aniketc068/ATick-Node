// ATick for Node.js example (metadata.js) — set document metadata, then sign.
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

const withMeta = atick.setMetadata(pdf, JSON.stringify({
  title: "ATick Demo",
  author: "Aniket Chaturvedi",
  subject: "Digital signature",
  keywords: "pdf,pades,atick",
  application: "ATick"
}));

const signed = atick.signPfx(withMeta, pfx, JSON.stringify({
  password: "ABC12",
  cn: "DS TEST CERTIFICATE 06",
  reason: "Approved",
  date: now(),
  green_tick: true,
  page: 1,
  rect: [300, 55, 575, 175],
  pades: true
}));
save("12_metadata.pdf", signed);

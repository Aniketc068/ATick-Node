// ATick for Node.js example (document_timestamp.js) — sign (B-LT), then add an archive
// DocTimeStamp over the whole document (-> PAdES-B-LTA).
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

// 1) sign B-LT
const signed = atick.signPfx(pdf, pfx, JSON.stringify({
  password: "ABC12",
  cn: "DS TEST CERTIFICATE 06",
  reason: "Approved",
  date: now(),
  page: 1,
  rect: [300, 55, 575, 175],
  pades: true,
  timestamp: true,
  ltv: true
}));

// 2) add a standalone archive DocTimeStamp -> B-LTA
const lta = atick.addDocTimestamp(signed, "{}");
save("document_timestamp.pdf", lta);

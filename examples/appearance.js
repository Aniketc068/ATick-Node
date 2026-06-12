// ATick for Node.js example — full appearance via the Style options.
const atick = require("atick");
const fs = require("fs");
const path = require("path");

const SAMPLES = path.join(__dirname, "samples");
const SIGNED = path.join(__dirname, "signed");
fs.mkdirSync(SIGNED, { recursive: true });
function save(name, data) { fs.writeFileSync(path.join(SIGNED, name), data); console.log("  " + name + " (" + data.length + " bytes)"); }
function now() { return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }); }

const pfx = fs.readFileSync(path.join(SAMPLES, "ABC12.pfx"));
const pdf3 = fs.readFileSync(path.join(SAMPLES, "blank3.pdf"));

const placements = [[1, [320, 600, 575, 720]], [2, [40, 360, 295, 480]], [3, [170, 55, 425, 175]]];
const signed = atick.signPfx(pdf3, pfx, JSON.stringify({
  password: "ABC12",
  cn: "DS TEST CERTIFICATE 06",
  org: "Acme Corp CA",
  ou: "Class 3",
  location: "New Delhi, India",
  reason: "Approved for release",
  text: "Verified by ATick",
  date: now(),
  width: 240,
  height: 120,
  placements: placements,
  mode: "single",
  pades: true,
}));
save("03_appearance.pdf", signed);

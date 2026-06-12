// ATick for Node.js example — invisible signature (placements: [] -> nothing drawn).
const atick = require("atick");
const fs = require("fs");
const path = require("path");

const SAMPLES = path.join(__dirname, "samples");
const SIGNED = path.join(__dirname, "signed");
fs.mkdirSync(SIGNED, { recursive: true });
function save(name, data) { fs.writeFileSync(path.join(SIGNED, name), data); console.log("  " + name + " (" + data.length + " bytes)"); }

const pfx = fs.readFileSync(path.join(SAMPLES, "ABC12.pfx"));
const pdf1 = fs.readFileSync(path.join(SAMPLES, "blank.pdf"));

const signed = atick.signPfx(pdf1, pfx, JSON.stringify({
  password: "ABC12",
  cn: "DS TEST CERTIFICATE 06",
  reason: "Invisible approval",
  placements: [],
  field_name: "InvisibleSignature",
  pades: true,
  timestamp: true,
  ltv: true,
}));
save("16_invisible.pdf", signed);

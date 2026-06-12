// ATick for Node.js example — one signature on many pages: single vs shared.
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
const pl = [[1, [40, 640, 260, 750]], [2, [330, 380, 560, 490]], [3, [180, 60, 400, 170]]];
const base = {
  password: "ABC12",
  cn: "DS TEST CERTIFICATE 06",
  reason: "Approved",
  date: now(),
  placements: pl,
  pades: true,
};

save("05_single.pdf", atick.signPfx(pdf3, pfx, JSON.stringify({ ...base, mode: "single" })));
save("05_shared.pdf", atick.signPfx(pdf3, pfx, JSON.stringify({ ...base, mode: "shared" })));

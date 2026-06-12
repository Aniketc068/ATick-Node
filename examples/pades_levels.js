// ATick for Node.js example — PAdES B-B / B-T / B-LT / B-LTA.
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

const placements = [[1, [40, 640, 260, 750]], [2, [330, 380, 560, 490]], [3, [180, 60, 400, 170]]];
const base = {
  password: "ABC12",
  cn: "DS TEST CERTIFICATE 06",
  reason: "Approved",
  date: now(),
  placements: placements,
  mode: "single",
  pades: true,
};

const levels = [
  ["B_B", {}],
  ["B_T", { timestamp: true }],
  ["B_LT", { timestamp: true, ltv: true }],
  ["B_LTA", { timestamp: true, lta: true }],
];
for (const [name, extra] of levels) {
  save("02_pades_" + name + ".pdf", atick.signPfx(pdf3, pfx, JSON.stringify(Object.assign({}, base, extra))));
}

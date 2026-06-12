// ATick for Node.js example — the "?" mark colour + gradient.
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

const marks = [
  ["default", {}],
  ["hex", { mark_color: "#3CB371" }],
  ["named", { mark_color: "orange" }],
  ["rgb255", { mark_color: [255, 80, 80] }],
  ["gradient", { mark_gradient: ["#FFD700", "#FF4500"] }],
];
for (const [name, extra] of marks) {
  save("11_mark_" + name + ".pdf", atick.signPfx(pdf1, pfx, JSON.stringify(Object.assign({}, base, extra))));
}

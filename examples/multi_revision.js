// ATick for Node.js example — sign, then sign the signed PDF again (revisions).
const atick = require("atick");
const fs = require("fs");
const path = require("path");
const SAMPLES = path.join(__dirname, "samples");
const SIGNED = path.join(__dirname, "signed");
fs.mkdirSync(SIGNED, { recursive: true });
function save(name, data) { fs.writeFileSync(path.join(SIGNED, name), data); console.log("  " + name + " (" + data.length + " bytes)"); }
function now() { return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }); }

function opt(field, rect) {
  return JSON.stringify({
    password: "ABC12",
    cn: "DS TEST CERTIFICATE 06",
    reason: "Approved",
    date: now(),
    field_name: field,
    page: 1,
    rect: rect,
    pades: true,
  });
}

const pfx = fs.readFileSync(path.join(SAMPLES, "ABC12.pfx"));
const r1 = atick.signPfx(fs.readFileSync(path.join(SAMPLES, "blank.pdf")), pfx, opt("Rev1", [300, 55, 575, 175])); save("rev1.pdf", r1);
const r2 = atick.signPfx(r1, pfx, opt("Rev2", [40, 640, 260, 750])); save("rev2.pdf", r2);
const r3 = atick.signPfx(r2, pfx, opt("Rev3", [40, 400, 260, 510])); save("rev3.pdf", r3);

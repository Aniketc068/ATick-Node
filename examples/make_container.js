// ATick for Node.js example — build the ATick appearance + an EMPTY signing
// container (ByteRange + empty Contents) without signing; an external signer fills it later.
const atick = require("atick");
const fs = require("fs");
const path = require("path");
const SAMPLES = path.join(__dirname, "samples");
const SIGNED = path.join(__dirname, "signed");
fs.mkdirSync(SIGNED, { recursive: true });
function save(name, data) { fs.writeFileSync(path.join(SIGNED, name), data); console.log("  " + name + " (" + data.length + " bytes)"); }
function now() { return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }); }

const pdf = fs.readFileSync(path.join(SAMPLES, "blank.pdf"));

// prepare -> { prepared, bytesToSign }; the prepared PDF is the container
const { prepared, bytesToSign } = atick.prepare(pdf, JSON.stringify({
  cn: "DS TEST CERTIFICATE 06",
  reason: "Approved",
  date: now(),
  page: 1,
  rect: [300, 55, 575, 175],
  pades: true,
  contents_size: 16384,
}));
save("container.pdf", prepared);
console.log("  (bytes-to-sign: " + bytesToSign.length + " bytes — hand to an external signer)");

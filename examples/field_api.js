// ATick for Node.js example (field_api.js) — low-level: prepare an empty field, then sign it.
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

// 1) prepare an empty signing field (template) with the ATick appearance
const template = atick.prepareFields(pdf, JSON.stringify({
  cn: "DS TEST CERTIFICATE 06",
  reason: "Approved",
  date: now(),
  field_name: "Sig1",
  page: 1,
  rect: [300, 55, 575, 175],
  pades: true
}));
save("14_prepared_fields_template.pdf", template);

// 2) sign that field
const signed = atick.signField(template, pfx, JSON.stringify({
  password: "ABC12",
  field_name: "Sig1",
  reason: "Approved",
  pades: true
}));
save("14_sign_field.pdf", signed);

// ATick for Node.js example — any date format you like in the appearance.
const atick = require("atick");
const fs = require("fs");
const path = require("path");
const SAMPLES = path.join(__dirname, "samples");
const SIGNED = path.join(__dirname, "signed");
fs.mkdirSync(SIGNED, { recursive: true });
function save(name, data) { fs.writeFileSync(path.join(SIGNED, name), data); console.log("  " + name + " (" + data.length + " bytes)"); }

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const Y = now.getFullYear(), M = now.getMonth() + 1, D = now.getDate();
const H = now.getHours(), m = now.getMinutes(), S = now.getSeconds();
const h12 = ((H % 12) || 12), ampm = H < 12 ? "AM" : "PM";

const variants = [
  ["iso", `${Y}-${pad(M)}-${pad(D)} ${pad(H)}:${pad(m)}:${pad(S)}`],
  ["eu", `${pad(D)}/${pad(M)}/${Y} ${pad(H)}:${pad(m)}`],
  ["us", `${pad(M)}-${pad(D)}-${Y} ${pad(h12)}:${pad(m)} ${ampm}`],
  ["words", `${DAYS[now.getDay()]}, ${pad(D)} ${MONTHS[now.getMonth()]} ${Y}`],
  ["custom", `Signed on ${pad(D)}-${MON[now.getMonth()]}-${Y} at ${pad(h12)}:${pad(m)} ${ampm}`],
];

const pfx = fs.readFileSync(path.join(SAMPLES, "ABC12.pfx"));
const pdf = fs.readFileSync(path.join(SAMPLES, "blank.pdf"));

for (const [name, date] of variants) {
  const opt = JSON.stringify({
    password: "ABC12",
    cn: "DS TEST CERTIFICATE 06",
    reason: "Approved",
    date: date,
    page: 1,
    rect: [300, 55, 575, 175],
    pades: true,
  });
  save("18_date_" + name + ".pdf", atick.signPfx(pdf, pfx, opt));
}

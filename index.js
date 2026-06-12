// ATick for Node.js — a complete PDF digital-signature library.
// Loads the prebuilt native addon (N-API) for the running platform/arch. The addon is a compiled
// binary; there is no build step for you. Every failure throws a normal Error.
'use strict';

const path = require('path');

// process.platform: 'win32' | 'linux' | 'darwin'   ·   process.arch: 'x64' | 'ia32' | 'arm64' | 'arm'
const target = `${process.platform}-${process.arch}`;

let addon;
try {
  addon = require(path.join(__dirname, 'prebuilds', target, 'atick.node'));
} catch (err) {
  throw new Error(
    `ATick: no prebuilt addon for "${target}". Supported: win32-x64/ia32/arm64, ` +
    `linux-x64/ia32/arm64/arm, darwin-x64/arm64. (${err.message})`
  );
}

// The N-API addon exports: version, signPfx, prepare, cmsPfx, embed, prepareFields, signField,
// setMetadata, addDocTimestamp, decrypt, setFastSigning. Each throws on failure. Branding is fixed
// to ATick_js inside the addon. Re-export as-is.
module.exports = addon;

# Installation

ATick for Node.js is one npm package with a prebuilt native addon — no `node-gyp`, no compiler, no
build step.

## Requirements

- **Node.js 10.16 or newer** (the prebuilt addon uses N-API, ABI-stable across all Node versions).
- Any supported OS/arch — Windows 7+ (x64/x86/ARM64), Linux (x64/ARM64/ARM, every glibc distro), macOS (Intel/Apple Silicon).

## Install

```bash
npm install atick
```

```bash
# yarn / pnpm
yarn add atick
pnpm add atick
```

## Verify

```js
const atick = require("atick");
console.log(atick.version());   // e.g. 1.0.5
```

## How the native addon is loaded

The package ships a prebuilt `atick.node` for each platform under `prebuilds/<platform>-<arch>/`.
At `require("atick")`, the right one is loaded for `process.platform` + `process.arch` — there is no
compilation on install.

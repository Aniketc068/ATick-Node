// ATick for Node.js — TypeScript definitions.

/** The result of {@link prepare} — the prepared PDF and the exact bytes that must be signed. */
export interface Prepared {
  /** The prepared PDF (appearance drawn, signature placeholder reserved). */
  prepared: Buffer;
  /** The exact bytes to sign (the ByteRange) — its SHA-256 is the eSign InputHash. */
  bytesToSign: Buffer;
}

/** The engine version string, e.g. `"1.0.5"`. */
export function version(): string;

/** Sign a PDF with a PFX/P12 (or PEM). `options` is a JSON string. Throws on failure. */
export function signPfx(pdf: Buffer, pfx: Buffer, options: string): Buffer;

/** Prepare a PDF for deferred / remote (eSign / HSM / token) signing. Sign `bytesToSign` externally, then {@link embed}. */
export function prepare(pdf: Buffer, options: string): Prepared;

/** Produce a detached CMS/PKCS#7 over `data`, signed with a PFX. */
export function cmsPfx(data: Buffer, pfx: Buffer, options: string): Buffer;

/** Embed a detached CMS/PKCS#7 into a prepared PDF. */
export function embed(prepared: Buffer, cms: Buffer): Buffer;

/** Prepare an empty signature field (template). */
export function prepareFields(pdf: Buffer, options: string): Buffer;

/** Sign an existing empty field (e.g. from {@link prepareFields}) with a PFX/P12/PEM. */
export function signField(pdf: Buffer, pfx: Buffer, options: string): Buffer;

/** Set document metadata (Title/Author/Subject/Keywords/Creator/CreationDate/ModDate via JSON). */
export function setMetadata(pdf: Buffer, options: string): Buffer;

/** Add a standalone archive DocTimeStamp (+ DSS) to an already-signed PDF (PAdES-B-LTA). */
export function addDocTimestamp(pdf: Buffer, options: string): Buffer;

/** Decrypt a password-protected PDF. */
export function decrypt(pdf: Buffer, password: string): Buffer;

/** Enable/disable fast signing (reuse fetched revocation across many documents in one run). */
export function setFastSigning(on: boolean): void;

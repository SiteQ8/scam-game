// Finds Playwright, sharp and a browser on this machine, so the tools run on any computer.
// Playwright and sharp come from the project's node_modules when installed there, or from the global npm folder.
// Set CHROME_PATH to use a particular Chromium; otherwise Playwright's own browser is used.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
let globalRoot = '';
function load(name) {
  try { return require(name); } catch { /* not installed in the project */ }
  globalRoot ||= execSync('npm root -g', { encoding: 'utf8' }).trim();
  return require(join(globalRoot, name));
}

export const playwright = () => load('playwright');
export const sharp = () => load('sharp');
/** A headless Chromium; extra command line switches are added to the defaults. */
export const launch = (args = []) => playwright().chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ['--no-sandbox', ...args],
});

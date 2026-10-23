// The release workflows: every secret they read is documented in store/SECRETS.md, release.yml builds both apps
// for each release it publishes, and every workflow numbers builds with the same formula from package.json.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const dir = join(root, '.github', 'workflows');
const workflows: Record<string, string> = Object.fromEntries(
  readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).map((f) => [f, readFileSync(join(dir, f), 'utf8')]),
);
const guide = readFileSync(join(root, 'store', 'SECRETS.md'), 'utf8');

// The jobs of a workflow by id: each block runs from its "  id:" line under jobs: to the next one.
function jobs(text: string): Record<string, string> {
  const body = text.slice(text.search(/^jobs:\s*$/m));
  return Object.fromEntries(body.split(/^(?= {2}[A-Za-z_][\w-]*:\s*$)/m).slice(1).map((block) => [block.trim().split(':')[0], block]));
}

// A step by its name: from its "- name:" line to the next line that is indented no deeper than its dash.
function step(text: string, name: string): string {
  const lines = text.split('\n');
  const at = lines.findIndex((line) => line.trim() === `- name: ${name}`);
  if (at < 0) return '';
  const dash = lines[at].indexOf('-');
  let end = at + 1;
  while (end < lines.length && (lines[end].trim() === '' || lines[end].search(/\S/) > dash)) end++;
  return lines.slice(at, end).join('\n');
}

// Only the secrets context itself counts, not a step or output that happens to be called secrets.
// GitHub gives every run GITHUB_TOKEN, so it needs no entry in the guide.
const read = Object.entries(workflows)
  .flatMap(([file, text]) => [...text.matchAll(/(?<![\w.])secrets\.([A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => ({ file, name: m[1] })))
  .filter((s) => s.name !== 'GITHUB_TOKEN');
// The guide lists each secret as a row of its table: | `NAME` | platform | needed for | value |
const documented = [...guide.matchAll(/^\| `([A-Z][A-Z0-9_]*)` \|/gm)].map((m) => m[1]);

describe('release workflows', () => {
  it('read only secrets that store/SECRETS.md documents', () => {
    expect(read.length).toBeGreaterThan(0);
    const undocumented = [...new Set(read.filter((s) => !documented.includes(s.name)).map((s) => `${s.file}: ${s.name}`))];
    expect(undocumented, 'add these secrets to the table in store/SECRETS.md').toEqual([]);
    const names = new Set(read.map((s) => s.name));
    expect(documented.filter((name) => !names.has(name)), 'store/SECRETS.md lists secrets that no workflow reads').toEqual([]);
    expect(new Set(documented).size, 'store/SECRETS.md lists a secret twice').toBe(documented.length);
  });

  it('build both apps for each release that release.yml publishes, or that a run by hand names', () => {
    const release = jobs(workflows['release.yml']);
    expect(release.publish, 'release.yml has a publish job').toBeDefined();
    expect(release.publish, 'publish gives the tag it published').toMatch(/^ {4}outputs:\n {6}tag: \$\{\{ steps\.\w+\.outputs\.tag \}\}$/m);
    expect(workflows['release.yml'], 'release.yml can be run by hand for a tag').toMatch(/^ {2}workflow_dispatch:\n {4}inputs:\n {6}tag:\n(?: {8}.*\n)*? {8}required: true$/m);
    for (const platform of ['android.yml', 'ios.yml']) {
      const callers = Object.entries(release).filter(([, job]) => job.includes(`uses: ./.github/workflows/${platform}\n`));
      expect(callers.length, `release.yml calls ${platform}`).toBe(1);
      const [id, job] = callers[0];
      expect(job, `${id} waits for publish`).toMatch(/^ {4}needs: \[?publish\]?$/m);
      expect(job, `${id} runs only when a release was published`).toMatch(/^ {4}if: needs\.publish\.outputs\.tag != ''$/m);
      expect(job, `${id} builds the tag that publish gives`).toMatch(/^ {6}release_tag: \$\{\{ needs\.publish\.outputs\.tag \}\}$/m);
      expect(job, `${id} lets ${platform} attach files to the release`).toMatch(/^ {4}permissions:\n {6}contents: write$/m);
      expect(job, `${id} passes the secrets on`).toMatch(/^ {4}secrets: inherit$/m);
      expect(workflows[platform], `${platform} takes a release_tag when called`).toMatch(/^ {2}workflow_call:\n {4}inputs:\n {6}release_tag:$/m);
      expect(workflows[platform], `${platform} attaches its file to the release`).toContain('gh release upload "$TAG" "$FILE" --clobber');
    }
  });

  it('number builds the same way in every workflow, so a build number never goes down', () => {
    const formula = 'MAJOR * 10000 + MINOR * 100 + PATCH';
    const found = Object.entries(workflows).flatMap(([file, text]) =>
      [...text.matchAll(/^\s*BUILD_NUMBER=\$\(\((.+)\)\)\s*$/gm)].map((m) => ({ file, formula: m[1].replace(/\s+/g, ' ').trim() })),
    );
    expect(found.map((f) => f.file).sort()).toEqual(['android.yml', 'ios.yml']);
    for (const f of found) expect(f.formula, `${f.file} computes the build number differently`).toBe(formula);
    // The whole step matches too, apart from the name of the other workflow in its comment.
    const versionStep = (file: string) => step(workflows[file], 'Version from package.json').replace(/\b(android|ios)\.yml\b/g, 'OTHER.yml');
    expect(versionStep('android.yml')).toContain('BUILD_NUMBER=');
    expect(versionStep('ios.yml'), 'the version steps of android.yml and ios.yml differ').toBe(versionStep('android.yml'));
    for (const [file, text] of Object.entries(workflows)) expect(text, `${file} numbers builds by run`).not.toMatch(/run_number/);
    expect(workflows['android.yml']).toContain('VERSION_CODE: ${{ steps.version.outputs.build_number }}');
    expect(workflows['ios.yml']).toContain('MARKETING_VERSION="$VERSION" CURRENT_PROJECT_VERSION="$BUILD_NUMBER"');
    // 1.1.0 builds 10100, and each later version a higher number while minor and patch stay below 100.
    const build = new Function('MAJOR', 'MINOR', 'PATCH', `return ${formula};`) as (major: number, minor: number, patch: number) => number;
    expect(build(1, 1, 0)).toBe(10100);
    const numbers = ['1.0.0', '1.0.1', '1.1.0', '1.9.99', '1.10.0', '2.0.0'].map((v) => {
      const [major, minor, patch] = v.split('.').map(Number);
      return build(major, minor, patch);
    });
    expect(numbers).toEqual([...new Set(numbers)].sort((a, b) => a - b));
  });

  it('explain the secrets without dashes', () => {
    expect(/[‒–—―−]/.test(guide), 'store/SECRETS.md: dash').toBe(false);
    const prose = guide.replace(/```[\s\S]*?```/g, '').split('\n');
    expect(prose.filter((line) => /(^|\s)-(\s|$)/.test(line)), 'store/SECRETS.md: hyphen used as a dash').toEqual([]);
  });
});

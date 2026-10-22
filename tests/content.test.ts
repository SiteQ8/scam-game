import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import data from '../app/src/content/cards.json';

describe('card content', () => {
  it('passes the content validator', () => {
    const out = execFileSync('node', ['scripts/validate-content.mjs'], { encoding: 'utf8' });
    expect(out).toContain('OK');
  });
  it('the bundled content matches the source cards', () => {
    const src = execFileSync('node', ['-e', "const fs=require('fs');let n=0;for(const f of fs.readdirSync('content/cards'))if(f.endsWith('.json'))n+=JSON.parse(fs.readFileSync('content/cards/'+f,'utf8')).length;console.log(n)"], { encoding: 'utf8' });
    expect((data as unknown[]).length).toBe(Number(src.trim()));
  });
});

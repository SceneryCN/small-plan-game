#!/usr/bin/env node
/**
 * Build with Vite `base` suitable for GitHub Pages, then push `dist/` to branch `gh-pages`.
 *
 * Usage:
 *   npm run deploy
 *
 * Optional env (override auto-detect):
 *   GH_PAGES_BASE=/my-repo/   — project site (must end with /)
 *   GH_PAGES_BASE=/          — user/organization root site (*.github.io)
 *
 * Auto-detect order: GH_PAGES_BASE → GITHUB_REPOSITORY → git remote origin → package.json name
 *
 * After first deploy: GitHub repo → Settings → Pages → Build: Deploy from branch → Branch: gh-pages / (root).
 */

import { execSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function parseGithubRemote(repoUrl) {
  const m = String(repoUrl).match(/github\.com[:/]([^/]+)\/([^/.]+)/i);
  if (!m) return null;
  return { owner: m[1], name: m[2] };
}

function normalizeBase(b) {
  if (b === '/' || b === '') return '/';
  let s = String(b).trim();
  if (!s.startsWith('/')) s = `/${s}`;
  if (!s.endsWith('/')) s += '/';
  return s;
}

function inferBase() {
  if (process.env.GH_PAGES_BASE !== undefined && process.env.GH_PAGES_BASE !== '') {
    return normalizeBase(process.env.GH_PAGES_BASE);
  }
  if (process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    if (repo?.endsWith('.github.io')) return '/';
    return normalizeBase(`/${repo}/`);
  }
  try {
    const url = execSync('git remote get-url origin', { encoding: 'utf8', cwd: root }).trim();
    const p = parseGithubRemote(url);
    if (p) {
      if (p.name.endsWith('.github.io')) return '/';
      return normalizeBase(`/${p.name}/`);
    }
  } catch {
    /* no git remote */
  }
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  return normalizeBase(`/${pkg.name}/`);
}

function run(cmd, extraEnv = {}) {
  const r = spawnSync(cmd, {
    shell: true,
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env, ...extraEnv },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const base = inferBase();
console.log(`[deploy-github] Using base path: ${base} (set GH_PAGES_BASE to override)`);

run('npm run build', { GH_PAGES_BASE: base });

const msg = `deploy-${Date.now()}`;
run(`npx gh-pages -d dist -b gh-pages -m "${msg}" --nojekyll`);

console.log('[deploy-github] Pushed to branch gh-pages.');
console.log('[deploy-github] Enable Pages: Settings → Pages → Source: Deploy from branch → gh-pages / (root).');

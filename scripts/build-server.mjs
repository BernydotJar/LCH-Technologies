import { build } from 'esbuild';

await build({
  entryPoints: ['server/entry.ts'],
  outfile: 'dist/server.mjs',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  packages: 'external',
  banner: { js: '// LCH immutable same-origin Donna API + static site server' },
  logLevel: 'warning',
});
console.log('Donna API bundled: dist/server.mjs');

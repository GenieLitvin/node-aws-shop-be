const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['./lambda/*.ts'],
  bundle: true,
  platform: 'node',
  target: 'node14',
  outdir: 'dist',
  format: 'cjs'
}).catch(() => process.exit(1));
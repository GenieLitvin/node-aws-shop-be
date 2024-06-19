const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['./lambda/getProductsList.ts', './lambda/getProductsById.ts'],
  bundle: true,
  platform: 'node',
  target: 'node14',
  outdir: 'dist',
  format: 'cjs'
}).catch(() => process.exit(1));
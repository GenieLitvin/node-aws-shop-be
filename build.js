// eslint-disable-next-line @typescript-eslint/no-var-requires
const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['./*-service/**/lambda/*.ts'],
    bundle: true,
    platform: 'node',
    target: 'node14',
    outdir: 'dist',
    format: 'cjs',
  })
  .catch(() => process.exit(1));

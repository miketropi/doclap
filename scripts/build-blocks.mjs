/**
 * build-blocks.mjs
 * Builds all blocks in the ./blocks directory using esbuild.
 * Usage:
 *   node ./scripts/build-blocks.mjs           → production build
 *   node ./scripts/build-blocks.mjs --watch   → watch mode
 */

import esbuild from 'esbuild';
import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

const isWatch = process.argv.includes('--watch');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toWpHandle(pkg) {
  return pkg.replace('@wordpress/', 'wp-').replace(/\//g, '-');
}

function writeAssetFile(entryFile, dependencies) {
  const dir = path.dirname(entryFile);
  const version = Date.now().toString();
  const depsPhp = dependencies.map((d) => `'${d}'`).join(', ');
  const content = `<?php return [ 'dependencies' => [ ${depsPhp} ], 'version' => '${version}' ];\n`;
  fs.writeFileSync(path.join(dir, 'index.asset.php'), content, 'utf8');
}

// ---------------------------------------------------------------------------
// WordPress packages → window.wp.* globals
//
// Raw external[] causes "Dynamic require is not supported" when esbuild
// bundles CJS npm packages into IIFE format. Instead, we intercept every
// @wordpress/* import with a plugin and replace it with a tiny shim that
// reads the already-loaded global from window.wp.*.
// ---------------------------------------------------------------------------

const WP_PACKAGES = [
  '@wordpress/blocks',
  '@wordpress/block-editor',
  '@wordpress/server-side-render',
  '@wordpress/components',
  '@wordpress/element',
  '@wordpress/i18n',
  '@wordpress/hooks',
  '@wordpress/data',
  '@wordpress/core-data',
  '@wordpress/compose',
  '@wordpress/primitives',
  '@wordpress/blob',
  '@wordpress/notices',
  '@wordpress/plugins',
];

const WP_HANDLES = WP_PACKAGES.map(toWpHandle);

/**
 * esbuild plugin — maps @wordpress/* imports to window.wp.* globals.
 *
 * e.g. import { registerBlockType } from '@wordpress/blocks'
 *      → const { registerBlockType } = window.wp.blocks
 */
const wpExternalsPlugin = {
  name: 'wp-externals',
  setup(build) {
    build.onResolve({ filter: /^@wordpress\// }, (args) => ({
      path: args.path,
      namespace: 'wp-external',
    }));

    build.onLoad({ filter: /.*/, namespace: 'wp-external' }, (args) => {
      // @wordpress/block-editor → wp.blockEditor
      const globalName = args.path
        .replace('@wordpress/', '')
        .replace(/-([a-z])/g, (_, l) => l.toUpperCase());

      return {
        contents: `module.exports = window.wp['${globalName}'];`,
        loader: 'js',
      };
    });
  },
};

// ---------------------------------------------------------------------------
// esbuild config
// ---------------------------------------------------------------------------

const entryPoints = await glob('./blocks/*/index.{ts,tsx}');
const viewEntryPoints = await glob('./blocks/*/view.ts');

if (entryPoints.length === 0) {
  console.warn('⚠️  No block entry points found in ./blocks/*/index.{ts,tsx}');
  process.exit(0);
}

if (!isWatch) {
  console.log(`🔍 Found ${entryPoints.length} block(s):`, entryPoints);
}

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
  entryPoints,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  jsxImportSource: 'react',
  sourcemap: isWatch ? 'inline' : false,
  minify: !isWatch,
  logLevel: isWatch ? 'warning' : 'info',
  plugins: [wpExternalsPlugin],
  define: {
    'process.env.NODE_ENV': isWatch ? '"development"' : '"production"',
  },
  outdir: '.',
  outbase: '.',
};

// ---------------------------------------------------------------------------
// Asset file plugin (shared between build + watch)
// ---------------------------------------------------------------------------

const assetWriterPlugin = {
  name: 'asset-writer',
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length) return;
      entryPoints.forEach((entry) => {
        const outFile = entry.replace(/\.tsx?$/, '.js');
        if (fs.existsSync(outFile)) {
          writeAssetFile(outFile, WP_HANDLES);
        }
      });
      const t = new Date().toTimeString().slice(0, 8);
      console.log(`${t}  blocks rebuilt (${entryPoints.length})`);
    });
  },
};

// ---------------------------------------------------------------------------
// Build or watch
// ---------------------------------------------------------------------------

/** Front-end view bundles (canvas / WebGL / interaction) — no @wordpress/* externals. */
const viewBuildOptions = {
  entryPoints: viewEntryPoints,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  minify: !isWatch,
  logLevel: isWatch ? 'warning' : 'info',
  sourcemap: isWatch ? 'inline' : false,
  outdir: '.',
  outbase: '.',
};

async function buildViewBundles() {
  if (!viewEntryPoints.length) {
    return;
  }
  const r = await esbuild.build(viewBuildOptions);
  if (r.errors.length) {
    console.error('❌ View script build errors:', r.errors);
    process.exit(1);
  }
  viewEntryPoints.forEach((entry) => {
    const base = entry.replace(/\.ts$/, '');
    const js = `${base}.js`;
    const css = `${base}.css`;
    const dir = path.dirname(entry);
    const version = Date.now().toString();
    const assetPhp = `<?php\n\ndeclare( strict_types=1 );\n\nreturn array( 'dependencies' => array(), 'version' => '${version}' );\n`;
    fs.writeFileSync(path.join(dir, 'view.asset.php'), assetPhp, 'utf8');
    if (fs.existsSync(js)) {
      console.log(`  ✓ ${js}`);
    }
    if (fs.existsSync(css)) {
      console.log(`  ✓ ${css}`);
    }
  });
}

if (isWatch) {
  const ctx = await esbuild.context({
    ...buildOptions,
    plugins: [...buildOptions.plugins, assetWriterPlugin],
  });

  await ctx.watch();

  if (viewEntryPoints.length) {
    const vctx = await esbuild.context({
      ...viewBuildOptions,
      plugins: [
        {
          name: 'view-rebuild-log',
          setup(b) {
            b.onEnd(() => {
              const t = new Date().toTimeString().slice(0, 8);
              console.log(`${t}  view script(s) rebuilt (${viewEntryPoints.length})`);
            });
          },
        },
      ],
    });
    await vctx.watch();
  }

  console.log(
    `Watching ${entryPoints.length} block(s) under ./blocks/*/index.{ts,tsx}  ·  Ctrl+C to stop`
  );
  if (viewEntryPoints.length) {
    console.log(`Watching ${viewEntryPoints.length} view bundle(s) under ./blocks/*/view.ts`);
  }
} else {
  const result = await esbuild.build(buildOptions);

  if (result.errors.length) {
    console.error('❌ Build errors:', result.errors);
    process.exit(1);
  }

  entryPoints.forEach((entry) => {
    const outFile = entry.replace(/\.tsx?$/, '.js');
    if (fs.existsSync(outFile)) {
      writeAssetFile(outFile, WP_HANDLES);
      console.log(`  ✓ ${outFile}`);
      console.log(`  ✓ ${path.dirname(outFile)}/index.asset.php`);
    }
  });

  await buildViewBundles();

  console.log('\n✅ All blocks built successfully.');
}

#!/usr/bin/env node
/**
 * Build the front-end entry into assets/js with WordPress global externalization.
 *
 * Usage:
 *   node ./scripts/build-ts.mjs           → production build
 *   node ./scripts/build-ts.mjs --watch   → watch mode
 */

import * as esbuild from 'esbuild';

const isWatch = process.argv.includes( '--watch' );

/**
 * Maps `@wordpress/*` packages to `window.wp.*` globals.
 */
const wpGlobalPlugin = {
	name: 'wp-globals',
	setup( build ) {
		build.onResolve( { filter: /^@wordpress\// }, ( args ) => {
			return { path: args.path, namespace: 'wp-globals' };
		} );

		build.onLoad( { filter: /.*/, namespace: 'wp-globals' }, ( args ) => {
			const name = args.path.replace( /^@wordpress\//, '' );
			// Convert kebab-case to camelCase: e.g. block-editor -> blockEditor
			const camel = name.replace( /-([a-z])/g, ( _, g ) => g.toUpperCase() );
			return {
				contents: `module.exports = ( typeof window !== 'undefined' && window.wp && window.wp.${ camel } ) ? window.wp.${ camel } : {};`,
				loader: 'js',
			};
		} );
	},
};

const entries = [
	{
		entryPoint: './resources/ts/main.ts',
		outfile: './assets/js/main.js',
	},
];

const buildOptions = ( entryPoint, outfile ) => ( {
	entryPoints: [ entryPoint ],
	bundle: true,
	outfile,
	target: 'es2020',
	platform: 'browser',
	minify: ! isWatch,
	sourcemap: isWatch,
	plugins: [ wpGlobalPlugin ],
} );

if ( isWatch ) {
	const contexts = await Promise.all(
		entries.map( ( { entryPoint, outfile } ) =>
			esbuild.context( buildOptions( entryPoint, outfile ) ),
		),
	);
	await Promise.all( contexts.map( ( context ) => context.watch() ) );
	console.log( 'Watching TypeScript entries...' );
} else {
	await Promise.all(
		entries.map( ( { entryPoint, outfile } ) =>
			esbuild.build( buildOptions( entryPoint, outfile ) ),
		),
	);
	console.log( '✓ assets/js/main.js' );
}

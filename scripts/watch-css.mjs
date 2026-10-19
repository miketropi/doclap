#!/usr/bin/env node
/**
 * Watch the CSS entry point and its @source inputs.
 *
 * Paths come from tailwind-watch.config.json so the watcher and the Tailwind
 * @source globs stay in sync.
 */

import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const configPath = path.join( ROOT, 'tailwind-watch.config.json' );

let paths = [ 'resources/css', 'blocks', 'patterns', 'templates', 'parts' ];
let extraIgnore = [];

if ( existsSync( configPath ) ) {
	const config = JSON.parse( readFileSync( configPath, 'utf8' ) );
	if ( Array.isArray( config.paths ) && config.paths.length ) {
		paths = config.paths;
	}
	if ( Array.isArray( config.ignore ) ) {
		extraIgnore = config.ignore;
	}
}

const ignores = [
	'**/node_modules/**',
	'**/vendor/**',
	'assets',
	...extraIgnore,
].map( ( value ) => `-i "${ value }"` ).join( ' ' );

const command = `postcss ./resources/css/app.css -o ./assets/css/app.css && postcss ./resources/css/editor.css -o ./assets/css/editor.css`;

console.log( `Watching ${ paths.join( ', ' ) } → assets/css/app.css, assets/css/editor.css` );

const child = spawn(
	'node',
	[ 'node_modules/chokidar-cli/index.js', ...paths, ignores, '-c', command ].filter( Boolean ),
	{ cwd: ROOT, stdio: 'inherit', shell: true },
);

child.on( 'exit', ( code ) => process.exit( code ?? 0 ) );

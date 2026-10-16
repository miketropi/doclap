#!/usr/bin/env node
/**
 * Package the theme into a distributable ZIP for WordPress.
 *
 * Reads DOCLAP_VERSION from inc/bootstrap/version.php and creates
 * {theme-slug}-v{version}.zip in the theme root directory.
 *
 * Usage:
 *   npm run build:package
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const ROOT = path.resolve( __dirname, '..' );
const THEME_SLUG = path.basename( ROOT );

function readVersion() {
	const versionPhp = fs.readFileSync(
		path.join( ROOT, 'inc', 'bootstrap', 'version.php' ),
		'utf8',
	);
	const m = versionPhp.match( /define\(\s*'DOCLAP_VERSION'\s*,\s*'([^']+)'\s*\)/ );
	if ( ! m ) {
		console.error( 'Could not parse DOCLAP_VERSION from inc/bootstrap/version.php' );
		process.exit( 1 );
	}
	return m[ 1 ];
}

function run( cmd ) {
	return execSync( cmd, { stdio: 'inherit', cwd: ROOT } );
}

const version = readVersion();
const zipName = `${ THEME_SLUG }-v${ version }.zip`;
const zipPath = path.join( ROOT, zipName );

if ( fs.existsSync( zipPath ) ) {
	fs.unlinkSync( zipPath );
}

const excludes = [
	// Tooling & dependencies
	`${ THEME_SLUG }/node_modules/*`,
	`${ THEME_SLUG }/vendor/bin/*`,
	`${ THEME_SLUG }/vendor/friendsofphp/*`,
	`${ THEME_SLUG }/vendor/phpstan/*`,
	`${ THEME_SLUG }/vendor/phpunit/*`,
	`${ THEME_SLUG }/vendor/szepeviktor/*`,
	`${ THEME_SLUG }/vendor/sebastian/*`,
	`${ THEME_SLUG }/vendor/nikic/*`,
	`${ THEME_SLUG }/vendor/theseer/*`,
	`${ THEME_SLUG }/vendor/myclabs/*`,
	`${ THEME_SLUG }/vendor/phar-io/*`,
	`${ THEME_SLUG }/vendor/staabm/*`,
	`${ THEME_SLUG }/vendor/php-stubs/*`,
	`${ THEME_SLUG }/vendor/clue/*`,
	`${ THEME_SLUG }/vendor/ergebnis/*`,
	`${ THEME_SLUG }/vendor/evenement/*`,
	`${ THEME_SLUG }/vendor/fidry/*`,
	`${ THEME_SLUG }/vendor/psr/*`,
	`${ THEME_SLUG }/vendor/react/*`,
	`${ THEME_SLUG }/vendor/symfony/*`,
	'*.zip',

	// Local environment
	`${ THEME_SLUG }/.env`,

	// VCS & CI
	`${ THEME_SLUG }/.git/*`,
	`${ THEME_SLUG }/.github/*`,
	`${ THEME_SLUG }/.gitignore`,
	`${ THEME_SLUG }/.nvmrc`,

	// Agent/tooling config
	`${ THEME_SLUG }/.cursor/*`,
	`${ THEME_SLUG }/.opencode/*`,
	`${ THEME_SLUG }/.codegraph/*`,
	`${ THEME_SLUG }/.claude/*`,
	`${ THEME_SLUG }/AGENTS.md`,
	`${ THEME_SLUG }/.mcp.json`,
	`${ THEME_SLUG }/README.md`,

	// Sources (compiled output lives in assets/ and blocks/*/index.js)
	`${ THEME_SLUG }/resources/*`,
	`${ THEME_SLUG }/scripts/*`,
	`${ THEME_SLUG }/docs/*`,
	`${ THEME_SLUG }/blocks/*/*.ts`,
	`${ THEME_SLUG }/blocks/*/*.tsx`,
	`${ THEME_SLUG }/blocks/*/*.d.ts`,

	// Test tooling
	`${ THEME_SLUG }/tests/*`,
	`${ THEME_SLUG }/.phpunit.cache/*`,
	`${ THEME_SLUG }/phpunit.xml.dist`,

	// Dev tool config
	`${ THEME_SLUG }/blueprint.json`,
	`${ THEME_SLUG }/composer.json`,
	`${ THEME_SLUG }/composer.lock`,
	`${ THEME_SLUG }/package.json`,
	`${ THEME_SLUG }/package-lock.json`,
	`${ THEME_SLUG }/phpstan-bootstrap.php`,
	`${ THEME_SLUG }/phpstan.neon`,
	`${ THEME_SLUG }/tsconfig.json`,
	`${ THEME_SLUG }/postcss.config.mjs`,
	`${ THEME_SLUG }/tailwind-watch.config.json`,
	`${ THEME_SLUG }/.php-cs-fixer.dist.php`,
	`${ THEME_SLUG }/.php-cs-fixer.cache`,

	// Sourcemaps are development-only
	`${ THEME_SLUG }/assets/js/*.map`,
];

function prepareProductionAutoloader() {
	console.log( 'Generating production autoloader (no-dev)...' );
	run( 'composer dump-autoload --no-dev --optimize' );
}

function restoreDevAutoloader() {
	console.log( 'Restoring development autoloader...' );
	run( 'composer dump-autoload' );
}

const excludeArgs = excludes.map( ( entry ) => `-x "${ entry }"` ).join( ' ' );
const cmd = `cd "${ path.dirname( ROOT ) }" && zip -r "${ zipPath }" "${ THEME_SLUG }/" ${ excludeArgs }`;

console.log( `Packaging ${ THEME_SLUG } v${ version } → ${ zipName }` );
try {
	prepareProductionAutoloader();
	run( cmd );
	console.log( `Created ${ zipPath }` );
} finally {
	restoreDevAutoloader();
}

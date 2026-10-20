#!/usr/bin/env bash
#
# Doclap smoke test.
#
# The assertions live in tests/smoke/assertions.php and check the contract the
# theme depends on: the child-theme relationship with Nextora, registration of
# every doclap/* block, theme.json parsing (and its merge with the parent), the
# declared font faces and compiled assets, the contact REST route, the insertion
# patterns, the inner-page section schemas, the template compositions, and a
# front-end render of every section block with its defaults.
#
# Two ways to run them:
#
#   npm run test:wp              # isolated: throwaway WordPress via Playground,
#                                # with the local Nextora and Doclap themes mounted
#   npm run test:wp -- --wp-cli  # against an existing WordPress through WP-CLI
#
# The WP-CLI mode uses `WP_CLI_CMD` (a full command line, for example a wrapper that
# knows about a Local by Flywheel MySQL socket) or, when that is unset, `wp` with
# `WP_PATH` (default: the WordPress install this theme lives in).

set -euo pipefail

cd "$(dirname "$0")/.."

THEME_DIR="$(pwd)"
PARENT_THEME="$(cd .. && pwd)/nextora"
BLUEPRINT="${BLUEPRINT:-blueprint.json}"
OUTPUT="$(mktemp -t doclap-wp-test)"
MODE="playground"

for arg in "$@"; do
	if [ "$arg" = "--wp-cli" ]; then
		MODE="wp-cli"
	fi
done

trap 'rm -f "$OUTPUT"' EXIT

# One long command per mode; failures are captured rather than aborting the script.
ASSERT_COMMAND="require '$THEME_DIR/tests/smoke/assertions.php';"

if [ "$MODE" = "wp-cli" ]; then
	WP_PATH="${WP_PATH:-$(cd ../../.. && pwd)}"

	echo "Running Doclap smoke assertions through WP-CLI (${WP_PATH})..."

	if [ -n "${WP_CLI_CMD:-}" ]; then
		# shellcheck disable=SC2086 # WP_CLI_CMD is intentionally word-split.
		run_command=( ${WP_CLI_CMD} eval "$ASSERT_COMMAND" )
	else
		run_command=( wp --path="$WP_PATH" eval "$ASSERT_COMMAND" )
	fi
else
	echo "Running Doclap smoke assertions in an isolated WordPress (Playground)..."

	run_command=(
		npx --yes @wp-playground/cli@latest run-blueprint
		--blueprint="$BLUEPRINT"
		--mount-dir "$PARENT_THEME" "/wordpress/wp-content/themes/nextora"
		--mount-dir "$THEME_DIR" "/wordpress/wp-content/themes/doclap"
	)
fi

"${run_command[@]}" >"$OUTPUT" 2>&1 || true

cat "$OUTPUT"

failures=0
for marker in \
	'DOCLAP-OK child-theme' \
	'DOCLAP-OK blocks' \
	'DOCLAP-OK theme-json' \
	'DOCLAP-OK fonts' \
	'DOCLAP-OK rest-route' \
	'DOCLAP-OK patterns' \
	'DOCLAP-OK inner-page-schema' \
	'DOCLAP-OK header-nav' \
	'DOCLAP-OK renders'; do
	if grep -q "$marker" "$OUTPUT"; then
		echo "  ✓ $marker"
	else
		echo "  ✗ $marker" >&2
		failures=$((failures + 1))
	fi
done

if grep -q 'DOCLAP-FAIL' "$OUTPUT"; then
	echo 'FAIL: an assertion reported a failure:' >&2
	grep 'DOCLAP-FAIL' "$OUTPUT" >&2
	exit 1
fi

if grep -q 'PHP Fatal error' "$OUTPUT"; then
	echo 'FAIL: a PHP fatal error occurred during the smoke run:' >&2
	grep 'PHP Fatal error' "$OUTPUT" | head -10 >&2
	exit 1
fi

if grep -E 'PHP (Warning|Notice|Deprecated)' "$OUTPUT" | grep -qE 'themes/(doclap|nextora)'; then
	echo 'FAIL: the Doclap or Nextora source raised PHP diagnostics:' >&2
	grep -E 'PHP (Warning|Notice|Deprecated)' "$OUTPUT" | grep -E 'themes/(doclap|nextora)' | head -10 >&2
	exit 1
fi

if [ "$failures" -gt 0 ]; then
	echo "FAIL: ${failures} smoke assertion(s) did not run." >&2
	exit 1
fi

echo 'PASS: the Doclap contract holds under WordPress.'

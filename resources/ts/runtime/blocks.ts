/**
 * Per-root bootstrap shared by every Doclap view bundle.
 *
 * Extracted from the proven `home-hero` / `home-work` lifecycle so all bundles
 * agree on how a block boots:
 *
 *   * a root boots once — the `data-initialized` marker is set before `init()`
 *     runs, so duplicated bundles, duplicated blocks and re-inserted roots never
 *     double-bind;
 *   * roots added later are picked up by one module-level observer;
 *   * roots that leave the document are torn down and their marker released, so
 *     the same element boots again when it is re-inserted.
 *
 * The bundle owns the module instance, so the observer is created once per
 * bundle and never per root.
 */

/**
 * Options accepted by {@link bootBlocks}.
 */
export interface BootOptions< T extends HTMLElement > {
	/** Called for every matching root; may return a teardown callback. */
	init: ( root: T ) => ( () => void ) | void;
}

interface Registration {
	selector: string;
	init: ( root: HTMLElement ) => ( () => void ) | void;
}

const registrations: Registration[] = [];
const teardowns = new WeakMap< HTMLElement, () => void >();
const live = new Set< HTMLElement >();

let observer: MutationObserver | undefined;
let ready = false;
let listening = false;

/**
 * Initialise one root, if it has not been initialised already.
 *
 * @param root Root element.
 * @param init Bundle initialiser.
 */
function initRoot(
	root: HTMLElement,
	init: ( element: HTMLElement ) => ( () => void ) | void,
): void {
	if ( "1" === root.dataset.initialized ) {
		return;
	}

	root.dataset.initialized = "1";
	live.add( root );

	const teardown = init( root );

	if ( "function" === typeof teardown ) {
		teardowns.set( root, teardown );
	}
}

/**
 * Boot every matching root that has not been initialised yet.
 */
function scan(): void {
	registrations.forEach( ( registration ) => {
		document
			.querySelectorAll< HTMLElement >( registration.selector )
			.forEach( ( root ) => initRoot( root, registration.init ) );
	} );
}

/**
 * Release every initialised root that is no longer in the document.
 *
 * The marker is deleted before the teardown runs so a root that is re-inserted
 * later boots again instead of being skipped as already initialised.
 */
function releaseDetached(): void {
	live.forEach( ( root ) => {
		if ( root.isConnected ) {
			return;
		}

		const teardown = teardowns.get( root );
		teardowns.delete( root );
		live.delete( root );

		delete root.dataset.initialized;

		if ( teardown ) {
			teardown();
		}
	} );
}

/**
 * Create the module-level observer once, on first boot.
 */
function ensureObserver(): void {
	if ( observer ) {
		return;
	}

	observer = new MutationObserver( ( records: MutationRecord[] ): void => {
		const hasAdditions = records.some(
			( record: MutationRecord ): boolean => record.addedNodes.length > 0,
		);

		if ( hasAdditions ) {
			scan();
		}

		releaseDetached();
	} );

	observer.observe( document.documentElement, {
		childList: true,
		subtree: true,
	} );
}

/**
 * Start scanning and watching: immediately when the document is already parsed,
 * otherwise once `DOMContentLoaded` fires.
 */
function observe(): void {
	if ( ! ready ) {
		if ( "loading" === document.readyState ) {
			if ( ! listening ) {
				listening = true;
				document.addEventListener(
					"DOMContentLoaded",
					(): void => {
						ready = true;
						observe();
					},
					{ once: true },
				);
			}

			return;
		}

		ready = true;
	}

	ensureObserver();
	scan();
}

/**
 * Boot every matching root and watch the document for roots added later.
 *
 * @param selector Root selector, e.g. `.doclap-home-hero`.
 * @param init     Called once per root; may return a teardown callback.
 */
export function bootBlocks< T extends HTMLElement >(
	selector: string,
	init: ( root: T ) => ( () => void ) | void,
): void {
	registrations.push( {
		selector,
		init: init as ( root: HTMLElement ) => ( () => void ) | void,
	} );

	observe();
}

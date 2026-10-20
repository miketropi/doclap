/**
 * Repeater controls shared by the Doclap block editors.
 *
 * One generic list editor keeps every block's inspector consistent: the list
 * shows a compact row per item (sequence number, label, actions) and the fields
 * of one item are edited in a WordPress `Modal`, so a repeater with ten items no
 * longer floods the panel with ten permanently open forms. Bundled into each
 * block's editor script by esbuild, so no extra WordPress script handle is
 * needed.
 *
 * The list is a document-like structure edited by buttons, so it needs a live
 * report of what each mutation did: a single per-instance status region is
 * rendered from the first render (so assistive technology is already observing it
 * when the text changes) and announces the outcome of add, duplicate, move,
 * remove and the minimum-items limit.
 *
 * Item keys stay positional indexes: items are plain attribute records with no
 * identity of their own, and adding an `id` field would change the persisted
 * attribute shape of twenty-five shipped blocks. The open editor therefore keeps its
 * own immutable draft and writes it back to the list exactly once, on `Done`.
 * Every `onChange` receives a brand-new array of brand-new item objects, so no
 * caller and no undo snapshot ever observes a stored record mutated in place.
 *
 * Nesting: a caller may render a second repeater inside an item editor through
 * `renderItemExtras`. WordPress' `Modal` dismisses every other modal of its React
 * context when it mounts and modalizes the whole document, so a nested repeater
 * must not stack a second dialog: it expands in place inside the already open
 * editor instead, with the same draft, commit, cancel and focus-return semantics.
 */

import {
	Button,
	DropdownMenu,
	Modal,
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';
import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';

import Icon from './icons';
import RichTextControl from './rich-text-control';

export interface RepeaterField {
	key: string;
	label: string;
	help?: string;
	control?: 'text' | 'textarea' | 'select' | 'toggle' | 'rich';
	options?: Array<{ label: string; value: string }>;
	placeholder?: string;
	/** `control: 'rich'` only: element the stored HTML represents. Default `p`. */
	tagName?: 'p' | 'h2' | 'h3' | 'span' | 'li';
	/** `control: 'rich'` only: allow line breaks. Default `false`. */
	multiline?: boolean;
}

export type RepeaterItem = Record<string, unknown>;

export interface RepeaterProps {
	label: string;
	items: RepeaterItem[];
	fields: RepeaterField[];
	onChange: (items: RepeaterItem[]) => void;
	createItem: () => RepeaterItem;
	getItemLabel?: (item: RepeaterItem, index: number) => string;
	addLabel?: string;
	emptyLabel?: string;
	/** Number of items that must stay in the list; removal is blocked at or below it. */
	minimumItems?: number;
	/**
	 * Extra controls rendered inside this item's editor, below the declared fields.
	 * `draft` is the live draft item; `update` patches it immutably. Used to nest a
	 * second `Repeater` inside the same editor.
	 */
	renderItemExtras?: (
		draft: RepeaterItem,
		update: (patch: Partial<RepeaterItem>) => void,
		index: number,
	) => React.ReactNode;
}

type RepeaterAction = 'added' | 'duplicated' | 'movedUp' | 'movedDown' | 'removed';

/**
 * Marks the subtree of an item editor. A repeater that finds itself inside one
 * edits its items in place (an expandable sublist) instead of opening a second
 * dialog, so a caller nests repeaters with identical code either way.
 */
const ItemEditorContext = createContext<boolean>(false);

/**
 * Named entities a rich label can carry once its tags are gone. Every stored
 * label is HTML escaping-encoded by the block editor, so the common ones are
 * decoded back before the value is used as a row label.
 */
const DECODED_ENTITIES: Record<string, string> = {
	'#39': "'",
	amp: '&',
	apos: "'",
	gt: '>',
	lt: '<',
	nbsp: ' ',
	quot: '"',
};

/**
 * Plain text of a stored label: a label may hold rich HTML (a merged accent
 * heading is stored as one HTML heading), so tags are stripped and whitespace
 * collapsed before the value is used as a row label.
 */
function plainLabel(value: unknown): string {
	return String(value ?? '')
		.replace(/<[^>]*>/g, ' ')
		.replace(
			/&(amp|lt|gt|quot|apos|nbsp|#39);/g,
			(...match: string[]) => DECODED_ENTITIES[match[1]] ?? match[0],
		)
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Positional label, e.g. `Motion with intent`, falling back to a generated name
 * when the block supplies no label of its own.
 */
function itemLabel(
	item: RepeaterItem,
	index: number,
	getItemLabel?: RepeaterProps['getItemLabel'],
): string {
	const custom = getItemLabel?.(item, index);

	if (custom) {
		return custom;
	}

	const first = plainLabel(item.label ?? item.heading ?? item.title);

	return first || sprintf(__('Item %d', 'doclap'), index + 1);
}

/**
 * Translated announcement for one list mutation.
 *
 * @param action Mutation that just happened.
 * @param label  Repeater label, e.g. `Services`.
 * @return Sentence for the status region.
 */
function actionMessage(action: RepeaterAction, label: string): string {
	switch (action) {
		case 'added':
			return sprintf(__('%s: one item added.', 'doclap'), label);
		case 'duplicated':
			return sprintf(__('%s: one item duplicated.', 'doclap'), label);
		case 'movedUp':
			return sprintf(__('%s: item moved up.', 'doclap'), label);
		case 'movedDown':
			return sprintf(__('%s: item moved down.', 'doclap'), label);
		case 'removed':
			return sprintf(__('%s: one item removed.', 'doclap'), label);
	}
}

export function Repeater({
	label,
	items,
	fields,
	onChange,
	createItem,
	getItemLabel,
	addLabel,
	emptyLabel,
	minimumItems = 0,
	renderItemExtras,
}: RepeaterProps): JSX.Element {
	const [status, setStatus] = useState<string>('');
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const [draft, setDraft] = useState<RepeaterItem | null>(null);
	const [insideModal, setInsideModal] = useState<boolean>(false);
	const nested = useContext(ItemEditorContext);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const openIndexRef = useRef<number | null>(null);

	/**
	 * Fallback detection for a repeater dropped into somebody else's modal: the
	 * context above covers the repeaters we render ourselves.
	 */
	useEffect(() => {
		const root = rootRef.current;

		if (root && root.closest('.components-modal__frame')) {
			setInsideModal(true);
		}
	}, []);

	const inlineEditor = nested || insideModal;
	const listLocked = inlineEditor && openIndex !== null;

	const atMinimum = minimumItems > 0 && items.length <= minimumItems;
	const limitMessage = atMinimum
		? sprintf(
				/* translators: 1: repeater label, 2: required number of items. */
				_n(
					'%1$s: at least %2$d item is required, so nothing more can be removed.',
					'%1$s: at least %2$d items are required, so nothing more can be removed.',
					minimumItems,
					'doclap',
				),
				label,
				minimumItems,
			)
		: '';

	/**
	 * Closing discards the draft and the tracked index; the committed list is
	 * never touched by `Cancel`, `Escape` or the modal's close button.
	 */
	const closeEditor = (): void => {
		setOpenIndex(null);
		setDraft(null);
	};

	/**
	 * Focus goes back to the row that opened the editor — the one control that
	 * always exists, whether the editor was opened from the row body, by
	 * duplicating an item or by adding one. `Modal` returns focus on its own as
	 * well; doing it here keeps the target explicit and gives the in-place nested
	 * editor the same behaviour.
	 */
	useEffect(() => {
		if (openIndex !== null) {
			return;
		}

		const index = openIndexRef.current;
		openIndexRef.current = null;

		if (index === null) {
			return;
		}

		rootRef.current
			?.querySelectorAll<HTMLElement>('.doclap-repeater__row-main')
			[index]?.focus();
	}, [openIndex]);

	const openEditor = (index: number, item: RepeaterItem): void => {
		openIndexRef.current = index;
		setDraft({ ...item });
		setOpenIndex(index);
	};

	const updateDraft = (patch: Partial<RepeaterItem>): void => {
		setDraft((current) => (current === null ? current : { ...current, ...patch }));
	};

	const commitDraft = (): void => {
		// The item can disappear under an open editor (undo), and a stale index
		// would otherwise write a sparse array back to the block attributes.
		if (openIndex === null || draft === null || openIndex >= items.length) {
			closeEditor();

			return;
		}

		const next = items.map((entry) => ({ ...entry }));
		next[openIndex] = { ...draft };

		onChange(next);
		closeEditor();
	};

	const move = (index: number, offset: number): void => {
		const target = index + offset;

		if (target < 0 || target >= items.length) {
			return;
		}

		const next = items.map((entry) => ({ ...entry }));
		[next[index], next[target]] = [next[target], next[index]];

		onChange(next);
		setStatus(actionMessage(offset < 0 ? 'movedUp' : 'movedDown', label));
	};

	const duplicate = (index: number): void => {
		const copy = { ...items[index] };
		const next = items.map((entry) => ({ ...entry }));

		next.splice(index + 1, 0, copy);

		onChange(next);
		setStatus(actionMessage('duplicated', label));
		openEditor(index + 1, copy);
	};

	const remove = (index: number): void => {
		onChange(
			items
				.map((entry) => ({ ...entry }))
				.filter((_, position) => position !== index),
		);
		setStatus(actionMessage('removed', label));
	};

	const add = (): void => {
		const item = createItem();
		const next = [...items.map((entry) => ({ ...entry })), item];

		onChange(next);
		setStatus(actionMessage('added', label));
		openEditor(next.length - 1, item);
	};

	/**
	 * One item's fields, plus whatever the caller nests below them. Rendered once
	 * for the open item only, inside the item modal or in place for a nested
	 * repeater.
	 *
	 * @param index Position of the item being edited.
	 * @param item  Live draft item.
	 * @return Fields and the editor's actions.
	 */
	const renderItemEditor = (
		index: number,
		item: RepeaterItem,
		withActions: boolean,
	): JSX.Element => (
		<>
			<div className="doclap-repeater__modal-fields">
				{fields.map((field) => {
					const value = item[field.key];

					if (field.control === 'rich') {
						return (
							<RichTextControl
								key={field.key}
								label={field.label}
								help={field.help}
								placeholder={field.placeholder}
								tagName={field.tagName}
								multiline={field.multiline}
								value={String(value ?? '')}
								onChange={(next) => updateDraft({ [field.key]: next })}
							/>
						);
					}

					if (field.control === 'textarea') {
						return (
							<TextareaControl
								key={field.key}
								label={field.label}
								help={field.help}
								placeholder={field.placeholder}
								value={String(value ?? '')}
								onChange={(next) => updateDraft({ [field.key]: next })}
								rows={2}
							/>
						);
					}

					if (field.control === 'select') {
						return (
							<SelectControl
								key={field.key}
								label={field.label}
								help={field.help}
								options={field.options ?? []}
								value={String(value ?? '')}
								onChange={(next) => updateDraft({ [field.key]: next })}
							/>
						);
					}

					if (field.control === 'toggle') {
						return (
							<ToggleControl
								key={field.key}
								label={field.label}
								help={field.help}
								checked={Boolean(value)}
								onChange={(next) => updateDraft({ [field.key]: next })}
							/>
						);
					}

					return (
						<TextControl
							key={field.key}
							label={field.label}
							help={field.help}
							placeholder={field.placeholder}
							value={String(value ?? '')}
							onChange={(next) => updateDraft({ [field.key]: next })}
						/>
					);
				})}

				{renderItemExtras ? (
					<ItemEditorContext.Provider value>
						{renderItemExtras(item, updateDraft, index)}
					</ItemEditorContext.Provider>
				) : null}
			</div>

			{withActions ? (
				/*
				 * Only the in-place nested editor carries its own action row: it has
				 * no dialog header to host Cancel/Done. In the item modal the same
				 * two actions live in the header, next to the close button.
				 */
				<div className="doclap-repeater__actions">
					<Button variant="secondary" onClick={closeEditor}>
						{__('Cancel', 'doclap')}
					</Button>
					<Button variant="primary" onClick={commitDraft}>
						{__('Done', 'doclap')}
					</Button>
				</div>
			) : null}
		</>
	);

	return (
		<div className="doclap-repeater" ref={rootRef}>
			{/*
			 * A panel-level repeater is already named by its `PanelBody`, so the
			 * visible title is only rendered for a nested list (an item editor's
			 * in-place sublist), where nothing above it carries the label. `label`
			 * still names the list and prefixes every status message.
			 */}
			{inlineEditor ? (
				<p className="doclap-repeater__title">{label}</p>
			) : null}

			<p className="doclap-repeater__status" role="status" aria-live="polite">
				{atMinimum ? limitMessage : status}
			</p>

			{items.length === 0 && emptyLabel ? (
				<p className="doclap-repeater__empty">{emptyLabel}</p>
			) : null}

			{items.length > 0 ? (
				<ul className="doclap-repeater__list" aria-label={label}>
					{items.map((item, index) => {
						const open = inlineEditor && openIndex === index;
						const rowLabel = itemLabel(item, index, getItemLabel);

						return (
							<li
								className={`doclap-repeater__row${open ? ' is-open' : ''}`}
								key={index}
							>
								{/*
								 * The row itself is the edit affordance, the way a
								 * Gutenberg list row is: one full-width control that opens
								 * the item, with the secondary actions beside it. Keeping
								 * them as siblings (never nested inside the row button)
								 * keeps the markup valid and the tab order flat.
								 */}
								<button
									type="button"
									className="doclap-repeater__row-main"
									aria-expanded={inlineEditor ? open : undefined}
									onClick={() => openEditor(index, item)}
								>
									<span className="doclap-repeater__row-index">
										{index + 1}
									</span>
									<span className="doclap-repeater__row-label" title={rowLabel}>
										{rowLabel}
									</span>
								</button>
								{/*
								 * Action order is fixed: move up, move down, duplicate,
								 * remove. Every action is icon-only, so `label` is both the
								 * accessible name and the tooltip text, and the icon stays
								 * `aria-hidden`. The cluster fades in on hover/focus, the way
								 * core's list rows do, but stays permanently visible where
								 * there is no hover to discover it.
								 */}
								{/*
								 * One more-options menu per row, the way core ends an
								 * item row: the four mutations stay one click away
								 * without eating the label's width, and every menu row is
								 * a full-width 44px target instead of a 44px square.
								 * Order is fixed: move up, move down, duplicate, remove.
								 */}
								<span className="doclap-repeater__row-actions">
									<DropdownMenu
										icon={<Icon name="more" />}
										menuProps={{ className: 'doclap-repeater__menu' }}
										label={sprintf(
											/* translators: %s: label of the item the menu belongs to. */
											__('Actions for %s', 'doclap'),
											rowLabel,
										)}
										controls={[
											{
												title: __('Move up', 'doclap'),
												icon: <Icon name="chevronUp" />,
												isDisabled: listLocked || index === 0,
												onClick: () => move(index, -1),
											},
											{
												title: __('Move down', 'doclap'),
												icon: <Icon name="chevronDown" />,
												isDisabled: listLocked || index === items.length - 1,
												onClick: () => move(index, 1),
											},
											{
												title: __('Duplicate', 'doclap'),
												icon: <Icon name="copy" />,
												isDisabled: listLocked,
												onClick: () => duplicate(index),
											},
											{
												title: __('Remove', 'doclap'),
												icon: <Icon name="trash" />,
												isDisabled: listLocked || atMinimum,
												onClick: () => remove(index),
											},
										]}
									/>
								</span>

								{open && draft !== null ? (
									<div className="doclap-repeater__nested">
										{renderItemEditor(index, draft, true)}
									</div>
								) : null}
							</li>
						);
					})}
				</ul>
			) : null}

			<Button
				variant="secondary"
				className="doclap-repeater__add"
				icon={<Icon name="plus" />}
				onClick={add}
				disabled={listLocked}
			>
				{addLabel ?? sprintf(__('Add %s', 'doclap'), label.toLowerCase())}
			</Button>

			{!inlineEditor && openIndex !== null && draft !== null ? (
				/*
				 * `size="medium"` caps the editor at 560px on desktop and lets
				 * WordPress' own modal CSS take it edge-to-edge on small screens.
				 * The actions sit in `headerActions` — the slot this Modal version
				 * does provide — so the fields get the whole body and nothing has to
				 * fake a footer. `focusOnMount` points at the first field rather
				 * than the first tabbable, which is now a header action.
				 */
				<Modal
					className="doclap-repeater-modal"
					title={sprintf(
						/* translators: %s: the label of the item being edited. */
						__('Edit %s', 'doclap'),
						itemLabel(items[openIndex] ?? {}, openIndex, getItemLabel),
					)}
					size="medium"
					focusOnMount="firstContentElement"
					headerActions={
						<div className="doclap-repeater__modal-header-actions">
							<Button variant="secondary" onClick={closeEditor}>
								{__('Cancel', 'doclap')}
							</Button>
							<Button variant="primary" onClick={commitDraft}>
								{__('Done', 'doclap')}
							</Button>
						</div>
					}
					onRequestClose={closeEditor}
				>
					{renderItemEditor(openIndex, draft, false)}
				</Modal>
			) : null}
		</div>
	);
}

export default Repeater;

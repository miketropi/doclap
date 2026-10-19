/**
 * Section colour controls shared by the ten colour-aware Doclap blocks.
 *
 * A Doclap section is styled by the theme, so its colours are not attributes the
 * author should have to guess at in CSS: each block stores three optional colours
 * (`sectionBg`, `sectionHeading`, `sectionText`) and its renderer turns them into
 * `--doclap-block-bg`, `--doclap-block-heading` and `--doclap-block-text` on the
 * block root. An empty string means "theme default", and the renderer emits nothing
 * for it — this component keeps that contract by writing `''` when a colour is
 * cleared.
 *
 * The UI is Gutenberg's own: a `ColorPalette` fed by the theme palette, a
 * `Dropdown` + `ColorPicker` for anything else, and a `Clear` action per row. It
 * renders exactly one panel, so a block adds it last and does not have to repeat
 * any of this.
 */

import { useSettings } from '@wordpress/block-editor';
import {
	Button,
	ColorPalette,
	ColorPicker,
	Dropdown,
	PanelBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export interface ColourControlsProps {
	attributes: Record<string, unknown>;
	setAttributes: (attributes: Record<string, unknown>) => void;
}

/** One colour attribute and the label shown for it. */
interface ColourRow {
	attribute: string;
	label: string;
}

/** The three attributes every supported block declares, in display order. */
const ROWS: ColourRow[] = [
	{ attribute: 'sectionBg', label: __('Background', 'doclap') },
	{ attribute: 'sectionHeading', label: __('Heading text', 'doclap') },
	{ attribute: 'sectionText', label: __('Body text', 'doclap') },
];

/** One entry of the theme palette as `useSettings('color.palette')` returns it. */
interface PaletteEntry {
	name?: string;
	slug?: string;
	color?: string;
}

/**
 * `ColorPicker` can only round-trip a hex colour; a stored theme preset such as
 * `var(--wp--preset--color--base)` is shown in the palette instead, and the picker
 * starts empty for it.
 */
const HEX_COLOUR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function ColourControls({
	attributes,
	setAttributes,
}: ColourControlsProps): JSX.Element {
	// `useSettings` resolves every requested path and returns them in order;
	// the older single-path `useSetting` is deprecated since WordPress 6.5 and
	// is no longer in the package's types.
	const [setting] = useSettings('color.palette') as [
		PaletteEntry[] | undefined,
	];
	const palette = (setting ?? [])
		.filter(
			(entry): entry is PaletteEntry & { color: string } =>
				!!entry && 'string' === typeof entry.color,
		)
		.map((entry) => ({
			// Store the preset reference, not the literal: this theme's palette is
			// written in `oklch()`, and WordPress' CSS sanitiser strips every value
			// it cannot parse — including `oklch()` and `color-mix()` — from the
			// block's style attribute, which silently emptied the author's choice.
			// A `var(--wp--preset--color-*)` reference survives it and resolves to
			// the same colour.
			color: entry.slug
				? `var(--wp--preset--color--${entry.slug})`
				: entry.color,
			name: entry.name ?? entry.color,
		}));

	return (
		<PanelBody title={__('Colours', 'doclap')} initialOpen={false}>
			<div style={{ display: 'grid', gap: '16px' }}>
				{ROWS.map((row) => {
					const stored = attributes[row.attribute];
					const value = 'string' === typeof stored ? stored : '';
					const labelId = `doclap-colour-${row.attribute}-label`;
					const set = (next: string): void =>
						setAttributes({ [row.attribute]: next.trim() });

					return (
						<div className="components-base-control" key={row.attribute}>
							<div className="components-base-control__field">
								<span className="components-base-control__label" id={labelId}>
									{row.label}
								</span>
								<ColorPalette
									aria-labelledby={labelId}
									colors={palette}
									value={'' === value ? undefined : value}
									clearable
									disableCustomColors
									__experimentalIsRenderedInSidebar
									onChange={(next) => set(next ?? '')}
								/>
								<div
									style={{
										display: 'flex',
										gap: '8px',
										alignItems: 'center',
										marginTop: '8px',
									}}
								>
									<Dropdown
										popoverProps={{ placement: 'bottom-start' }}
										renderToggle={({ isOpen, onToggle }) => (
											<Button
												aria-expanded={isOpen}
												aria-label={`${__('Custom colour', 'doclap')}: ${row.label}`}
												onClick={onToggle}
												size="small"
												variant="secondary"
											>
												{__('Custom…', 'doclap')}
											</Button>
										)}
										renderContent={() => (
											<div style={{ padding: 16 }}>
												<ColorPicker
													color={HEX_COLOUR.test(value) ? value : undefined}
													enableAlpha={false}
													onChange={(next) => set(next)}
												/>
											</div>
										)}
									/>
									<Button
										aria-label={`${__('Clear', 'doclap')}: ${row.label}`}
										disabled={'' === value}
										onClick={() => set('')}
										size="small"
										variant="tertiary"
									>
										{__('Clear', 'doclap')}
									</Button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</PanelBody>
	);
}

export default ColourControls;

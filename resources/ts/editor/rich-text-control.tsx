/**
 * Visual rich-text control for Doclap block attributes.
 *
 * A Doclap block previews the PHP renderer through `ServerSideRender`, so the
 * editor cannot reuse the front-end markup for editing. Attributes that carry
 * markup (bold, italic, links, line breaks) are therefore edited here: this wraps
 * the native `RichText` from `@wordpress/block-editor`, which brings its own
 * `BlockControls` format toolbar and keeps paste, undo, keyboard shortcuts and
 * the link UI identical to a core block.
 *
 * Three rules make the stored value safe to print with `wp_kses_post()`:
 *
 * 1. The toolbar is the boundary — `allowedFormats` defaults to bold, italic and
 *    link, and callers may narrow that list but never widen it. Client-side KSES
 *    does not exist, so the allowed-format set *is* the sanitisation policy.
 *    The toolbar is requested with `inlineToolbar`, i.e. as a popover anchored to
 *    the field: the default `BlockControls` slot lives in the editor's own
 *    document, while any control inside the block canvas (and any control inside
 *    a `Modal`, which is portalled to that same document) is rendered in another
 *    one, so a slot-registered toolbar would never be reachable from there.
 * 2. Line breaks are explicit. `RichText` turns Enter into a literal `\n`, which
 *    HTML would collapse into a space, so `multiline` converts `\n` to `<br>` and
 *    `disableLineBreaks` stops single-line fields from ever gaining one.
 * 3. Empty means empty. `''`, `'<p></p>'` and `'<p><br></p>'` all round-trip as
 *    `''`, so a cleared field never stores an empty paragraph.
 *
 * Bundled into each block's editor script by esbuild, so no extra WordPress
 * script handle is needed.
 */

import { RichText } from '@wordpress/block-editor';
import { BaseControl } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';

export interface RichTextControlProps {
	label: string;
	/** HTML fragment. */
	value: string;
	onChange: (value: string) => void;
	/** Element the stored fragment represents. Default `p`. */
	tagName?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'div' | 'li';
	/** Default false; true serialises line breaks as `<br>`. */
	multiline?: boolean;
	/** Default bold, italic and link; callers may narrow, never widen. */
	allowedFormats?: string[];
	help?: string;
	placeholder?: string;
}

/**
 * The format whitelist every rich Doclap attribute is limited to. Stored values
 * are printed with `wp_kses_post()` on the front end, so the editor toolbar must
 * not be able to produce anything else — no colours, no font sizes, no nested
 * blocks, and no images (which would need their own media handling).
 */
export const RICH_TEXT_FORMATS = ['core/bold', 'core/italic', 'core/link'];

/**
 * Normalise a rich fragment: `<br>` for line breaks when `multiline`, a single
 * space when not, and `''` for anything that carries no text.
 *
 * Applied to the incoming value and to every change, so a value that only exists
 * as markup (an empty paragraph, a lone `<br>`, non-breaking spaces) can never be
 * stored and a single-line field cannot keep a newline somebody pasted into it.
 *
 * @param value     Raw HTML fragment.
 * @param multiline Whether line breaks are meaningful for this attribute.
 * @return Normalised fragment.
 */
export function normaliseRichValue(value: string, multiline = false): string {
	const raw = typeof value === 'string' ? value : '';
	const withBreaks = multiline
		? raw.replace(/\r\n?|\n/g, '<br>')
		: raw.replace(/\s*\r?\n\s*/g, ' ');
	const text = withBreaks
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;|&#160;/gi, ' ')
		.trim();

	return '' === text ? '' : withBreaks;
}

export function RichTextControl({
	label,
	value,
	onChange,
	tagName = 'p',
	multiline = false,
	allowedFormats,
	help,
	placeholder,
}: RichTextControlProps): JSX.Element {
	const identifier = useInstanceId(RichTextControl, 'doclap-rich-text');
	const formats = (allowedFormats ?? RICH_TEXT_FORMATS).filter((format) =>
		RICH_TEXT_FORMATS.includes(format),
	);

	/*
	 * `BaseControl` renders the label and the help text with the same styled
	 * components every `TextControl` uses, so a rich field lines up with the plain
	 * ones beside it in an item editor. Its label is a `<label for>` and the
	 * editable element is not a form control, so the accessible name is carried
	 * explicitly by `aria-label` (same text) and the description by the help id
	 * `BaseControl` generates from the control id.
	 */
	return (
		<BaseControl
			className="doclap-rich-text"
			id={identifier}
			label={label}
			help={help}
		>
			<RichText
				identifier={identifier}
				id={identifier}
				tagName={tagName}
				value={normaliseRichValue(value, multiline)}
				onChange={(next) => onChange(normaliseRichValue(next, multiline))}
				allowedFormats={formats}
				disableLineBreaks={!multiline}
				inlineToolbar
				aria-label={label}
				aria-describedby={help ? `${identifier}__help` : undefined}
				placeholder={placeholder}
				style={{
					background: '#fff',
					border: '1px solid #949494',
					borderRadius: '2px',
					boxSizing: 'border-box',
					minHeight: '40px',
					padding: '6px 8px',
				}}
			/>
		</BaseControl>
	);
}

export default RichTextControl;

/**
 * Inline editor icons for the Doclap inspector controls.
 *
 * The five glyphs the repeater needs, drawn with Lucide's own geometry: an
 * outline set on a 24×24 viewBox, stroked with `currentColor` at 1.5 so the
 * icons inherit the button's colour in every state (idle, hover, focus,
 * disabled, destructive) instead of hard-coding a fill. Inlining them keeps the
 * block editor bundles free of an icon dependency — the whole set is five paths.
 *
 * `aria-hidden` and `focusable="false"` because every icon sits inside a
 * `Button` that carries its own accessible name (`label`); the icon must never
 * add a second name or become a tab stop of its own.
 */

const ICONS = {
	chevronUp: <path d="m18 15-6-6-6 6" />,
	chevronDown: <path d="m6 9 6 6 6-6" />,
	copy: (
		<>
			<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
		</>
	),
	pencil: (
		<>
			<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
			<path d="m15 5 4 4" />
		</>
	),
	trash: (
		<>
			<path d="M3 6h18" />
			<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
			<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
		</>
	),
};

export type IconName = keyof typeof ICONS;

/**
 * Render one editor icon.
 *
 * @param props      Component props.
 * @param props.name Icon to draw.
 * @return Inline SVG.
 */
export function Icon({ name }: { name: keyof typeof ICONS }): JSX.Element {
	/*
	 * WordPress ships `.components-button svg { fill: currentColor }`, which
	 * outranks the presentation attribute and would flood-fill these outline
	 * glyphs. The inline `fill` below beats any stylesheet rule, so the geometry
	 * stays stroke-only in every context (inside a Button or standalone).
	 */
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
			style={{ fill: 'none' }}
		>
			{ICONS[name]}
		</svg>
	);
}

export default Icon;

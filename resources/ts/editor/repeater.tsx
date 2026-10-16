/**
 * Repeater controls shared by the Doclap block editors.
 *
 * One generic list editor keeps every block's inspector consistent: add, remove,
 * reorder, and edit a fixed set of fields per item. Bundled into each block's
 * editor script by esbuild, so no extra WordPress script handle is needed.
 */

import { Button, Flex, FlexItem, TextControl, TextareaControl, SelectControl, ToggleControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

export interface RepeaterField {
	key: string;
	label: string;
	help?: string;
	control?: 'text' | 'textarea' | 'select' | 'toggle';
	options?: Array<{ label: string; value: string }>;
	placeholder?: string;
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
}

function itemLabel(
	item: RepeaterItem,
	index: number,
	getItemLabel?: RepeaterProps['getItemLabel'],
): string {
	const custom = getItemLabel?.(item, index);
	if (custom) {
		return custom;
	}

	const first = String(item.label ?? item.heading ?? item.title ?? '').trim();

	return first || sprintf(__('Item %d', 'doclap'), index + 1);
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
}: RepeaterProps): JSX.Element {
	const update = (index: number, key: string, value: unknown): void => {
		onChange(items.map((item, position) => (position === index ? { ...item, [key]: value } : item)));
	};

	const move = (index: number, offset: number): void => {
		const next = [...items];
		const target = index + offset;

		if (target < 0 || target >= next.length) {
			return;
		}

		[next[index], next[target]] = [next[target], next[index]];
		onChange(next);
	};

	return (
		<div className="doclap-repeater">
			<p className="doclap-repeater__title">{label}</p>

			{items.length === 0 && emptyLabel ? <p className="doclap-repeater__empty">{emptyLabel}</p> : null}

			{items.map((item, index) => (
				<div className="doclap-repeater__item" key={index}>
					<Flex className="doclap-repeater__header" justify="space-between" align="center" gap={1}>
						<FlexItem>
							<strong>{itemLabel(item, index, getItemLabel)}</strong>
						</FlexItem>
						<FlexItem>
							<Button
								size="small"
								variant="tertiary"
								disabled={index === 0}
								onClick={() => move(index, -1)}
								label={__('Move up', 'doclap')}
								showTooltip
							>
								↑
							</Button>
							<Button
								size="small"
								variant="tertiary"
								disabled={index === items.length - 1}
								onClick={() => move(index, 1)}
								label={__('Move down', 'doclap')}
								showTooltip
							>
								↓
							</Button>
							<Button
								size="small"
								isDestructive
								variant="tertiary"
								onClick={() => onChange(items.filter((_, position) => position !== index))}
							>
								{__('Remove', 'doclap')}
							</Button>
						</FlexItem>
					</Flex>

					{fields.map((field) => {
						const value = item[field.key];

						if (field.control === 'textarea') {
							return (
								<TextareaControl
									key={field.key}
									label={field.label}
									help={field.help}
									placeholder={field.placeholder}
									value={String(value ?? '')}
									onChange={(next) => update(index, field.key, next)}
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
									onChange={(next) => update(index, field.key, next)}
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
									onChange={(next) => update(index, field.key, next)}
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
								onChange={(next) => update(index, field.key, next)}
							/>
						);
					})}
				</div>
			))}

			<Button variant="secondary" onClick={() => onChange([...items, createItem()])}>
				{addLabel ?? sprintf(__('Add %s', 'doclap'), label.toLowerCase())}
			</Button>
		</div>
	);
}

export default Repeater;

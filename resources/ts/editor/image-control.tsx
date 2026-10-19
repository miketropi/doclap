/**
 * Shared image picker for the Doclap blocks that persist an attachment id, its
 * URL, the alternative text and an optional caption.
 *
 * about-profile (`studioImage*`), home-hero (`poster*`) and home-team
 * (`teamImage*`) previously each carried their own copy of this markup and their
 * own select handler; the persistence contract is identical, so it lives here
 * once. The component deliberately owns no block attributes: the caller passes
 * the current values and receives callbacks, which keeps every block's attribute
 * names in its own `edit.tsx`.
 *
 * Selecting or replacing an image always writes id, URL and alt together from the
 * attachment record, so the three values can never drift apart. Alt text is still
 * individually editable through `onChangeAlt`.
 */

import {
	MediaPlaceholder,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { Button, TextareaControl, TextControl } from '@wordpress/components';

export interface ImageControlValue {
	id: number;
	url: string;
	alt: string;
}

export interface ImageControlProps {
	value: ImageControlValue;
	/** Translated labels supplied by the caller. */
	labels: {
		title: string;
		select: string;
		replace: string;
		remove: string;
		alt: string;
		altHelp?: string;
		caption?: string;
	};
	onSelect: (media: ImageControlValue) => void;
	onRemove: () => void;
	onChangeAlt: (alt: string) => void;
	/** Omit to hide the caption field entirely. */
	caption?: string;
	onChangeCaption?: (caption: string) => void;
}

/**
 * Shape of the record handed back by the media modal.
 *
 * Every field is optional because the modal returns the attachment entity, whose
 * `url`/`alt` keys are not part of the component's declared prop types.
 */
interface SelectedMedia {
	id?: number;
	url?: string;
	alt?: string;
}

export function ImageControl({
	value,
	labels,
	onSelect,
	onRemove,
	onChangeAlt,
	caption,
	onChangeCaption,
}: ImageControlProps): JSX.Element {
	const handleSelect = (media: SelectedMedia): void => {
		onSelect({
			id: media.id ?? 0,
			url: media.url ?? '',
			alt: media.alt ?? '',
		});
	};

	return (
		<div className="doclap-image-control">
			{value.url ? (
				<>
					<img
						className="doclap-image-control__preview"
						src={value.url}
						alt={value.alt}
					/>
					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={['image']}
							value={value.id || undefined}
							onSelect={handleSelect}
							render={({ open }) => (
								<>
									<Button variant="secondary" onClick={open}>
										{labels.replace}
									</Button>
									<Button
										variant="tertiary"
										isDestructive
										onClick={onRemove}
									>
										{labels.remove}
									</Button>
								</>
							)}
						/>
					</MediaUploadCheck>
				</>
			) : (
				<MediaPlaceholder
					allowedTypes={['image']}
					labels={{ title: labels.title, instructions: labels.select }}
					onSelect={handleSelect}
				/>
			)}

			<TextControl
				label={labels.alt}
				help={labels.altHelp}
				value={value.alt}
				onChange={onChangeAlt}
			/>

			{onChangeCaption && caption !== undefined ? (
				<TextareaControl
					label={labels.caption}
					value={caption}
					onChange={onChangeCaption}
				/>
			) : null}
		</div>
	);
}

export default ImageControl;

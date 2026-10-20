/**
 * Shared media picker for the Doclap blocks that persist a media id, its URL and
 * the alternative text.
 *
 * about-profile (`studioImage*`), home-hero (`poster*`), home-team
 * (`teamImage*`), site-header (`brandMedia*`) and home-work (`projects[].media*`)
 * all need the same thing, and the persistence contract is identical, so it lives
 * here once. The component deliberately owns no block attributes: the caller
 * passes the current values and receives callbacks, which keeps every block's
 * attribute names in its own `edit.tsx`.
 *
 * Selecting or replacing media always writes id, URL and alt together from the
 * attachment record, so the three values can never drift apart. Alt text is still
 * individually editable through `onChangeAlt`; for `kind: 'video'` it is the
 * text alternative of the player rather than of a still.
 */

import {
	MediaPlaceholder,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { Button, TextareaControl, TextControl } from '@wordpress/components';

export interface MediaControlValue {
	id: number;
	url: string;
	alt: string;
}

export interface MediaControlProps {
	value: MediaControlValue;
	/** Which attachment type the picker accepts and previews. Default `image`. */
	kind?: 'image' | 'video';
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
	onSelect: (media: MediaControlValue) => void;
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

export function MediaControl({
	value,
	kind = 'image',
	labels,
	onSelect,
	onRemove,
	onChangeAlt,
	caption,
	onChangeCaption,
}: MediaControlProps): JSX.Element {
	const handleSelect = (media: SelectedMedia): void => {
		onSelect({
			id: media.id ?? 0,
			url: media.url ?? '',
			alt: media.alt ?? '',
		});
	};

	const preview = (
		<>
			{'video' === kind ? (
				<video
					className="doclap-media-control__preview"
					src={value.url}
					controls
					loop
					muted
					playsInline
				/>
			) : (
				<img
					className="doclap-media-control__preview"
					src={value.url}
					alt={value.alt}
				/>
			)}
			<MediaUploadCheck>
				<MediaUpload
					allowedTypes={[kind]}
					value={value.id || undefined}
					onSelect={handleSelect}
					render={({ open }) => (
						<>
							<Button variant="secondary" onClick={open}>
								{labels.replace}
							</Button>
							<Button variant="tertiary" isDestructive onClick={onRemove}>
								{labels.remove}
							</Button>
						</>
					)}
				/>
			</MediaUploadCheck>
		</>
	);

	return (
		<div className="doclap-media-control">
			{value.url ? (
				preview
			) : (
				<MediaPlaceholder
					allowedTypes={[kind]}
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

export default MediaControl;

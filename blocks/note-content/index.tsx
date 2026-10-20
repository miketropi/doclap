import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { NoteContentAttributes } from './types';

registerBlockType<NoteContentAttributes>(metadata as BlockConfiguration<NoteContentAttributes>, {
	edit: Edit,
	save: () => null,
});

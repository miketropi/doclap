import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import type { NotesArchiveAttributes } from './types';
import metadata from './block.json';

registerBlockType<NotesArchiveAttributes>(metadata as BlockConfiguration<NotesArchiveAttributes>, {
	edit: Edit,
	save: () => null,
});

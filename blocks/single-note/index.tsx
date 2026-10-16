import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { SingleNoteAttributes } from './types';

registerBlockType<SingleNoteAttributes>(metadata as BlockConfiguration<SingleNoteAttributes>, {
	edit: Edit,
	save: () => null,
});

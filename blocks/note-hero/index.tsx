import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { NoteHeroAttributes } from './types';

registerBlockType<NoteHeroAttributes>(metadata as BlockConfiguration<NoteHeroAttributes>, {
	edit: Edit,
	save: () => null,
});

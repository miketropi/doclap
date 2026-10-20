import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { RelatedNotesAttributes } from './types';

registerBlockType<RelatedNotesAttributes>(metadata as BlockConfiguration<RelatedNotesAttributes>, {
	edit: Edit,
	save: () => null,
});

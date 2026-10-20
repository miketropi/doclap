import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { NoteCoverAttributes } from './types';

registerBlockType<NoteCoverAttributes>(metadata as BlockConfiguration<NoteCoverAttributes>, {
	edit: Edit,
	save: () => null,
});

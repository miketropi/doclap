import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import type { NotFoundAttributes } from './types';
import metadata from './block.json';
registerBlockType<NotFoundAttributes>(metadata as BlockConfiguration<NotFoundAttributes>, {
	edit: Edit,
	save: () => null,
});

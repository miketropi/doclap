import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { HomeWorkAttributes } from './types';

registerBlockType<HomeWorkAttributes>(metadata as BlockConfiguration<HomeWorkAttributes>, {
	edit: Edit,
	save: () => null,
});

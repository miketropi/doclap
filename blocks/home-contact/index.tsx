import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { HomeContactAttributes } from './types';

registerBlockType<HomeContactAttributes>(metadata as BlockConfiguration<HomeContactAttributes>, {
	edit: Edit,
	save: () => null,
});

import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { AboutProfileAttributes } from './types';

registerBlockType<AboutProfileAttributes>(metadata as BlockConfiguration<AboutProfileAttributes>, {
	edit: Edit,
	save: () => null,
});

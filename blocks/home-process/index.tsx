import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { HomeProcessAttributes } from './types';

registerBlockType<HomeProcessAttributes>(metadata as BlockConfiguration<HomeProcessAttributes>, {
	edit: Edit,
	save: () => null,
});

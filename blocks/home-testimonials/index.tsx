import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { HomeTestimonialsAttributes } from './types';

registerBlockType<HomeTestimonialsAttributes>(
	metadata as BlockConfiguration<HomeTestimonialsAttributes>,
	{
		edit: Edit,
		save: () => null,
	},
);

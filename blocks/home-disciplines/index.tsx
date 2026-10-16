import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { HomeDisciplinesAttributes } from './types';

registerBlockType<HomeDisciplinesAttributes>(
	metadata as BlockConfiguration<HomeDisciplinesAttributes>,
	{
		edit: Edit,
		save: () => null,
	},
);

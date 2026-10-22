import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { PricingPlansAttributes } from './types';

registerBlockType<PricingPlansAttributes>(
	metadata as BlockConfiguration<PricingPlansAttributes>,
	{
		edit: Edit,
		save: () => null,
	},
);

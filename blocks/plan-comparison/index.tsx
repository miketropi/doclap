import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { PlanComparisonAttributes } from './types';

registerBlockType<PlanComparisonAttributes>(
	metadata as BlockConfiguration<PlanComparisonAttributes>,
	{
		edit: Edit,
		save: () => null,
	},
);

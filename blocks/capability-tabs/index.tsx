import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { CapabilityTabsAttributes } from './types';

registerBlockType<CapabilityTabsAttributes>(
	metadata as BlockConfiguration<CapabilityTabsAttributes>,
	{
		edit: Edit,
		save: () => null,
	}
);

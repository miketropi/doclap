import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { TeamRosterAttributes } from './types';

registerBlockType<TeamRosterAttributes>(
	metadata as BlockConfiguration<TeamRosterAttributes>,
	{
		edit: Edit,
		save: () => null,
	}
);

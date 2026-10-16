import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { HomeTeamAttributes } from './types';

registerBlockType<HomeTeamAttributes>(metadata as BlockConfiguration<HomeTeamAttributes>, {
	edit: Edit,
	save: () => null,
});

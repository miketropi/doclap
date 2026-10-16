import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { HomeHeroAttributes } from './types';

registerBlockType<HomeHeroAttributes>(metadata as BlockConfiguration<HomeHeroAttributes>, {
	edit: Edit,
	save: () => null,
});

import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { HomeAboutAttributes } from './types';

registerBlockType<HomeAboutAttributes>(metadata as BlockConfiguration<HomeAboutAttributes>, {
	edit: Edit,
	save: () => null,
});

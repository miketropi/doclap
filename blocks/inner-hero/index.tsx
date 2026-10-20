import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { InnerHeroAttributes } from './types';

registerBlockType<InnerHeroAttributes>(metadata as BlockConfiguration<InnerHeroAttributes>, {
	edit: Edit,
	save: () => null,
});

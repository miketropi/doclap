import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { PrinciplesGridAttributes } from './types';

registerBlockType<PrinciplesGridAttributes>(metadata as BlockConfiguration<PrinciplesGridAttributes>, {
	edit: Edit,
	save: () => null,
});

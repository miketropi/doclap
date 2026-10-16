import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { FaqListAttributes } from './types';

registerBlockType<FaqListAttributes>(metadata as BlockConfiguration<FaqListAttributes>, {
	edit: Edit,
	save: () => null,
});

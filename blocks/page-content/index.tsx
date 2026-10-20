import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { PageContentAttributes } from './types';

registerBlockType<PageContentAttributes>(metadata as BlockConfiguration<PageContentAttributes>, {
	edit: Edit,
	save: () => null,
});

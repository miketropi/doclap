import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { SiteFooterAttributes } from './types';

registerBlockType<SiteFooterAttributes>(metadata as BlockConfiguration<SiteFooterAttributes>, {
	edit: Edit,
	save: () => null,
});

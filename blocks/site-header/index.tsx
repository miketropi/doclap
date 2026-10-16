import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { SiteHeaderAttributes } from './types';

registerBlockType<SiteHeaderAttributes>(metadata as BlockConfiguration<SiteHeaderAttributes>, {
	edit: Edit,
	save: () => null,
});

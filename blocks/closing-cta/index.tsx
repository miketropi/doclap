import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { ClosingCtaAttributes } from './types';

registerBlockType<ClosingCtaAttributes>(metadata as BlockConfiguration<ClosingCtaAttributes>, {
	edit: Edit,
	save: () => null,
});

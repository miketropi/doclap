import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { ContactFormAttributes } from './types';

registerBlockType<ContactFormAttributes>(metadata as BlockConfiguration<ContactFormAttributes>, {
	edit: Edit,
	save: () => null,
});

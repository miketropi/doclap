import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { JournalCarouselAttributes } from './types';

registerBlockType<JournalCarouselAttributes>(metadata as BlockConfiguration<JournalCarouselAttributes>, {
	edit: Edit,
	save: () => null,
});

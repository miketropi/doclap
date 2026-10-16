import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { HomeJournalAttributes } from './types';

registerBlockType<HomeJournalAttributes>(metadata as BlockConfiguration<HomeJournalAttributes>, {
	edit: Edit,
	save: () => null,
});

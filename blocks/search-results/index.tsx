import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { SearchResultsAttributes } from './types';

registerBlockType<SearchResultsAttributes>(metadata as BlockConfiguration<SearchResultsAttributes>, {
	edit: Edit,
	save: () => null,
});

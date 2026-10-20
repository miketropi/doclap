import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { SplitNarrativeAttributes } from './types';

registerBlockType<SplitNarrativeAttributes>(metadata as BlockConfiguration<SplitNarrativeAttributes>, {
	edit: Edit,
	save: () => null,
});

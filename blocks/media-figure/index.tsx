import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { MediaFigureAttributes } from './types';

registerBlockType<MediaFigureAttributes>(metadata as BlockConfiguration<MediaFigureAttributes>, {
	edit: Edit,
	save: () => null,
});

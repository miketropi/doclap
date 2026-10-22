import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import type { NewsletterSignupAttributes } from './types';

registerBlockType<NewsletterSignupAttributes>(
	metadata as BlockConfiguration<NewsletterSignupAttributes>,
	{
		edit: Edit,
		save: () => null,
	},
);

<?php

/**
 * PHP CS Fixer — Doclap child theme (WordPress-friendly defaults).
 *
 * Auto-fixes formatting only; use `npm run lint:php:all` (PHPStan + dry-run) for the full PHP gate.
 *
 * @package Doclap
 */

declare( strict_types=1 );

$finder = PhpCsFixer\Finder::create()
	->in(
		array(
			__DIR__ . '/inc',
			__DIR__ . '/blocks',
			__DIR__ . '/tests',
		),
	)
	->append( array( __DIR__ . '/functions.php' ) )
	->name( '*.php' )
	->notPath( 'index.asset.php' )
	->notPath( 'view.asset.php' )
	->ignoreDotFiles( true )
	->ignoreVCS( true );

return ( new PhpCsFixer\Config() )
	->setRiskyAllowed( true )
	->setIndent( "\t" )
	->setLineEnding( "\n" )
	->setRules(
		array(
			'array_syntax'                     => array( 'syntax' => 'long' ),
			'blank_line_after_opening_tag'     => true,
			'blank_line_between_import_groups' => true,
			'concat_space'                     => array( 'spacing' => 'one' ),
			'declare_strict_types'             => true,
			'fully_qualified_strict_types'     => true,
			'linebreak_after_opening_tag'      => true,
			'method_argument_space'            => array(
				'on_multiline'                     => 'ensure_fully_multiline',
				'keep_multiple_spaces_after_comma' => true,
			),
			'no_extra_blank_lines'             => array(
				'tokens' => array(
					'extra',
					'throw',
					'use',
				),
			),
			'no_trailing_whitespace'           => true,
			'no_trailing_whitespace_in_comment' => true,
			'no_unused_imports'                => true,
			'ordered_imports'                  => array( 'sort_algorithm' => 'alpha' ),
			'phpdoc_align'                     => array( 'align' => 'vertical' ),
			'phpdoc_order'                     => true,
			'phpdoc_separation'                => true,
			'phpdoc_summary'                   => true,
			'phpdoc_trim'                      => true,
			'single_blank_line_at_eof'         => true,
			'single_quote'                     => true,
			'spaces_inside_parentheses'        => array( 'space' => 'single' ),
			'trailing_comma_in_multiline'      => array(
				'elements' => array( 'arrays', 'arguments', 'parameters' ),
			),
			'whitespace_after_comma_in_array'  => true,
			'yoda_style'                       => false,
		),
	)
	->setFinder( $finder );

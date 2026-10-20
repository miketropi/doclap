<?php
/**
 * FAQ list block renderer.
 *
 * @var array<string, mixed> $attributes Block attributes.
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Section colours are optional: an empty attribute emits nothing, so an unset
// colour keeps the theme's default for that property.
$doclap_colour_style = '';

foreach (
	array(
		'sectionBg'      => '--doclap-block-bg',
		'sectionHeading' => '--doclap-block-heading',
		'sectionText'    => '--doclap-block-text',
	) as $doclap_colour_attr => $doclap_colour_var
) {
	$doclap_colour_value = trim( (string) ( $attributes[ $doclap_colour_attr ] ?? '' ) );

	if ( '' !== $doclap_colour_value ) {
		$doclap_colour_style .= $doclap_colour_var . ':' . $doclap_colour_value . ';';
	}
}

$doclap_wrapper = get_block_wrapper_attributes(
	array( 'class' => doclap_scope_class( 'doclap-faq-list', array( 'section' ) ), 'style' => $doclap_colour_style ),
);
$questions = is_array( $attributes['questions'] ?? null )
	? $attributes['questions']
	: array();
$filters = is_array( $attributes['filters'] ?? null )
	? $attributes['filters']
	: array();
$count_template = (string) ( $attributes['countTemplate'] ?? __( '%d questions', 'doclap' ) );
$count_text = false !== strpos( $count_template, '%d' )
	? str_replace( '%d', (string) count( $questions ), $count_template )
	: count( $questions ) . ' ' . $count_template;
$instance_id = wp_unique_id( 'doclap-faq-' );
$aside_link_url = doclap_resolve_url(
	(string) ( $attributes['asideLinkUrl'] ?? '/contact/' ),
);
?>
<section <?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
	?>>
	<div class="container grid-1-2 body-grid">
		<aside class="aside-title">
			<span><?php echo esc_html( (string) ( $attributes['asideLabel'] ?? '' ) ); ?></span>
			<h2 data-doclap-rich="asideHeading">
				<?php echo doclap_rich( (string) ( $attributes['asideHeading'] ?? '' ) ); ?>
			</h2>
			<p data-doclap-rich="asideCopy"><?php echo doclap_rich( (string) ( $attributes['asideCopy'] ?? '' ) ); ?></p>
			<a class="text-link" href="<?php echo esc_url( $aside_link_url ); ?>">
				<span data-doclap-rich="asideLinkLabel">
					<?php echo doclap_rich( (string) ( $attributes['asideLinkLabel'] ?? '' ) ); ?>
				</span>
				<?php
				echo doclap_icon( 'arrow-up-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme icon.
				?>
			</a>
		</aside>

		<div>
			<div
				class="filter-bar"
				role="group"
				aria-label="<?php esc_attr_e( 'Question group', 'doclap' ); ?>"
			>
				<button type="button" data-filter="all" aria-pressed="true">
					<span>
						<?php echo esc_html( (string) ( $attributes['filterAllLabel'] ?? '' ) ); ?>
					</span>
				</button>
				<?php foreach ( $filters as $filter ) : ?>
					<?php
					if (
						is_array( $filter )
						&& '' !== (string) ( $filter['slug'] ?? '' )
					) :
						?>
						<button
							type="button"
							data-filter="<?php echo esc_attr( sanitize_key( (string) $filter['slug'] ) ); ?>"
							aria-pressed="false"
						>
							<span><?php echo esc_html( (string) ( $filter['label'] ?? '' ) ); ?></span>
						</button>
					<?php endif; ?>
				<?php endforeach; ?>
			</div>

			<div class="faq-list">
				<?php foreach ( $questions as $index => $question ) : ?>
					<?php if ( is_array( $question ) ) : ?>
						<details
							id="<?php echo esc_attr( $instance_id . '-' . ( (int) $index + 1 ) ); ?>"
							data-category="<?php
								echo esc_attr(
									sanitize_key( (string) ( $question['category'] ?? '' ) ),
								);
							?>"
							<?php echo 0 === $index ? 'open' : ''; ?>
						>
							<summary>
								<span>
									<?php echo doclap_rich( (string) ( $question['question'] ?? '' ) ); ?>
								</span>
								<?php
								echo doclap_icon( 'plus' );
								// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme icon.
								?>
							</summary>
							<p>
								<?php echo doclap_rich( (string) ( $question['answer'] ?? '' ) ); ?>
							</p>
						</details>
					<?php endif; ?>
				<?php endforeach; ?>
			</div>

			<p
				class="form-note"
				role="status"
				aria-live="polite"
				data-faq-count
				data-count-template="<?php echo esc_attr( $count_template ); ?>"
			>
				<?php echo esc_html( $count_text ); ?>
			</p>
			<p class="form-note" data-faq-empty hidden>
				<?php echo esc_html( (string) ( $attributes['emptyLabel'] ?? '' ) ); ?>
			</p>
		</div>
	</div>
</section>

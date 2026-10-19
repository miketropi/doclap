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

$doclap_wrapper = get_block_wrapper_attributes(
	array( 'class' => doclap_scope_class( 'doclap-faq-list' ) ),
);
// Saved content can still carry the split accent attributes; the editor folds
// them into the merged rich values and clears the legacy keys on first save.
$doclap_heading = doclap_rich_accent(
	(string) ( $attributes['heading'] ?? '' ),
	(string) ( $attributes['headingAccent'] ?? '' ),
	'<br><em>',
);
$doclap_closing_heading = doclap_rich_accent(
	(string) ( $attributes['closingHeading'] ?? '' ),
	(string) ( $attributes['closingHeadingAccent'] ?? '' ),
	'<br><em>',
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
$home_url = home_url( '/' );
$aside_link_url = doclap_resolve_url(
	(string) ( $attributes['asideLinkUrl'] ?? '/contact/' ),
);
$closing_link_url = doclap_resolve_url(
	(string) ( $attributes['closingCtaUrl'] ?? '/contact/' ),
);
?>
<div
	<?php
	echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.
	?>
>
	<section class="section inner-hero">
		<div class="container">
			<nav
				class="breadcrumb"
				aria-label="<?php esc_attr_e( 'Page path', 'doclap' ); ?>"
			>
				<a href="<?php echo esc_url( $home_url ); ?>">
					<?php echo esc_html( (string) ( $attributes['breadcrumbHomeLabel'] ?? '' ) ); ?>
				</a>
				<span aria-hidden="true">/</span>
				<span aria-current="page">
					<?php echo esc_html( (string) ( $attributes['breadcrumbLabel'] ?? '' ) ); ?>
				</span>
			</nav>
			<h1 data-doclap-rich="heading"><?php echo doclap_rich( $doclap_heading ); ?></h1>
			<div class="hero-summary">
				<span class="hero-mark" aria-hidden="true">✳</span>
				<p class="lead" data-doclap-rich="lead">
					<?php echo doclap_rich( (string) ( $attributes['lead'] ?? '' ) ); ?>
				</p>
			</div>
		</div>
	</section>

	<section class="section">
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

	<section class="section closing">
		<div class="container row-between">
			<div>
				<p class="eyebrow">
					<?php echo esc_html( (string) ( $attributes['closingEyebrow'] ?? '' ) ); ?>
				</p>
				<h2 data-doclap-rich="closingHeading">
					<?php echo doclap_rich( $doclap_closing_heading ); ?>
				</h2>
			</div>
			<a class="circle-cta" href="<?php echo esc_url( $closing_link_url ); ?>">
				<span data-doclap-rich="closingCtaLabel">
					<?php echo doclap_rich( (string) ( $attributes['closingCtaLabel'] ?? '' ) ); ?>
				</span>
				<?php
				echo doclap_icon( 'arrow-up-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme icon.
				?>
			</a>
		</div>
	</section>
</div>

<?php
/**
 * Server renderer for the About profile block.
 *
 * @var array<string, mixed> $attributes Block attributes.
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$doclap_sections   = is_array( $attributes['sections'] ?? null )
	? $attributes['sections']
	: array();
$doclap_principles = is_array( $attributes['principles'] ?? null )
	? $attributes['principles']
	: array();
$doclap_image_url  = (string) ( $attributes['studioImageUrl'] ?? '' );
if ( '' === $doclap_image_url ) {
	$doclap_image_url = DOCLAP_URI . '/assets/images/studio-workspace.jpg';
}
$doclap_image_id = absint( $attributes['studioImageId'] ?? 0 );
if ( $doclap_image_id ) {
	$doclap_attachment_url = wp_get_attachment_image_url( $doclap_image_id, 'full' );
	if ( $doclap_attachment_url ) {
		$doclap_image_url = $doclap_attachment_url;
	}
}
$doclap_wrapper = get_block_wrapper_attributes(
	array( 'class' => doclap_scope_class( 'doclap-about-profile' ) ),
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
?>
<div <?php echo $doclap_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core.?>>
	<section class="section inner-hero">
		<div class="container">
			<nav
				class="breadcrumb"
				aria-label="<?php echo esc_attr__( 'Page path', 'doclap' ); ?>"
			>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>">
					<?php
					echo esc_html(
						(string) ( $attributes['breadcrumbHomeLabel'] ?? '' ),
					);
					?>
				</a>
				<span aria-hidden="true">/</span>
				<span aria-current="page">
					<?php echo esc_html( (string) ( $attributes['breadcrumbLabel'] ?? '' ) ); ?>
				</span>
			</nav>
			<h1 data-doclap-rich="heading"><?php echo doclap_rich( $doclap_heading ); ?></h1>
			<div class="hero-summary">
				<span class="hero-mark" aria-hidden="true">✳</span>
				<p class="lead" data-doclap-rich="lead"><?php echo doclap_rich( (string) ( $attributes['lead'] ?? '' ) ); ?></p>
			</div>
		</div>
	</section>

	<?php if ( isset( $doclap_sections[0] ) && is_array( $doclap_sections[0] ) ) : ?>
		<?php
		$doclap_section         = $doclap_sections[0];
		$doclap_section_heading = doclap_rich_accent(
			(string) ( $doclap_section['heading'] ?? '' ),
			(string) ( $doclap_section['headingAccent'] ?? '' ),
			'<br>',
		);
		?>
		<section class="section">
			<div class="container grid-1-2 body-grid">
				<aside class="aside-title">
					<span>
						<?php echo esc_html( (string) ( $doclap_section['label'] ?? '' ) ); ?>
					</span>
					<h2><?php echo doclap_rich( $doclap_section_heading ); ?></h2>
				</aside>
				<div class="prose">
					<?php
					foreach (
						(array) ( $doclap_section['paragraphs'] ?? array() ) as $doclap_paragraph
					) :
						?>
						<p><?php echo doclap_rich( $doclap_paragraph ); ?></p>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<?php if ( '' !== $doclap_image_url ) : ?>
		<section class="section">
			<div class="container">
				<figure class="studio-figure">
					<img
						class="content-img"
						src="<?php echo esc_url( $doclap_image_url ); ?>"
						width="1600"
						height="1068"
						alt="<?php echo esc_attr( (string) ( $attributes['studioImageAlt'] ?? '' ) ); ?>"
						loading="lazy"
					>
					<?php if ( '' !== (string) ( $attributes['studioImageCaption'] ?? '' ) ) : ?>
						<figcaption>
							<?php echo esc_html( (string) $attributes['studioImageCaption'] ); ?>
						</figcaption>
					<?php endif; ?>
				</figure>
			</div>
		</section>
	<?php endif; ?>

	<section class="section dark-panel">
		<div class="container">
			<div class="section-head">
				<div>
					<p class="eyebrow">
						<?php echo esc_html__( '02 / WHAT DOES NOT CHANGE', 'doclap' ); ?>
					</p>
					<h2><?php echo esc_html__( 'Beautiful. And justified.', 'doclap' ); ?></h2>
				</div>
			</div>
			<div class="grid-3">
				<?php foreach ( $doclap_principles as $doclap_principle ) : ?>
					<?php
					if ( ! is_array( $doclap_principle ) ) {
						continue;
					}
					?>
					<article class="feature card-flat">
						<span class="meta">
							<?php echo esc_html( (string) ( $doclap_principle['label'] ?? '' ) ); ?>
						</span>
						<h3>
							<?php echo doclap_rich( (string) ( $doclap_principle['title'] ?? '' ) ); ?>
						</h3>
						<p>
							<?php echo doclap_rich( (string) ( $doclap_principle['copy'] ?? '' ) ); ?>
						</p>
					</article>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<?php if ( isset( $doclap_sections[1] ) && is_array( $doclap_sections[1] ) ) : ?>
		<?php
		$doclap_section         = $doclap_sections[1];
		$doclap_section_heading = doclap_rich_accent(
			(string) ( $doclap_section['heading'] ?? '' ),
			(string) ( $doclap_section['headingAccent'] ?? '' ),
			'<br>',
		);
		?>
		<section class="section">
			<div class="container grid-1-2 body-grid">
				<aside class="aside-title">
					<span>
						<?php echo esc_html( (string) ( $doclap_section['label'] ?? '' ) ); ?>
					</span>
					<h2><?php echo doclap_rich( $doclap_section_heading ); ?></h2>
				</aside>
				<div>
					<div class="prose">
						<?php
						foreach (
							(array) ( $doclap_section['paragraphs'] ?? array() ) as $doclap_paragraph
						) :
							?>
							<p><?php echo doclap_rich( $doclap_paragraph ); ?></p>
						<?php endforeach; ?>
						<?php if ( '' !== (string) ( $attributes['statusNote'] ?? '' ) ) : ?>
							<p><?php echo doclap_rich( (string) $attributes['statusNote'] ); ?></p>
						<?php endif; ?>
					</div>
					<a
						class="text-link"
						href="<?php echo esc_url( home_url( '/frequently-asked-questions/' ) ); ?>"
					>
						<span><?php echo esc_html__( 'Learn more about the process', 'doclap' ); ?></span>
						<?php
						echo doclap_icon( 'arrow-up-right' );
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
						?>
					</a>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<section class="section closing">
		<div class="container row-between">
			<div>
				<p class="eyebrow">
					<?php echo esc_html( (string) ( $attributes['closingEyebrow'] ?? '' ) ); ?>
				</p>
				<h2 data-doclap-rich="closingHeading"><?php echo doclap_rich( $doclap_closing_heading ); ?></h2>
			</div>
			<a
				class="circle-cta"
				href="<?php
					echo esc_url(
						doclap_resolve_url(
							(string) ( $attributes['closingCtaUrl'] ?? '' ),
						),
					);
				?>"
			>
				<span data-doclap-rich="closingCtaLabel"><?php echo doclap_rich( (string) ( $attributes['closingCtaLabel'] ?? '' ) ); ?></span>
				<?php
				echo doclap_icon( 'arrow-up-right' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted theme helper.
				?>
			</a>
		</div>
	</section>
</div>

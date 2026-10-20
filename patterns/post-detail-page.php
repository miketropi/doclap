<?php
/**
 * Title: Doclap — Note detail page
 * Slug: doclap/post-detail-page
 * Categories: doclap, page
 * Description: Article hero, cover, content and related notes, the discussion, then the closing invitation.
 * Keywords: note, page, article, single, comments
 * Viewport Width: 1440
 */

?>
<!-- wp:doclap/note-hero /-->
<!-- wp:doclap/note-cover /-->
<!-- wp:doclap/note-content /-->
<!-- wp:doclap/related-notes /-->
<!-- wp:group {"tagName":"section","className":"doclap-scope doclap-comments section","layout":{"type":"default"}} -->
<section class="wp-block-group doclap-scope doclap-comments section"><!-- wp:comments -->
<div class="wp-block-comments"><!-- wp:comments-title {"showPostTitle":false} /-->

<!-- wp:comment-template -->
<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column {"width":"56px"} -->
<div class="wp-block-column" style="flex-basis:56px"><!-- wp:avatar {"size":56} /--></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:comment-author-name /-->

<!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group"><!-- wp:comment-date /-->

<!-- wp:comment-edit-link /--></div>
<!-- /wp:group -->

<!-- wp:comment-content /-->

<!-- wp:comment-reply-link /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
<!-- /wp:comment-template -->

<!-- wp:post-comments-form /--></div>
<!-- /wp:comments --></section>
<!-- /wp:group -->

<!-- wp:doclap/closing-cta /-->

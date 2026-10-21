# Changelog

All notable changes to the Doclap theme. Entries are grouped per release; the
current version is in `inc/bootstrap/version.php`, and the theme header in
`style.css` carries the same number.

See `README.md` for the architecture, the build commands and the test suites.

## 1.0.0

- First release: twenty-five Doclap blocks — the home landing page split into nine
  section blocks (`doclap/home-hero` … `doclap/home-contact`) plus the sixteen
  remaining surfaces — self-hosted editorial fonts, Doclap colour and font
  presets, colour-scheme switcher preset, and the design-specific contact
  transport.
- Front-end motion layer owned by the theme (`gsap@3.12.5` bundled in
  `assets/js/main.js`): hero opening sequence and scrubbed parallax, sculpture
  pointer-follow, drag and idle motion with a pause control, once-only scroll
  entrances for sections, cards and rows, per-grapheme soft-blur replay on links,
  buttons and headings for both pointer hover and keyboard focus, and magnetic
  round controls. `prefers-reduced-motion: reduce` is a complete static mode.
- Repeater list fields are edited as a bordered ordered list whose rows open a
  modal item editor — **Add**, the row itself and **Duplicate** open it, **Done**
  commits once, and **Cancel** or Escape discards the draft.
- Headings, leads, narrative paragraphs, statements, answers, summaries and
  call-to-action labels are visual rich-text fields (bold, italic, link) sanitized
  with `wp_kses_post()` on output, edited in place where a value maps to one
  server-rendered element.
- Split "heading + heading accent" attribute pairs are now a single formatted
  heading attribute. Pre-existing saved content renders identically until that
  block is saved again, at which point the editor folds the pair into one value and
  drops the legacy accent key.
- The Front Page template composes the nine home section blocks directly, and the
  `Doclap — Home landing` pattern inserts the same composition into any page. The
  monolithic `doclap/portfolio-home` landing block is gone; see *Front page
  template and Site Editor overrides* for the upgrade path.
- Every inner page is composed the same way. `doclap/about-profile` is replaced by
  `doclap/inner-hero`, `doclap/split-narrative`, `doclap/media-figure`,
  `doclap/principles-grid` and `doclap/closing-cta`, and `doclap/single-note` by the
  query-aware `doclap/note-hero`, `doclap/note-cover`, `doclap/note-content` (which
  now owns the article save/copy tools and their front-end script) and
  `doclap/related-notes`. `doclap/contact-form`, `doclap/faq-list` and
  `doclap/notes-archive` lost their hero and closing sections, so each renders only
  the section it owns. Five page patterns (`Doclap — About page`, `Doclap — Contact
  page`, `Doclap — FAQ page`, `Doclap — Notes archive page`, `Doclap — Note detail
  page`) carry the previous copy, and the templates place the same sections
  directly, so every section of every page is independently selectable in List
  View.
- The default Page template was rebuilt on the theme's own sections: a page now
  opens with `doclap/inner-hero` reading the page title and excerpt (via the new
  **Heading source** option), renders its content through the new
  `doclap/page-content` block inside the theme container and prose measure, and
  closes with `doclap/closing-cta`. The core-constrained wrapper it used before put
  the title flush against the viewport edge, skipped the breadcrumb and lost the
  article typography. Prose typography is now scoped to `.doclap-scope .prose`
  rather than a fixed list of section roots, so any surface that marks its text
  `.prose` gets the article rhythm.
- Both paginations (notes archive and search results) share one treatment: the
  search surface now carries the same `navigation pagination index-grid` markup as
  the archive, and the list-flattening rules moved out of one block's stylesheet
  into the shared surface layer, so the pages spread across the two index columns
  instead of stacking inside a single cell.
- The table of contents is a two-level outline: every `h2` is a numbered entry and
  the `h3`s that follow it hang beneath it at 12px with a dash marker, indented to
  the text column so the two levels line up. Nothing deeper is listed, and a
  sub-heading that appears before any heading opens the outline itself instead of
  being dropped. Rendered as an `<ol>` inside the existing `.toc` aside, with
  hairlines between top-level entries and the article's `--doclap-block-*` colours.
- Article block quotes sit on 1rem of padding (`border-block` hairlines show above
  and below the quote) and the comment editor frame is a full-width 1px box instead
  of a bottom rule, so it matches the fields above it.
- The article grid is now `240px minmax(0,900px)` inside a 1400px frame
  (`max-width: 100%`, centred), and the reading measure grew from 65ch to 75ch so
  the wider body column and the tables in it are actually used instead of being
  capped at 781px.
- The note-detail surface was retightened against the 8-point scale in
  `00-tokens.css` (the inner-page layer had drifted to 30 / 45 / 65 / 70 / 90):
  the four article bands run on 64px padding, the metadata sits under the band
  padding instead of on its own 30px, the cover is one step below it, the table of
  contents column is 56px from the body, and the article's own rhythm is now
  16 / 24 / 32 / 40 / 48 / 56 instead of 18 / 28 / 32 / 45 / 65. Lists, separators
  and figures that arrive with a post's content are styled on the same scale.
- A post's own tables — which previously fell through to the browser defaults —
  follow the data-table treatment `ds-table` already used: cells on 1rem of
  padding with 13px copy, a mono uppercase header band on a full-strength rule,
  hairline body rows, a hairline label column and an accent row state on hover,
  with horizontal scrolling when the table is wider than the prose column. Cells carry the full
  heading range — a plan name in `h4`, a price in `h2` — on a compact 20/17/15/13px
  scale with no prose margins, and cell copy keeps the table's own rhythm instead
  of the paragraph gap.
- The single-post template now closes the article with the discussion — the
  Comments block (title, thread with nested replies and the form) in a
  `.doclap-comments` section that shares the article rhythm and the page
  container, with the theme's own type, hairlines, avatars, reply link and field
  and button treatment. `doclap/post-detail-page` composes it the same way.
- Every section block gained the optional **Colours** panel — background, heading
  text and body text — stored as `--doclap-block-bg`, `--doclap-block-heading` and
  `--doclap-block-text` on the block root, so a section's palette can be changed
  without editing the stylesheet; an unset colour keeps the theme default and emits
  nothing. The dark bands (`doclap/principles-grid`, `doclap/closing-cta`) now paint
  their headings in the band's foreground colour, which fixes a dark heading on a
  dark band, and every other piece of text in a section follows the body-text
  colour.
- The `Doclap site footer` wordmark offers the same two brand sources as the
  header: the text mark with its superscript, or a logo from the media library
  (**Brand and colophon → Brand source**). Both blocks now resolve a brand image
  through one helper, so the attachment wins over the stored URL, the URL covers a
  logo whose attachment was deleted, and an image source with nothing selected
  falls back to the text mark instead of leaving an unlabelled link.
- The contact delivery screen opens again. Its Appearance submenu was registered on
  `admin_init`, which runs *after* WordPress has already resolved screen access, so
  **Appearance → Doclap Contact** was listed but refused with "Sorry, you are not
  allowed to access this page." Registration moved to `admin_menu`, and the screen
  now reports **Settings saved.** after a save.

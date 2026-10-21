=== Doclap ===

Contributors: miketropi
Requires at least: 7.0
Tested up to: 7.0
Requires PHP: 8.1
Stable tag: 1.0.0
License: GNU General Public License v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

độc lập — an editorial portfolio child theme for Nextora. Every bespoke surface
(home, about, contact, FAQ, notes archive, search, note detail, 404) is composed
from editable Doclap dynamic blocks.

== Description ==

Doclap is a block child theme of **Nextora** (`Template: nextora`). It ships no
page-builder markup: each surface is a server-rendered dynamic block with its own
editor controls, and the templates place those blocks between the shared header
and footer.

Surfaces and their blocks:

* Front page — nine independently insertable section blocks, in landing order:

  | Block | Section |
  | --- | --- |
  | `doclap/home-hero` | Hero sculpture, two views, credit line |
  | `doclap/home-disciplines` | Discrete design, motion and technology band |
  | `doclap/home-work` | Project cards showing an image or a video, and their media dialogs |
  | `doclap/home-about` | Craft introduction and service list |
  | `doclap/home-process` | Numbered process steps |
  | `doclap/home-team` | Collaboration heading, studio image, role cards |
  | `doclap/home-testimonials` | Perspective carousel and editorial note |
  | `doclap/home-journal` | Journal heading and note links |
  | `doclap/home-contact` | Closing contact band |

* Inner pages — every section is its own block, placed by its template in this
  order:

  | Template | Sections |
  | --- | --- |
  | About Us | `doclap/inner-hero`, two `doclap/split-narrative`, `doclap/media-figure`, `doclap/principles-grid`, `doclap/closing-cta` |
  | Contact Us | `doclap/inner-hero`, `doclap/contact-form` |
  | Frequently Asked Questions | `doclap/inner-hero`, `doclap/faq-list`, `doclap/closing-cta` |
  | Archive and Blog Home | `doclap/inner-hero`, `doclap/notes-archive`, `doclap/closing-cta` |
  | Single (note detail) | `doclap/note-hero`, `doclap/note-cover`, `doclap/note-content`, `doclap/related-notes`, the comment thread, `doclap/closing-cta` |
  | Page (default template) | `doclap/inner-hero` (page-title source), `doclap/page-content`, `doclap/closing-cta` |

* Shared sections — `doclap/inner-hero` (breadcrumb, page title and lead) and
  `doclap/closing-cta` (eyebrow, heading and circular link). Both are reusable on
  any page; the page patterns carry the page-specific copy.
* About sections — `doclap/split-narrative` (aside label and heading with a rich
  paragraph body, an optional status note and text link), `doclap/media-figure`
  (media-library image with alternative text and caption, falling back to the
  bundled studio artwork) and `doclap/principles-grid` (dark panel with reusable
  principle cards).
* Contact — `doclap/contact-form` (the contact aside and the secure message form,
  with real email delivery and no local-only drafts).
* FAQ — `doclap/faq-list` (aside, category filter groups, native `<details>`
  disclosures, live count and empty state).
* Notes archive and blog index — `doclap/notes-archive` (query-driven featured
  note, section heading and count, category links, reading time, pagination and
  the editorial disclaimer).
* Note detail — `doclap/note-hero` (breadcrumb, queried title and excerpt, reading
  progress), `doclap/note-cover` (metadata plus the featured image or the
  accessible fallback artwork), `doclap/note-content` (a two-level table of
  contents — each heading with one level of sub-headings under it — the save/copy
  tools, the filtered note body, disclaimer and archive link) and
  `doclap/related-notes` (same-category-first related notes). The discussion that
  closes the article is WordPress' own Comments block — title, thread with nested
  replies and the comment form — inside a `.doclap-comments` section, so it stays
  editable with core controls and is styled by the theme.
* Pages — the default Page template composes `doclap/inner-hero` with
  `headingSource: page-title` (breadcrumb plus the page's own title and excerpt),
  `doclap/page-content` (the page's own blocks inside the theme's container and
  prose measure) and `doclap/closing-cta`, so a generic page keeps the inner-page
  rhythm instead of falling back to a bare title and a core-constrained column.
* Search — `doclap/search-results` (native WordPress search query).
* 404 — `doclap/not-found`.
* Shared header — `doclap/site-header` (sticky bar, WordPress menu with hover or
  tap submenus, text or image brand, menu control).
* Shared footer — `doclap/site-footer` (studio/discover navigation groups, colophon, back to top).

Every section block is dynamic, lives in the `Doclap Blocks` inserter category and
can be inserted, reordered, duplicated or removed on its own. The
`Doclap — Home landing` pattern inserts all nine in the canonical order when a
whole landing page is wanted, and each block also ships its own one-block pattern
(`doclap/home-hero` … `doclap/home-contact`).

Five further compositions do the same for the inner pages: **Doclap — About page**,
**Doclap — Contact page**, **Doclap — FAQ page**, **Doclap — Notes archive page**
and **Doclap — Note detail page**. Each inserts its template's sections in order
with that page's copy, and every section they compose is also insertable on its
own: `doclap/inner-hero`, `doclap/closing-cta`, `doclap/split-narrative`,
`doclap/media-figure`, `doclap/principles-grid`, `doclap/note-hero`,
`doclap/note-cover`, `doclap/note-content` and `doclap/related-notes`.

* **Upgrading from the single-block inner pages.** The 1.0.0 release replaced the
  `doclap/about-profile` and `doclap/single-note` aggregates with the section
  blocks above and ships no alias for either. The About Us, Contact Us, FAQ,
  Archive, Blog Home and Single templates are file templates that place the new
  sections directly, so resetting a customised copy of any of them in the Site
  Editor restores the composed page. Both aggregates were only ever used by this
  theme's own templates, and the release ships no alias for either.

== Requirements ==

* WordPress 7.0 or later (developed and tested up to 7.0), PHP 8.1 or later.
* The **Nextora** parent theme, active as the parent. Doclap depends on Nextora's
  block, asset and contact-form infrastructure; the parent's `nextora-app` style
  and `nextora-main` script handles are enqueued dependencies of the child assets.
  Doclap reads none of the parent's JavaScript globals: the front-end runtime ships
  its own GSAP copy (see *Front-end motion*).

== Required content setup ==

Doclap does **not** create, modify or delete any content on activation. To match
the reference site, an editor sets up:

1. **Settings → Reading**: a static front page (any page — the front page template
   renders the nine `doclap/home-*` section blocks in landing order).
2. Pages with these slugs, each assigned the matching template in the page
   sidebar (the templates are registered under Appearance → Editor → Templates):

   | Page slug | Template |
   | --- | --- |
   | `about-us` | About Us |
   | `contact` | Contact Us |
   | `faq` | Frequently Asked Questions |

   The three template names are registered by the Nextora parent; Doclap supplies
   the matching `templates/*.html` files, which override the parent's files for
   those names. Doclap deliberately ships no `customTemplates` entry of its own:
   `customTemplates` is merged positionally between parent and child `theme.json`,
   so redeclaring it in the child would silently drop entries the parent registers
   (`page-full-width` among them).

3. Optional: a posts page if the notes archive should live at a path such as
   `/notes/`. The header and footer link to the notes archive through the `@notes`
   token, which resolves to the page set as “Posts page” (or the site home when
   none is set).

The supported URL forms (paths, `#anchor` fragments and the `@notes` / `@search`
tokens) are described under *Editor guidance* below.

=== Front page template and Site Editor overrides ===

`templates/front-page.html` is the canonical composition: one block per landing
section, in order, inside the shared `main` group. A front page saved in the Site
Editor is stored as a `wp_template` override in the database, and that override
always wins over the theme file, so edits made there are not touched by a theme
update.

The landing blocks keep the structural anchors the navigation depends on —
`#work`, `#about`, `#process`, `#team`, `#testimonials`, `#journal` and
`#contact`, plus the `#experiment-flow` and `#experiment-orbit` card ids. Each
section sets that id from its own block anchor: any value entered in
Appearance → Editor → Templates for that block replaces the default, and the
matching header, footer and call-to-action links have to be updated with it.

* **Upgrading from the single-block landing page.** The 1.0.0 release replaced
  the monolithic `doclap/portfolio-home` block with the nine section blocks, and
  ships no alias for it. An existing Site Editor override of the Front Page
  template still contains that block and renders an “unsupported block”
  notice; customisations stored only on it are not migrated automatically.
  Recover by resetting the customised Front Page template, or by replacing the
  `doclap/portfolio-home` instance with the `Doclap — Home landing` pattern.

== Editor guidance ==

Every surface is a dynamic block: the editor canvas renders the same `render.php`
output as the front end, and the content is edited in the block sidebar. Seven
conventions apply across all twenty-five blocks.

* **Section colours.** Every section block — the nine inner-page sections, the three
  narrowed ones (`doclap/contact-form`, `doclap/faq-list`, `doclap/notes-archive`)
  and the ten home colour-aware blocks — ends its sidebar with a **Colours** panel:
  **Background**, **Heading text** and **Body text**. Each is optional and starts
  empty, which means "theme default": the block then emits nothing and the section
  keeps the designed colours. Picking a colour writes it to the block's own CSS
  custom property (`--doclap-block-bg`, `--doclap-block-heading`,
  `--doclap-block-text`), so the section background, its headings and every other
  piece of text in it — eyebrow, lead, metadata, body copy, note text — follow the
  choice without touching the shared stylesheet. The dark bands
  (`doclap/principles-grid`, `doclap/closing-cta`) default their headings to the
  band's foreground, so a heading is never invisible on its own band; if you give a
  light section a dark background, set **Heading text** and **Body text** with it.
* **Hero heading source.** `doclap/inner-hero` either renders the rich heading you
  edit on the canvas (**Custom heading**) or the title of the page it sits on
  (**Page title**, used by the Page template): the page-sourced title keeps the
  page's own data authoritative, falls back to the attribute when no post is in
  context, and lets the lead fall back to the page excerpt.
* **Contextual previews.** `doclap/notes-archive`, `doclap/search-results` and the
  four note-detail blocks (`doclap/note-hero`, `doclap/note-cover`,
  `doclap/note-content`, `doclap/related-notes`) read the query of the page they
  render on. In the editor they preview the currently queried post when there is
  one and deterministic sample copy when there is not, so a block is never edited
  against an empty canvas; the real result set is only visible on the front end.
* **URL fields.** Any URL control accepts an absolute URL, a path such as
  `/about-us/`, a `#anchor` fragment, or the tokens `@notes` (the configured posts
  archive) and `@search` (the search endpoint). Changing a structural `#anchor`
  means updating the matching header, footer and call-to-action links with it.
* **Repeater controls.** List fields — hero views, cards, process steps, note
  links, filter groups, questions and navigation links — are edited as a compact
  ordered list showing each item's position and label. The row itself opens the
  item editor, and the four list mutations — **Move up**, **Move down**,
  **Duplicate** and **Remove** — sit in that row's more-options menu, so the label
  keeps the row's width and every action stays a 44px target. **Add**, the row and
  **Duplicate** open the item in a modal editor: **Done** commits the draft once,
  while **Cancel**, Escape and the modal close button discard it and change
  nothing. Closing the editor returns focus to the row that opened it.
  Removing an item asks for no second confirmation — the list action is explicit
  and the block editor's history provides undo. Lists whose layout depends on a
  fixed count declare a minimum number of items, and remove is disabled at that
  floor.
* **Formatted text.** Fields that legitimately carry mixed inline styling —
  headings, leads, narrative paragraphs, testimonial statements, FAQ answers,
  process and card copy, work summaries and call-to-action labels — are visual
  rich-text fields offering bold, italic and link. Where a value maps to exactly one
  server-rendered element it is edited in place on the canvas: click the text to
  select its block and click it again to place the caret (the caret persists through
  the preview refreshing as you type). List items, dialog copy and empty states use
  the same field inside the item modal or the block sidebar. Only that inline markup
  survives: every rich value is sanitized with `wp_kses_post()` on output. Eyebrows,
  metadata, anchors, URLs, alternative text, captions, form labels and placeholders
  stay plain text.
* **Anchors.** Every block exposes an HTML anchor in the block sidebar; the landing
  sections carry the ids the header and footer navigation link to.
* **Editor chrome.** Blocks with a front-end interactive behaviour (the sculpture
  viewer, the perspective carousel, the work dialogs, the disclosure panels, the
  FAQ filters) show a static preview in the editor and keep their controls in the
  sidebar.

== Front-end motion ==

The front end has one motion layer, built on a GSAP copy the theme owns
(`gsap@3.12.5`, bundled into `assets/js/main.js`); no other bundle imports it. The
layer is presentation-only and never runs in the editor, so the canvas always shows
the resting state and nothing an editor sees depends on it.

* The hero plays its opening sequence once, and its wordmark and visual drift as the
  section scrolls out.
* The sculpture follows the pointer without a press, keeps its drag rotation, floats
  while idle, and answers ArrowLeft/ArrowRight/ArrowUp/ArrowDown plus Home for
  rotation and Reset. The pause control in the hero stops the idle motion and the
  render loop.
* Sections, cards and list rows enter once as they come into view.
* Links, buttons and headings replay a soft blur-in per grapheme on pointer hover and
  on keyboard focus. The animated characters are decorative — the accessible name is
  carried by `aria-label`, so a screen reader hears each label once.
* Round call-to-action and "open project" controls follow the pointer within their
  own box on non-touch input only.

`prefers-reduced-motion: reduce` is a complete static mode: no WebGL renderer, no
character splitting, no scroll entrances, no parallax, no idle float and no
pointer-following transform. All content and controls stay visible and usable, and
changing the preference during a session tears the running animations down and clears
every inline transform, filter and opacity they had applied.

== Menus ==

The `Doclap site header` reads a WordPress menu. With no menu selected it falls
back to the menu assigned to the parent theme's `primary` location; with no menu
available at all it still renders its brand, call to action and reading-progress
bar, without a navigation landmark or a compact menu control.

Hierarchy, labels and URLs live under **Appearance → Menus**, not in the block.
The header block only chooses the menu (`Menu`) and how deep it renders (`Menu
depth`, 1–8). Rich mega panels are authored with Visual Mega Navigation on a
top-level menu item, while ordinary child items render as standard accessible
submenus. When that plugin is inactive the same menu still renders as plain
nested submenus.

Submenus follow the pointer: on a mouse-driven desktop they open on hover or
keyboard focus and close when the pointer or focus leaves, with the chevron as a
decorative indicator only. On touch and compact layouts — tablets and phones,
where there is nothing to hover — the chevron becomes a real disclosure button
that opens the submenu inline and indented by depth. The block therefore
never relies on hover for access: every submenu is reachable by tap and by
keyboard.

The brand is either the text mark or a logo picked from the media library
(**Brand → Brand source**). A logo renders through its attachment, so `srcset`
and the intrinsic dimensions come from WordPress; the text mark is the fallback
while image mode has no logo selected.

Header attributes therefore cover the brand, the call to action, the
accessibility labels, the reading-progress switch and the menu source only. The
former `navItems` and `quickLinks` arrays are a clean cutover: an upgrade has to
recreate those links in a WordPress menu, because no runtime compatibility UI and
no renderer fallback for them remain.

The `Doclap site footer` is still attribute-driven and never depends on a
registered nav menu, so it works on a fresh site with no menus configured and
its studio/discover link groups are edited directly in the block.

Its wordmark offers the same two brand sources as the header
(**Brand and colophon → Brand source**): the text mark with its superscript, or a
logo picked from the media library. Both blocks resolve a brand image through the
same helper, so the attachment wins over the stored URL, the URL covers a logo
whose attachment was deleted, and an image mode with nothing selected falls back
to the text mark instead of rendering an empty link. The footer logo is capped at
`min(70vw, 520px)` wide and `clamp(48px, 9vw, 140px)` tall so a wide logo cannot
push the signature out or overflow the colophon.

== Contact form ==

`POST /doclap/v1/contact` validates a `wp_rest` nonce (`doclap_contact_form`
action), rejects the honeypot, validates required consent/name/email/message,
allowlists the service checkboxes, and rate-limits repeated submissions with a
short transient keyed by a hash of IP and email. No personal data is stored.

=== Delivery settings ===

Delivery configuration is not stored in block content. It lives once per site
under **Appearance → Doclap Contact**, in the `doclap_contact_settings` option:

* the recipient address (defaults to the site admin email), the admin subject and
  the visitor confirmation subject;
* the reCAPTCHA v3 switch (off by default) with its site and secret keys. The
  secret is read server-side from that option and is never rendered into page
  markup, a post, a revision or an export.

Filters:

* `doclap_contact_form_admin_email` — recipient, overriding the option.
* `doclap_contact_form_admin_subject` — admin email subject.
* `doclap_contact_form_user_subject` — visitor confirmation subject.

=== Upgrading to the clean delivery cutover ===

1.0.0 stored delivery configuration on the `doclap/contact-form` block instance.
Those six attributes are gone, with no alias and no shim: `adminEmail`,
`adminEmailSubject`, `userEmailSubject`, `enableRecaptcha`, `recaptchaSiteKey` and
`recaptchaSecretKey` are no longer declared, and anything previously saved in them
is ignored. After upgrading, an administrator enters the delivery settings once
under **Appearance → Doclap Contact**. The visible form copy, the service
checkboxes and every other block attribute are untouched.

== Build ==

Generated files are committed because WordPress consumes them directly:
`assets/css/app.css`, `assets/js/main.js`, and each block's `index.js`,
`index.asset.php`, `view.js` and `view.asset.php`. Author changes in `resources/`
and in each block's TypeScript/PHP sources, then regenerate:

```
npm install
composer install
npm run build          # CSS, then front-end TS, then all blocks
npm run typecheck      # tsc --noEmit
npm run lint:php:all   # PHPStan (level 8) + PHP CS Fixer dry run
composer test          # PHPUnit
npm run ci             # everything above, in order
npm run test:wp        # isolated WordPress smoke run (Playground)
npm run test:wp -- --wp-cli   # the same assertions through WP-CLI
npm run build:package  # doclap-v1.0.0.zip
```

`npm run watch` runs the CSS, TS and block watchers together.

=== Tests ===

* `composer test` — PHPUnit unit suite (`tests/*Test.php`) covering block
  registration, the shared query helpers, contact sanitising and error shaping,
  and reading-time boundaries. WordPress functions are doubled in
  `tests/Support/wp-stubs.php`, so the suite needs no database.
* `npm run test:wp` — smoke assertions (`tests/smoke/assertions.php`) executed in a
  throwaway WordPress, with the local Nextora and Doclap themes mounted. It checks
  the child-theme relationship, registration of every `doclap/*` block, the
  per-block metadata and asset contract (apiVersion, title, icon, keywords,
  supports, and every declared `render`, `editorScript`, `editorStyle`, `style` and
  `viewScript` file plus the generated `.asset.php` beside each declared script),
  `theme.json` parsing and its merge with the parent, the declared font faces and
  compiled assets, the contact REST route, the insertion patterns (each slug
  declared exactly once), the inner-page section schemas (the narrowed blocks no
  longer declare the hero, closing or migrated fields), the ordered composition of
  every requested template against its full-page pattern, and a front-end render of
  every section block with its defaults, its empty optionals and the
  no-queried-post fallbacks. Pass `-- --wp-cli` to
  run the identical assertions against an existing install through WP-CLI
  (`WP_CLI_CMD` may supply a wrapper command, `WP_PATH` the install path).

== Licenses and attribution ==

Theme code: GPL-2.0-or-later, like the parent theme.

Fonts (`assets/fonts/`, self-hosted WOFF2 subsets, latin / latin-ext / vietnamese):

* **Be Vietnam Pro** — SIL Open Font License 1.1.
* **Bodoni Moda** — SIL Open Font License 1.1.
* **IBM Plex Mono** — SIL Open Font License 1.1.

Assets:

* `assets/models/david-head.bin` — the optimized David head mesh used by the home
  hero. Sculpture: Head of Michelangelo's David, **Statens Museum for Kunst (SMK)
  cast sculpture scan, CC0**. Optimized mesh: **Thomas Flynn, CC BY 4.0** —
  https://sketchfab.com/3d-models/head-of-michelangelos-david-optimised-d29af50360624e5e9b1855666475380d
  The credited static poster (`assets/images/david-head-poster.*`) is rendered from
  the same mesh. Both credits are reproduced verbatim in the hero and must stay
  visible.
* `assets/images/studio-workspace.{jpg,webp,avif}` — the collaboration/studio
  photograph shipped with the supplied reference prototype, credited there as an
  Unsplash illustration. Bundled locally (no hotlinking); the original Unsplash
  photo id is not identifiable from the prototype's inlined copy, so re-attribution
  is required if a specific photographer credit is needed.
* Icons are inline SVG paths derived from **Lucide** (ISC license) and require no
  icon font or sprite request.

== Changelog ==

= 1.0.0 =
* First release: twenty-five Doclap blocks — the home landing page split into nine
  section blocks (`doclap/home-hero` … `doclap/home-contact`) plus the sixteen
  remaining surfaces — self-hosted editorial fonts, Doclap colour and font
  presets, colour-scheme switcher preset, and the design-specific contact
  transport.
* Front-end motion layer owned by the theme (`gsap@3.12.5` bundled in
  `assets/js/main.js`): hero opening sequence and scrubbed parallax, sculpture
  pointer-follow, drag and idle motion with a pause control, once-only scroll
  entrances for sections, cards and rows, per-grapheme soft-blur replay on links,
  buttons and headings for both pointer hover and keyboard focus, and magnetic
  round controls. `prefers-reduced-motion: reduce` is a complete static mode.
* Repeater list fields are edited as a bordered ordered list whose rows open a
  modal item editor — **Add**, the row itself and **Duplicate** open it, **Done**
  commits once, and **Cancel** or Escape discards the draft.
* Headings, leads, narrative paragraphs, statements, answers, summaries and
  call-to-action labels are visual rich-text fields (bold, italic, link) sanitized
  with `wp_kses_post()` on output, edited in place where a value maps to one
  server-rendered element.
* Split "heading + heading accent" attribute pairs are now a single formatted
  heading attribute. Pre-existing saved content renders identically until that
  block is saved again, at which point the editor folds the pair into one value and
  drops the legacy accent key.
* The Front Page template composes the nine home section blocks directly, and the
  `Doclap — Home landing` pattern inserts the same composition into any page. The
  monolithic `doclap/portfolio-home` landing block is gone; see *Front page
  template and Site Editor overrides* for the upgrade path.
* Every inner page is composed the same way. `doclap/about-profile` is replaced by
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
* The default Page template was rebuilt on the theme's own sections: a page now
  opens with `doclap/inner-hero` reading the page title and excerpt (via the new
  **Heading source** option), renders its content through the new
  `doclap/page-content` block inside the theme container and prose measure, and
  closes with `doclap/closing-cta`. The core-constrained wrapper it used before put
  the title flush against the viewport edge, skipped the breadcrumb and lost the
  article typography. Prose typography is now scoped to `.doclap-scope .prose`
  rather than a fixed list of section roots, so any surface that marks its text
  `.prose` gets the article rhythm.
* Both paginations (notes archive and search results) share one treatment: the
  search surface now carries the same `navigation pagination index-grid` markup as
  the archive, and the list-flattening rules moved out of one block's stylesheet
  into the shared surface layer, so the pages spread across the two index columns
  instead of stacking inside a single cell.
* The table of contents is a two-level outline: every `h2` is a numbered entry and
  the `h3`s that follow it hang beneath it at 12px with a dash marker, indented to
  the text column so the two levels line up. Nothing deeper is listed, and a
  sub-heading that appears before any heading opens the outline itself instead of
  being dropped. Rendered as an `<ol>` inside the existing `.toc` aside, with
  hairlines between top-level entries and the article's `--doclap-block-*` colours.
* Article block quotes sit on 1rem of padding (`border-block` hairlines show above
  and below the quote) and the comment editor frame is a full-width 1px box instead
  of a bottom rule, so it matches the fields above it.
* The article grid is now `240px minmax(0,900px)` inside a 1400px frame
  (`max-width: 100%`, centred), and the reading measure grew from 65ch to 75ch so
  the wider body column and the tables in it are actually used instead of being
  capped at 781px.
* The note-detail surface was retightened against the 8-point scale in
  `00-tokens.css` (the inner-page layer had drifted to 30 / 45 / 65 / 70 / 90):
  the four article bands run on 64px padding, the metadata sits under the band
  padding instead of on its own 30px, the cover is one step below it, the table of
  contents column is 56px from the body, and the article's own rhythm is now
  16 / 24 / 32 / 40 / 48 / 56 instead of 18 / 28 / 32 / 45 / 65. Lists, separators
  and figures that arrive with a post's content are styled on the same scale.
* A post's own tables — which previously fell through to the browser defaults —
  follow the data-table treatment `ds-table` already used: cells on 1rem of
  padding with 13px copy, a mono uppercase header band on a full-strength rule,
  hairline body rows, a hairline label column and an accent row state on hover,
  with horizontal scrolling when the table is wider than the prose column. Cells carry the full
  heading range — a plan name in `h4`, a price in `h2` — on a compact 20/17/15/13px
  scale with no prose margins, and cell copy keeps the table's own rhythm instead
  of the paragraph gap.
* The single-post template now closes the article with the discussion — the
  Comments block (title, thread with nested replies and the form) in a
  `.doclap-comments` section that shares the article rhythm and the page
  container, with the theme's own type, hairlines, avatars, reply link and field
  and button treatment. `doclap/post-detail-page` composes it the same way.
* Every section block gained the optional **Colours** panel — background, heading
  text and body text — stored as `--doclap-block-bg`, `--doclap-block-heading` and
  `--doclap-block-text` on the block root, so a section's palette can be changed
  without editing the stylesheet; an unset colour keeps the theme default and emits
  nothing. The dark bands (`doclap/principles-grid`, `doclap/closing-cta`) now paint
  their headings in the band's foreground colour, which fixes a dark heading on a
  dark band, and every other piece of text in a section follows the body-text
  colour.
* The `Doclap site footer` wordmark offers the same two brand sources as the
  header: the text mark with its superscript, or a logo from the media library
  (**Brand and colophon → Brand source**). Both blocks now resolve a brand image
  through one helper, so the attachment wins over the stored URL, the URL covers a
  logo whose attachment was deleted, and an image source with nothing selected
  falls back to the text mark instead of leaving an unlabelled link.

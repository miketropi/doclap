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
  | `doclap/home-work` | Two self-initiated canvas studies and their dialogs |
  | `doclap/home-about` | Craft introduction and service list |
  | `doclap/home-process` | Numbered process steps |
  | `doclap/home-team` | Collaboration heading, studio image, role cards |
  | `doclap/home-testimonials` | Perspective carousel and editorial note |
  | `doclap/home-journal` | Journal heading and note links |
  | `doclap/home-contact` | Closing contact band |

* About — `doclap/about-profile`.
* Contact — `doclap/contact-form` (real email delivery, no local-only drafts).
* FAQ — `doclap/faq-list` (category filters, native disclosures, live count).
* Notes archive and blog index — `doclap/notes-archive` (query-driven).
* Note detail — `doclap/single-note` (metadata, table of contents, related notes).
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
output as the front end, and the content is edited in the block sidebar. Six
conventions apply across all eighteen blocks.

* **Contextual previews.** `doclap/notes-archive`, `doclap/single-note` and
  `doclap/search-results` read the query of the page they render on. In the editor
  they preview the currently queried post when there is one and deterministic
  sample copy when there is not, so a block is never edited against an empty
  canvas; the real result set is only visible on the front end.
* **URL fields.** Any URL control accepts an absolute URL, a path such as
  `/about-us/`, a `#anchor` fragment, or the tokens `@notes` (the configured posts
  archive) and `@search` (the search endpoint). Changing a structural `#anchor`
  means updating the matching header, footer and call-to-action links with it.
* **Repeater controls.** List fields — hero views, cards, process steps, note
  links, filter groups, questions and navigation links — are edited as a compact
  ordered list showing each item's position and label, with **Move up**,
  **Move down**, **Duplicate**, **Edit** and **Remove** actions. **Add**,
  **Edit** and **Duplicate** open the item in a modal editor: **Done** commits the
  draft once, while **Cancel**, Escape and the modal close button discard it and
  change nothing. Closing the editor returns focus to the control that opened it.
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
  compiled assets, the contact REST route and the insertion patterns. Pass
  `-- --wp-cli` to
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
* First release: eighteen Doclap blocks — the home landing page split into nine
  section blocks (`doclap/home-hero` … `doclap/home-contact`) plus the eight
  remaining surfaces — self-hosted editorial fonts, Doclap colour and font
  presets, colour-scheme switcher preset, and the design-specific contact
  transport.
* Front-end motion layer owned by the theme (`gsap@3.12.5` bundled in
  `assets/js/main.js`): hero opening sequence and scrubbed parallax, sculpture
  pointer-follow, drag and idle motion with a pause control, once-only scroll
  entrances for sections, cards and rows, per-grapheme soft-blur replay on links,
  buttons and headings for both pointer hover and keyboard focus, and magnetic
  round controls. `prefers-reduced-motion: reduce` is a complete static mode.
* Repeater list fields are edited as a compact ordered list with a modal item
  editor — **Add**, **Edit** and **Duplicate** open it, **Done** commits once, and
  **Cancel** or Escape discards the draft.
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

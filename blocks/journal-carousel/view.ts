/**
 * doclap/journal-carousel front-end behaviour.
 *
 * The strip is the shared carousel runtime: `initCarousel()` owns the scroll-snap
 * track, the counter, the step buttons, the keyboard handling, the reduced-motion
 * behaviour and the teardown, so the journal strip and the testimonial strip
 * cannot drift apart. This bundle only registers the block root.
 *
 * Without this bundle the strip still scrolls by touch, wheel and keyboard; it
 * simply loses the counter and the disabled button states.
 */

import { bootBlocks } from "../../resources/ts/runtime/blocks";
import { initCarousel } from "../../resources/ts/runtime/carousel";

bootBlocks<HTMLElement>(".doclap-journal-carousel", initCarousel);

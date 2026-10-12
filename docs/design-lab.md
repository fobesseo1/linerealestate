# Homepage design comparison

Keep the existing home page unchanged until the user selects a design. The user plans to decide later; this does not authorize switching the main homepage.

Separate previews live at `/design-lab/market`, `/design-lab/cinematic`, `/design-lab/balanced`, and `/design-lab/dynamic`. All read existing published content without changing listings.

User preference on 2026-10-12: preserve the logo's brand red `#e00b41` across every option. Do not substitute gold, ochre, or dark red as the main accent. Use the supplied white-letter logo on dark headers.

B uses 2.1-second banner changes, C 2.4 seconds, and D 2.2 seconds. B adds photo wipes and fast card reactions; C adds camera sweeps and text reveals; D adds photo reveals and price emphasis. B–D also use scroll-triggered section/card appearances, button shine, and moving action arrows. A explores stronger motion with 1.8-second changes, a moving property strip, button highlights, and more pronounced hover reactions. Each preview provides a motion toggle and respects reduced-motion preferences. A is a comparison option, not the selected production design.

All previews use full-width section backgrounds with centrally aligned content capped by consistent gutters. Avoid a fixed-width outer page that abruptly cuts off section backgrounds on wide monitors. Keep A's featured card straight; do not rotate cards to create energy.

Display order: A 제일 다이나믹 (dynamic), B 활기 있는 매물형 (market), C 사진 중심형 (cinematic), D 균형형 (balanced). Stable preview URLs remain unchanged.

Character additions are separate options at /design-lab/dynamic-1 (A-1), market-1 (B-1), cinematic-1 (C-1), balanced-1 (D-1). Base layouts retain their artwork and motion. Shared navigation links both sets. User-supplied local canvas HTML is isolated in script-only sandboxed frames, transparent, drawn at 360px/30fps, paused offscreen and with the motion toggle/reduced-motion preference. Hero guide opens the existing inquiry form; search status reflects actual results; service artwork plays once. Original Downloads files remain intact.

Revision: replace repeated static placements with ONE responsive companion per character preview. A-1 floats and hops alongside scrolling, B-1 uses a sticky exploration strip and reacts to hovered/focused listing titles, C-1 peeks from the screen edge and reveals its bubble on scroll/hover/focus, D-1 walks along a page-progress rail. Position and messages follow scroll/section; actual loading, empty results and focused listings set mood. Character art loops while visible; motion off freezes positioning and art. Each companion can be dismissed and opens the inquiry dialog.

# Doodle Line V2 prototype — refactor report

Generated from `index.html` by `scripts/build-refactor-v2.mjs`.
The public `main` branch and the original `index.html` remain unchanged.

## Implemented

- Identify the isolated V2 prototype
- Group the four editing controls into a square two-column grid
- Install the square two-column responsive UI
- Expand the rack from 21 to 26 brush positions
- Register five new candidate brushes
- Add the missing G21 configuration and five candidate configurations
- Bound Undo by estimated memory instead of twenty full-size canvases
- Unify resize preservation and cap canvas pixel memory
- Remove resize-listener multiplication and JavaScript positioning
- Unify duplicate seat-to-brush maps
- Repair thumbnail fallbacks that referenced undefined variables
- Add deterministic thumbnails for the five candidate brushes
- Eliminate duplicate pointer, mouse, touch and click brush activation
- Use binary search when sampling long paths
- Declare render modes for the candidate brushes
- Install five candidate brush renderers
- Route candidate brushes through the new renderer
- Fix stuck drawing, multi-pointer ambiguity and cancelled strokes
- Use asynchronous Blob-based PNG export
- Remove obsolete script resize-preserve-251105n
- Remove obsolete script rootfix-seat-brush-mode-251105n
- Remove obsolete script save-move-under-G-251105q
- Remove obsolete script TaglineInit_251108ad
- Remove obsolete script ErowBypass_251108ad
- Remove obsolete script doodle-line-offline-registration
- Remove obsolete style save-link-fixed-251105o
- Remove obsolete style save-under-grid-251105q
- Remove the standalone save-position patch
- Remove the standalone side-button-position patch
- Mark the generated file as a test build

## Brush inventory

- Existing brushes retained: 21
- New candidate brushes: 5
- Prototype total: 26

New candidates:

1. `v2_echo` — three parallel traces
2. `v2_wave` — a displaced continuous wave
3. `v2_beads` — alternating filled and outlined beads
4. `v2_ladder` — perpendicular rungs along the gesture
5. `v2_fold` — an alternating folded line

Five candidates were chosen because 21 + 5 produces an even 26-button rack for a two-column layout.

## Automated verification

- Every inline JavaScript block parses successfully with Node's VM parser.
- The generated file contains 26 registered brush positions.
- Pointer capture, bounded Undo memory, Blob export and the candidate renderer are present.
- Obsolete global event interception and post-hoc positioning scripts are absent.

## Deliberately not changed yet

- Fine visual tuning of the original 21 brushes.
- Final selection or refinement of the five new candidates.
- Production deployment to `main`.
- Production service-worker registration is absent from the confirmation build.

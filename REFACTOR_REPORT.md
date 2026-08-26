# Doodle Line V2 prototype — refactor report

Generated from `index.html` by `scripts/build-refactor-v2.mjs`.
The public `main` branch and the original `index.html` remain unchanged.

## Implemented

- Name the prototype explicitly
- Group editing controls into a square two-column grid
- Install the square two-column responsive UI
- Expand the brush rack from 21 to 27 positions
- Register six candidate brush positions
- Add the missing G21 configuration and six candidate brush configurations
- Unify duplicate seat-to-brush maps
- Bound Undo by memory instead of keeping twenty full-size canvases
- Unify resize preservation and cap canvas memory
- Remove resize-listener multiplication and JavaScript positioning
- Repair thumbnail fallbacks that referenced undefined variables
- Draw deterministic thumbnails for the six candidate brushes
- Remove duplicate pointer, mouse, touch, and click brush activation
- Use binary search when sampling long paths
- Declare render modes for the candidate brushes
- Install six candidate brush renderers
- Route candidate brushes through their renderer
- Fix stuck drawing, multi-pointer ambiguity, and cancelled strokes
- Use asynchronous Blob-based PNG export
- Remove obsolete patch script: resize-preserve-251105n
- Remove obsolete patch script: rootfix-seat-brush-mode-251105n
- Remove obsolete patch script: save-move-under-G-251105q
- Remove obsolete patch script: TaglineInit_251108ad
- Remove obsolete patch script: ErowBypass_251108ad
- Remove obsolete patch script: doodle-line-offline-registration
- Remove obsolete patch style: save-link-fixed-251105o
- Remove obsolete patch style: save-under-grid-251105q
- Remove standalone save-position patch
- Remove standalone side-button-position patch
- Mark the file as a test build

## Brush inventory

- Existing brushes retained: 21
- New candidate brushes: 6
- Prototype total: 27

New candidates:

1. `v2_echo` — three parallel traces
2. `v2_wave` — a displaced continuous wave
3. `v2_beads` — alternating filled and outlined beads
4. `v2_weave` — alternating diagonal stitches
5. `v2_sparks` — sparse multi-axis sparks
6. `v2_blocks` — varying outlined blocks

## Verification

- Every inline JavaScript block parses successfully with Node's VM parser.
- The generated file contains 27 registered positions.
- Pointer capture, bounded Undo memory, Blob export, and the new renderer are present.
- Obsolete global event interception and post-hoc patch scripts are absent.

## Deliberately not changed yet

- The visual tuning of the original 21 brushes.
- Final selection of four to six new brushes.
- Production deployment to `main`.

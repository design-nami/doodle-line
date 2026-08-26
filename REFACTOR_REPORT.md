# Doodle Line V2 prototype — refactor report

The public `main` branch and original `index.html` are unchanged. This file is generated on the isolated `refactor-v2-prototype` branch.

## Implemented

- Mark the isolated prototype
- Group editing controls into a two-column square grid
- Install square two-column responsive layout
- Reserve 27 brush positions
- Register six candidate brush seats
- Add missing G21 config and six candidate configs
- Unify duplicate seat-to-brush maps
- Bound Undo by memory rather than 20 full canvases
- Unify resize preservation and cap canvas memory
- Remove repeated resize listener registration and JS positioning
- Repair thumbnail fallback paths with undefined variables
- Add deterministic candidate thumbnails
- Replace 84 brush listeners with one delegated click listener
- Declare candidate render modes
- Install six candidate brush renderers
- Route candidate brushes
- Fix stuck strokes, pointer ambiguity, and cancellation
- Use asynchronous Blob PNG export
- Expose safe test hooks on the isolated prototype
- Remove obsolete script resize-preserve-251105n
- Remove obsolete script rootfix-seat-brush-mode-251105n
- Remove obsolete script save-move-under-G-251105q
- Remove obsolete script TaglineInit_251108ad
- Remove obsolete script ErowBypass_251108ad
- Remove obsolete script doodle-line-offline-registration
- Remove obsolete style save-link-fixed-251105o
- Remove obsolete style save-under-grid-251105q
- Remove standalone save-position patch
- Remove standalone side-button-position patch
- Simplify tagline interactions without duplicate input events
- Label the prototype clearly

## Brush inventory

- Existing brushes retained: 21
- New candidates: 6
- Prototype total: 27

Candidates: echo / wave / beads / weave / sparks / blocks.

## Automated verification

- Parsed all 2 inline JavaScript blocks successfully.
- Confirmed the 27-seat registry, two-column UI, pointer capture, bounded Undo, Blob export, new brush router, and inspection hooks.
- Confirmed obsolete global event interception and post-hoc repair scripts are absent.

## Not deployed

- The public site is untouched.
- The six candidates are proposals, not final selections.
- Existing brush aesthetics have not been deliberately retuned.
- Production service-worker registration is absent from the confirmation build.

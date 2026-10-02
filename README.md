# Handbook

This repository serves as a lightweight team handbook and documentation workspace for product, engineering, and operational knowledge.

## Goals

- Keep the project documentation easy to read and maintain.
- Provide a single place for team decisions, standards, and onboarding notes.
- Make it compatible with GitHub Copilot and documentation workflows.

## Project structure

- `view.html`: shared page, data loading, detail screen, and accessible view-mode dropdown.
- `styles/view.css`: all shared page, card, detail, animation, and responsive styles.
- `styles/view-source.js`: auto-generated classic-script CSS source companion for local-file saves; do not hand edit.
- `views/basic.js`: 기본 보기 — category columns, filtering, and vertical connectors.
- `views/collected.js`: 모아 보기 — compact process map, responsive placement, and horizontal connectors.
- `views/cards.js`: 카드로 보기 — 동일 Process 데이터의 검색 가능한 타이포그래피 중심 카드 탐색.
- `views/fabric.js`: 프로세스 패브릭 — 연결 관계를 곡선 Thread와 Magnetic Focus로 탐색.
- `scripts/build-view.js`: embeds shared CSS and both view modules into `dist/view.html` for standalone distribution.
- `DESIGN.md`: product and engineering design overview for the handbook.
- `.github/copilot-instructions.md`: instructions for GitHub Copilot in this repository.
- `docs/`: additional Markdown-based handbook pages.

## Quick start

```bash
npm run lint:design
```

## View development and distribution

- Edit each viewing mode in its own file to reduce merge conflicts. Mode-specific styles stay with the renderer; all shared styles live in `styles/view.css`, loaded by a stylesheet link marked `data-shared-styles`.
- Open `view.html` directly via `file://` with its `views/` and `styles/` folders. The current files support Save without a server or build. Serving over HTTP with `npm run serve` is optional.
- Run `npm run build` after editing canonical `styles/view.css` to synchronize the generated `styles/view-source.js` companion for local-file saves. Do not hand edit the companion. HTTP saves prefer accessible live CSSOM, so they use current CSS rather than the fallback copy.
- The build also inlines the shared stylesheet as `<style data-shared-styles>` and merges both modes into a standalone `dist/view.html`, removing the companion script tag because CSS is already inlined. No external CSS or view scripts are needed by that viewer. The input page is also copied to `dist/` to preserve navigation.
- The debug-only Save button preserves existing marked inline CSS first, otherwise reads the marked link's live `sheet.cssRules`. If the sheet is unloaded, empty, or inaccessible (including `file://` CSSOM restrictions), it falls back to `window.HandbookSharedCss`, loaded by the generated classic script without fetch. Save aborts only when no nonempty CSS source is available.
- Downloads embed shared CSS, both mode implementations, and current data, and remove the companion script so saved HTML is independent of the source folders. Mode-specific styles are recreated by the embedded modules on reopening.
- The initial mode is 기본 보기; later visits restore the last selected mode.
- The Windows Explorer-style 보기 방식 dropdown shows the current mode and a checkmark beside the selected option. Use arrow keys, Home/End, and Enter/Space to select a mode; Escape closes the menu and returns focus to its button. Selection, outside clicks, and focus leaving the widget also close it. Downloaded HTML always starts with the menu collapsed.

## Contributing

1. Update the relevant Markdown file.
2. Keep language clear and action-oriented.
3. Validate the design doc before merging.

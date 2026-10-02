# Handbook Design

## Status

Draft

## Summary

This project establishes a lightweight handbook for internal documentation. The handbook centralizes product context, engineering standards, operational guidance, and onboarding material in a structure that is easy for teams to maintain and easy for GitHub Copilot to understand.

## Background

Many teams rely on fragmented documentation spread across chat threads, shared drives, and ad hoc notes. This creates inconsistent operating practices, slower onboarding, and duplicated context. A handbook gives the team a clear source of truth for process, standards, and decisions.

## Goals

- Create a single place for team knowledge and operational guidance.
- Keep content easy to write, review, and search.
- Support contributors with a clear structure and documentation standards.
- Make the repository friendly to GitHub Copilot for drafting, reviewing, and maintaining content.

## Non-Goals

- Replacing a full enterprise CMS or wiki platform.
- Building live collaboration features or authenticated user accounts.
- Creating a highly interactive application with complex client-side logic.

## Target users

- New joiners who need onboarding information.
- Engineers who need standards and review guidance.
- Product and operations teams who want a reliable source of truth.

## Functional requirements

1. Content must be authored primarily in Markdown.
2. The repository must provide a clear hierarchy for documentation.
3. Design decisions should be written in a dedicated design document.
4. Copilot guidance should reinforce repository conventions and quality checks.
5. The documentation must stay easy to maintain without heavy tooling.

## Proposed design

The handbook is implemented as a documentation-first repository with the following structure:

- `README.md`: repository overview and onboarding instructions.
- `DESIGN.md`: architecture and design rationale for the handbook.
- `.github/copilot-instructions.md`: repository-specific Copilot guidance.
- `docs/`: supplementary handbook pages and reference material.

This approach keeps the repository simple while making it easy for both humans and AI assistants to navigate the project.

## Content model

### Viewing modes

The interactive handbook viewer exposes a Windows Explorer-style 보기 방식 dropdown
for 기본 보기 / 모아 보기. The trigger displays the current mode and a downward
chevron; the menu marks the selected mode with a checkmark and `aria-checked`.
The menu button and radio menu items support keyboard navigation (arrows,
Home/End, Enter/Space), Escape with focus restoration, and dismissal on selection,
outside clicks, or focus leaving the widget. Startup and downloaded snapshots
collapse the menu without stealing focus; the saved mode preference is unchanged.
Each mode owns its grid placement, filtering behavior, connectors, and mode-specific
styles in a separate script under `views/`. The main viewer retains shared data
loading, cards, details, and navigation. The view registry provides `render`,
`filter`, and `connector` methods so changes to one mode do not require editing
the other mode.

Development loads the separate scripts and the shared `styles/view.css` directly.
The shared stylesheet retains all page, card, detail, animation, and responsive
rules; mode-specific styles stay in their existing view modules.
An auto-generated classic-script companion, `styles/view-source.js`, assigns the
exact canonical CSS text to `window.HandbookSharedCss` using a safely escaped JSON
string. It must not be hand edited. This companion bypasses local-file fetch and
CSSOM restrictions; the current files can be opened and saved directly via
`file://`, without a server or build.

The debug Save action prefers existing marked inline CSS, then the live linked
stylesheet's CSSOM rules. When linked CSS is unloaded, empty, or inaccessible, it
uses the generated companion; it aborts only if no nonempty CSS source exists.
Accessible live CSSOM (including HTTP) takes precedence over the fallback, so
current stylesheet edits are used. After editing `styles/view.css`, run
`npm run build` to synchronize the companion for local-file saves.

The build regenerates the companion from canonical CSS, inlines the marked
stylesheet as `<style data-shared-styles>`, and bundles the view scripts into
standalone HTML under `dist/`. Both the build and Save remove the companion script
tag after embedding CSS. Save also embeds loaded view sources and current data
without fetching local files. Neither standalone output needs external CSS, the
companion, or view scripts.

The handbook uses plain Markdown files with consistent sections such as:

- Overview
- Context
- Rules and standards
- Examples
- Troubleshooting
- References

This consistency allows the repository to scale without requiring a formal content management system.

## Alternatives considered

### Option 1: Notion or external wiki

This would be easy for writing, but it creates content fragmentation and weaker code-based review workflows.

### Option 2: Full app with database-backed content

This adds complexity and maintenance overhead while the team currently needs a lightweight, documentation-first solution.

### Option 3: Markdown-only repository

This is the selected option because it is simple, reviewable in GitHub, and compatible with Copilot-based authoring.

## Risks and mitigations

### Risk: documentation drifts from reality

Mitigation: keep design and operational guidance in a small set of authoritative Markdown files and review changes as part of normal pull requests.

### Risk: inconsistent terminology

Mitigation: define naming conventions and preferred phrasing in the handbook and enforce them in reviews.

### Risk: low contribution quality

Mitigation: add clear writing guidance in the repository instructions and keep examples short and practical.

## Rollout plan

1. Initialize the handbook structure and core files.
2. Add governance, onboarding, and development guidance.
3. Expand the docs tree with project-specific reference material.
4. Review the content regularly and refine language, structure, and examples.

## Open questions

- Which internal teams should own specific handbook sections?
- Do we need a search index or site generation later?
- Should onboarding content be split by team or by role?

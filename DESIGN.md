# SeekScope visual system

The product brief is the authority. SeekScope uses a technical editorial identity: pale paper surfaces for public and learning pages, with a focused dark workspace in the lab. Cylinder coordinates and trace values use monospaced numerals; interface copy uses a restrained sans-serif.

## Tokens
- Canvas: `#F5F6F2`; surface: `#FFFFFF`; ink: `#14252C`; muted: `#65767A`; divider: `#DFE5E0`.
- Brand teal: `#087F80`; active head: `#ED8B5E`; lab: `#101D26`; elevated lab: `#172630`; completed path: `#69C9BB`.
- Compact, measured labels; spacious editorial headings; fine dividers; small corner radii; no decorative chart marks.

## Data visual language
- The 2D cylinder axis is the quantitative source view.
- Request states use distinct pending and serviced marks; the active head is orange.
- Normal travel is solid teal, boundary visits are dotted, and wraparound is dashed orange.
- Plot labels and movement values come from the execution trace.

## Motion
GSAP controls simulation playback from discrete trace events. Reduced-motion preference shortens playback while preserving controls and state changes. Framer Motion is reserved for interface transitions.

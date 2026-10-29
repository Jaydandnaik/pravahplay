# 00-08 — Brand

Working name: **PravahPlay** · Phase 0 · 2026-10-29 · **Owner ratifies the name at this gate.**

## Name screening (quick screen, not legal advice — registry check before public launch)

| Candidate | Verdict | Finding (2026-10-29 web screen) |
|---|---|---|
| ~~JioHotstar~~ | **Rejected** | Registered trademark of the JioStar group; forbidden by the brief's constraint #5 (recorded answer in `00-00` annotated) |
| ~~StreamSetu~~ | Screened out | In use: streamsetu.com — Jaipur-based 24/7 live-streaming service (same industry) |
| ~~ChitraPlay~~ | Screened out | Existing video app (Google Play, INDZS Industries, India) |
| ~~TaraStream~~ | Screened out | Existing CTV channels & advertising company (LinkedIn) |
| ~~GullyPlay~~ | Screened out | Gullyplay Private Limited — sports venue booking app + rummy platform (gullyplay.in) |
| ~~NadiPlay~~ | Screened out | Small Russian-language gaming YouTube channel + nadiplay.com |
| ~~AanganPlay~~ | Weak | Used by an Indian children's daycare brand — adjacent segment, avoid |
| **PravahPlay** | **Clean on screen** | **No web presence found** for "PravahPlay"/"PlayPravah" |

**Recommendation: PravahPlay.** "Pravah" (प्रवाह) = flow/stream — the product is literally a flow
of stories; bilingual resonance (en/hi), short, pronounceable, verb-forms naturally
("pravah on"). Runner-up if the owner dislikes it: coin a fresh word (e.g., "Velvyn"-class
invention) — safest collision class, weaker cultural root.

Pre-launch checklist: IP India + USPTO keyword check (classes 9/38/41); secure handles;
`pravahplay.pages.dev` (free, available by construction of Pages subdomains).

## Visual identity (concept — original assets only)

- **Wordmark concept**: `docs/assets/wordmark-concept.svg` — a rounded-square tile holding three
  ascending flow-waves (the "pravah") that double as a play-chevron; text set in Sora, tracking
  wide. Two variants: tile+wordmark (app/favicon) and wordmark-only (footer).
- **Palette**: Night-Indigo `#14162B` (ground), Saffron `#FF9F1C` (primary CTA — stadium-light
  energy), Stream-Teal `#2EC4B6` (live/accent), Mist `#F6F7FB` (text on dark). All combinations
  pass WCAG AA at UI sizes.
- **Typography**: Sora (SIL OFL) display; Inter (SIL OFL) UI/body. Self-hosted woff2 (no Google
  Fonts runtime calls — privacy + LCP).
- **Voice**: stadium energy, bridge to every screen ("Har screen ka pravah" concept tagline;
  English: "Every screen, one flow"). Marketing copy avoids any sports-league or broadcaster
  vocabulary.

## Brand rules

1. Never reference real leagues, teams, broadcasters or studios in UI, demo data or copy.
2. Simulated match entities use original names (e.g., teams "Indigo Kings" vs "Teal Titans",
  league "Premier Pravah League" — itself screened at Phase 8 kickoff).
3. All brand assets parameterized (`packages/config/brand.ts`) so a rename is mechanical (risk R18).

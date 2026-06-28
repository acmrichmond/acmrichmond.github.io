# ACM Richmond Chapter Website — Claude Instructions

This is the source for [acmrichmond.org](https://acmrichmond.org), a static GitHub Pages site for the ACM Richmond Professional Chapter.

---

## Stack & Architecture

- **Pure static site** — HTML, CSS, vanilla JS. No build step, no framework, no npm.
- **Hosting** — GitHub Pages. Every push to `main` deploys immediately.
- **Domain** — Cloudflare DNS pointing to GitHub Pages.
- **All displayed content comes from `data/*.json` files** fetched at runtime via `fetch()`. Pages read JSON and render it into the DOM. This is the core architectural rule — see Security below.

---

## Local Development

```bash
python3 -m http.server 8743
# Open http://localhost:8743
```

Must use a server (not `file://`) because `fetch()` calls require HTTP.

---

## File Structure

```
/
├── index.html          Home page (hero, stats, pillars, quick links, upcoming event spotlight)
├── events.html         Events page (upcoming + past, calendar widget)
├── media.html          Media page (recorded sessions + event photo cards)
├── gallery.html        Generic photo gallery page (reads ?id= param from URL)
├── about.html          About page (mission, officers grid)
├── join.html           Join Us page (become member, speak, officer, volunteer cards)
├── volunteer.html      Volunteer page (open slots calendar + list)
├── css/style.css       All styles — theme variables, components, responsive breakpoints
├── js/main.js          Shared JS — sanitize(), renderNav(), CalendarWidget, animateIn(), etc.
├── data/
│   ├── events.json         Event records (upcoming + past)
│   ├── media.json          Video recordings + photo gallery entries
│   ├── team.json           Officer profiles
│   └── volunteer-slots.json  Open volunteer slots
├── media/
│   ├── richmond-downtown-nano-banana.png       Hero background image
│   ├── jyostna-seelam-chair.jpeg               Officer headshots (flat files in media/)
│   ├── rasheed-acm-vice-chair.jpg
│   ├── Khadar-vali-membership-chair.jpeg
│   └── acm_and_ieee_collaboration/             Event photo folders (one per event)
└── acm-logo.png
```

---

## CRITICAL: Security Rule

> **All content displayed on the site must come from JSON files in this repository, edited only by officers via pull request. No user-submitted data ever appears on the site.**

This rule exists because bad actors could otherwise submit their own names as speakers or officers. The Google Forms (speak, join, officer) collect submissions privately — officers review them, then manually add approved content to the JSON files via PR.

**What this means in practice:**
- Never render data from URL params, form inputs, or localStorage into the DOM (except the theme toggle, which controls only CSS attributes)
- Always call `sanitize()` on every string from JSON before injecting into innerHTML
- Always call `sanitizeUrl()` on every URL from JSON before using as `href` or `src`
- Never add a feature that lets a visitor control what appears on the page

Both functions are in `js/main.js` and available on every page.

---

## Content Management

All content changes go through PRs against `main`. Here is how to add each content type.

### Add an Event — `data/events.json`

```json
{
  "id": "evt-005",
  "title": "Talk Title Here",
  "speaker": "Speaker Full Name",
  "org": "Speaker's Company",
  "role": "Speaker's Job Title",
  "date": "2026-08-15",
  "time": "2:00 PM EST",
  "format": "Virtual",
  "link": "https://lu.ma/...",
  "type": "upcoming",
  "audience": "Software Engineers",
  "summary": "One-paragraph description of the talk.",
  "video_url": null,
  "photos_url": null
}
```

- `id` — unique, increment from the highest existing (evt-001, evt-002, …)
- `type` — `"upcoming"` shows in the upcoming section; `"past"` moves it to past events
- `link` — RSVP/registration URL; use `null` if none
- `video_url` — YouTube URL added after the event; `null` until then
- `photos_url` — external photo album URL if applicable; use `null` if photos are hosted locally (see Photo Galleries below)
- Insert **newest events first** (top of the array)

### Add a Team Member — `data/team.json`

```json
{
  "name": "Full Name",
  "role": "Director of Marketing",
  "initials": "FN",
  "bio": "Short bio sentence.",
  "linkedin": "https://www.linkedin.com/in/username/",
  "photo": "https://ui-avatars.com/api/?name=Full+Name&background=353535&color=3c6e71&size=256&bold=true&format=png",
  "open": false
}
```

- `photo` — use the ui-avatars.com URL pattern above (replace name). If the officer provides a real headshot, put the file in `media/` and use a relative path like `"media/name-headshot.jpg"`.
- **Photo filenames are case-sensitive** — GitHub Pages runs on Linux. `media/Khadar-vali-membership-chair.jpeg` and `media/khadar-vali-membership-chair.jpeg` are different files. The path in JSON must match the filename on disk exactly, including capitalisation and extension (`.jpg` vs `.jpeg`).
- `linkedin` — use `null` if not provided.
- `open: true` — marks the role as an open position, shown on the Join Us page. Set `false` once filled.
- Officers appear on the About page and Home page in array order.

### Add a Video Recording — `data/media.json`

```json
{
  "type": "video",
  "title": "Talk Title",
  "speaker": "Speaker Name",
  "date": "2026-08-15",
  "thumbnail_url": "https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg",
  "link_url": "https://youtu.be/VIDEO_ID",
  "event_id": "evt-005"
}
```

- Replace `VIDEO_ID` with the YouTube video ID (the part after `v=` or the short ID in `youtu.be/`)
- `event_id` links to the matching entry in `events.json`; can be `null`
- **`video_url` merge** — if `link_url` is omitted from the media entry but `event_id` is set, `media.html` will automatically pull `video_url` from the matching `events.json` entry at runtime. So you can set either `link_url` in `media.json` directly, or `video_url` in `events.json` — both work. Setting `link_url` in `media.json` is preferred (explicit); the merge is a fallback.
- Insert newest first

### Add a Photo Gallery — `data/media.json` + `media/` folder

**Step 1** — Create a folder under `media/` with a descriptive slug, e.g. `media/acm-ieee-aug2026/`. Copy all event photos into it.

**Step 2** — Add an entry to `data/media.json`:

```json
{
  "id": "acm-ieee-aug2026",
  "type": "photos",
  "title": "Event Title Here",
  "description": "One-sentence description of the event.",
  "date": "2026-08-15",
  "thumbnail_url": "media/acm-ieee-aug2026/cover-photo.jpg",
  "photos": [
    "media/acm-ieee-aug2026/cover-photo.jpg",
    "media/acm-ieee-aug2026/photo-002.jpg",
    "media/acm-ieee-aug2026/photo-003.jpg"
  ],
  "event_id": null
}
```

- `id` — must be unique; used as the URL param `gallery.html?id=acm-ieee-aug2026`
- `thumbnail_url` — the cover photo shown on the media page card
- `photos` — full ordered list of all photo paths; cover photo must be first
- Photos display in array order on the gallery page; sort chronologically if filenames encode timestamps
- `.DS_Store` and other OS files must NOT be included

The media page card automatically links to `gallery.html?id=<id>`. The gallery page renders a grid of all photos with a lightbox on click.

### Add a Volunteer Slot — `data/volunteer-slots.json`

```json
{
  "date": "2026-08-15",
  "role": "Event Moderator",
  "time": "1:00 PM – 4:00 PM EST",
  "spots_available": 2,
  "form_url": "https://docs.google.com/forms/...",
  "notes": "Help moderate the monthly tech talk and manage Q&A."
}
```

- `form_url` — link to the Google Form for this specific slot; use the published link, not the edit link
- Remove slots after the event date has passed

---

## Theming & CSS

### Color Palette (Charcoal & Teal)
All colors use CSS custom properties defined in `css/style.css`:

| Variable | Dark mode | Light mode |
|---|---|---|
| `--bg-deep` | `#222222` | `#d9d9d9` |
| `--bg-dark` | `#353535` | `#ffffff` |
| `--text-light` | `#ffffff` | `#353535` |
| `--text-muted` | `#d9d9d9` | `#284b63` |
| `--cyan-glow` | `#3c6e71` | `#3c6e71` |
| `--cyan-bright` | `#4d8b8e` | `#284b63` |

- **Dark is the default** — `:root` holds dark values; `[data-theme="light"]` holds light overrides
- The theme toggle stores the user's preference in `localStorage`
- The head `<script>` on every page reads localStorage and applies `data-theme="light"` before render to avoid flash

### Responsive Breakpoints
- `1024px` — narrow grid layouts
- `900px` — 2-column quick links, 2-column pillars
- `768px` — hamburger nav, stacked hero actions
- `600px` — 1-column media grid, 2-column photo grid
- `480px` — everything single-column, tightest spacing

---

## Pages Reference

| Page | Driven by | Key IDs |
|---|---|---|
| `index.html` | `data/events.json`, `data/team.json` | `#officerGrid`, `#upcomingSpotlight` |
| `events.html` | `data/events.json` | `#calendarWidget`, `#eventList` |
| `media.html` | `data/media.json`, `data/events.json` | `#videoGrid`, `#photosGrid` |
| `gallery.html` | `data/media.json` (by `?id=`) | `#photoGrid`, `#galleryModal` |
| `about.html` | `data/team.json` | `#officerGrid` |
| `join.html` | `data/team.json` (open roles) | `#openPositions` |
| `volunteer.html` | `data/volunteer-slots.json` | `#slotCalendar`, `#slotList` |

---

## Google Form Links

| Purpose | URL |
|---|---|
| Apply to Speak | `https://docs.google.com/forms/d/1eMYXUwFsFEixy_sfY6fhcHXIHY5MrTW9e2OGOR9u44U` |
| Apply for Officer Role | `https://docs.google.com/forms/d/e/1FAIpQLScZHKF9UhTcBZkwYAfJ_ID4JYwEUC-y-1XF-Ft4G_ESHI5Ycw/viewform?usp=publish-editor` |
| ACM Global Membership | `https://www.acm.org/membership` |

---

## Branch Conventions

| Prefix | Use for |
|---|---|
| `feature/` | New pages or major new sections |
| `content/` | Adding events, officers, media, or volunteer slots |
| `fix/` | Bug fixes |
| `style/` | CSS or theme changes |

---

## What Claude Can Help With

- **Adding an event** — provide title, speaker, org, date, time, summary; Claude edits `data/events.json`
- **Adding an officer** — provide name, role, bio, LinkedIn; Claude edits `data/team.json`
- **Adding a video** — provide YouTube URL and event match; Claude edits `data/media.json`
- **Adding a photo gallery** — put photos in `media/<folder>/`; tell Claude the folder name, event title, and cover photo filename; Claude edits `data/media.json`
- **Changing an event from upcoming to past** — tell Claude the event ID; Claude flips `"type"` to `"past"`
- **Adding a YouTube recording to a past event** — provide the YouTube URL and event ID; Claude updates both `events.json` and `media.json`
- **CSS/layout changes** — all in `css/style.css`; describe the visual change you want

## What Claude Must NOT Do

- Add any input fields, forms, or user-controlled content to any page
- Render URL params, cookies, or any external data into the DOM except via the `data/` JSON files
- Skip `sanitize()` or `sanitizeUrl()` when injecting JSON data into innerHTML
- Add external JS libraries or CDN scripts (violates CSP and self-hosting principle)
- Push directly to `main` — always use a branch + PR

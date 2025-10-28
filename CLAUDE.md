# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive web application for visualizing Dutch government policy measures by economic sector. Built for IPE Team's "Sectoren van de Toekomst" analysis project. Features horizontal bar charts with drill-down functionality, IPE corporate branding, and GitHub Pages deployment.

## Common Commands

### Local Development
- **Run local server**: `python serve.py` (opens http://localhost:8000)
- **Update data from Excel**: `python extract_data.py` (regenerates sector_data.json)
- **Install dependencies**: `pip install pandas openpyxl`

### Git Workflow
- **Update live site**: After data changes, commit and push to trigger GitHub Pages rebuild
- **Repository**: https://github.com/instituut-pe/sectoren-van-de-toekomst
- **Live URL**: https://instituut-pe.github.io/sectoren-van-de-toekomst/

### Data Processing
- Source Excel file: `Input voor Tool -- gebaseerd op 202500910 Beleidsoverzicht.xlsx`
- Data extraction reads from sheet "Selectie Beleid voor Tool" (auto-detected by keyword matching in extract_data.py:16-19)
- Measure labels prioritize column D, fallback to combined columns A and B (extract_data.py:48-61)
- Sector data spans columns G through AA (18 economic sectors, 0-indexed columns 6-27)

## Architecture

### Data Pipeline
1. **Excel Input** → `extract_data.py` → **JSON Output** → **Web Visualization**
2. Python script processes Excel rows into sector totals and measure details
3. Chart.js renders interactive horizontal bar charts with IPE branding
4. Static deployment enables embedding in Squarespace via iframe

### Interactive Chart System
- **SectorChart class** (chart.js:2-314) manages state between main view and drill-down view
- **Main view**: Horizontal bars showing sector totals (sorted descending, chart.js:59-180)
- **Drill-down**: Click sector → view individual policy measures (chart.js:182-296)
- **Navigation**: Back button toggles between views (chart.js:298-300)
- **Tooltips**: Show full untruncated labels on hover, measure names truncated at 40 chars in display (chart.js:307-313)
- **Label formatting**: Sector names strip letter prefix via regex (chart.js:302-305)

### Brand Integration
- **IPE colors**: Primary red (#d63f44), aqua (#4790b1), green (#00843b), gray (#9f9f9f), plus extended palette (chart.js:8-30)
- **Typography**: DM Sans font family loaded from Google Fonts with weights 400/500/600/700
- **Layout**: Professional styling matching IPE brand guidelines (beige background #f4ede3, red border accents)
- **Responsive**: Mobile-optimized with reduced heights (chart container default 600px)
- **Reference**: IPE-richtlijnen-huisstijl-v11.pdf contains official brand guidelines

## Data Structure

**JSON Output** (sector_data.json):
```json
{
  "sector_totals": { "Sector Name": amount, ... },
  "sector_details": { "Sector Name": [{"name": "...", "amount": float}, ...] }
}
```

**Excel Processing Logic** (extract_data.py):
- Reads from auto-detected sheet containing "selectie", "beleid", or "tool" in name
- Rows = policy measures, columns G-AA (indices 6-27) = economic sectors (NACE classification)
- Column D (index 3) = primary measure names, columns A+B fallback with " - " separator
- Filters out zero/null values, outputs amounts as floats in millions of euros
- Client-side sorting handles descending order by value

## Embedding and Deployment

**Production URL**: https://instituut-pe.github.io/sectoren-van-de-toekomst/

**Squarespace Integration**: Uses iframe embed with custom styling:
- Height optimization to prevent scrollbars
- IPE-branded container styling
- Responsive breakpoints for mobile

**Update Workflow**:
1. Modify Excel file locally (`Input voor Tool -- gebaseerd op 202500910 Beleidsoverzicht.xlsx`)
2. Run `python extract_data.py` to regenerate sector_data.json
3. Test locally with `python serve.py` (opens browser at localhost:8000)
4. Commit and push → GitHub Pages auto-deploys → Live site updates

## Key Files

- **index.html**: Single-page app with embedded styles, Chart.js CDN, DM Sans font
- **chart.js**: SectorChart class with two-view state machine (sectors/measures)
- **sector_data.json**: Generated JSON consumed by chart.js via fetch API
- **extract_data.py**: Pandas-based Excel→JSON converter with auto-sheet detection
- **serve.py**: Local HTTP server with CORS headers, auto-opens browser on port 8000
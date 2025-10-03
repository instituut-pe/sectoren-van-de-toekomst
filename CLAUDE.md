# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive web application for visualizing Dutch government policy measures by economic sector. Built for the IPE Team's "Sectoren van de Toekomst" (Sectors of the Future) analysis project.

## Common Commands

### Local Development
- **Run local server**: `python serve.py` (opens http://localhost:8000)
- **Update data from Excel**: `python extract_data.py` (regenerates sector_data.json)
- **Install dependencies**: `pip install pandas openpyxl`

### Data Processing
- Source data is in Excel file "Input voor Tool -- gebaseerd op 202500910 Beleidsoverzicht.xlsx"
- Data extraction reads from sheet "Selectie Beleid voor Tool"
- Measure labels prioritize column D, fallback to combined columns A and B
- Sector data spans columns G through AA

## Architecture

### Data Flow
1. **Excel Input** → `extract_data.py` → **JSON Output** → **Web Visualization**
2. Excel contains policy measures with amounts distributed across economic sectors
3. Python script aggregates totals and preserves individual measure details
4. Web interface displays interactive drill-down charts

### File Structure
- `index.html` - Main web interface with Chart.js integration
- `chart.js` - Interactive chart logic with sector/measure switching
- `sector_data.json` - Processed data (auto-generated, do not edit manually)
- `extract_data.py` - Data processing script for Excel-to-JSON conversion
- `serve.py` - Simple HTTP server for local testing

### Chart Functionality
- **Main View**: Bar chart of 18 sectors with total amounts (sorted descending)
- **Drill-down**: Click sector bar to view constituent policy measures
- **Navigation**: Back button returns to sector overview
- **Responsive design** with Dutch language interface

## Data Structure

The application processes government budget data where:
- Each row represents a policy measure
- Columns G-AA represent economic sectors (NACE classification)
- Column D contains primary measure names
- Columns A+B provide fallback naming when D is empty
- Amounts are in millions of euros

## Deployment

For production hosting, upload these files to web server:
- `index.html`
- `chart.js`
- `sector_data.json`

No server-side dependencies required - static files with client-side JavaScript.
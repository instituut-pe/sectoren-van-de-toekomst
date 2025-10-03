# Sectoren van de Toekomst - Interactieve Chart

Een interactieve webapplicatie voor het visualiseren van beleidsmaatrregelen per sector.

## Bestanden

- `index.html` - Hoofdpagina van de webapplicatie
- `chart.js` - JavaScript voor de interactieve chart functionaliteit
- `sector_data.json` - Geëxtraheerde data uit het Excel bestand
- `extract_data.py` - Script om data uit Excel te extraheren
- `serve.py` - Lokale webserver voor testen

## Gebruik

### Lokaal testen

1. Open een terminal in deze map
2. Run: `python serve.py`
3. De webapplicatie opent automatisch in je browser op http://localhost:8000

### Functionaliteit

- **Hoofdweergave**: Toont alle sectoren met hun totale bedragen als bar chart
- **Drill-down**: Klik op een sector om de onderliggende beleidsmaatregelen te zien
- **Terug navigeren**: Gebruik de "Terug naar sectoren" knop om terug te gaan

### Data bijwerken

Als de Excel data wijzigt:

1. Vervang het Excel bestand
2. Run: `python extract_data.py`
3. De `sector_data.json` wordt automatisch bijgewerkt

## Hosting op website

Voor productie gebruik:

1. Upload alle bestanden (`index.html`, `chart.js`, `sector_data.json`) naar je webserver
2. De applicatie werkt standalone zonder server-side dependencies
3. Zorg ervoor dat de JSON file toegankelijk is via HTTP(S)

## Technische details

- Gebruikt Chart.js voor visualisatie
- Responsive design voor verschillende schermformaten
- Nederlandse interface
- Bedragen in miljoenen euro's
- Automatisch sorteren op bedrag (hoogste eerst)
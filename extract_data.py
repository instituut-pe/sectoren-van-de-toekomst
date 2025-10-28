import pandas as pd
import json

def extract_sector_data():
    """Extract sector data from Excel file and prepare for web visualization"""

    # Read the Excel file
    excel_file = "202500910 Beleidsoverzicht.xlsx"
    sheet_name = "Beleid"

    print(f"Reading file: {excel_file}")
    print(f"Using sheet: {sheet_name}")

    df = pd.read_excel(excel_file, sheet_name=sheet_name)

    # Stop at first completely empty row
    # Find the first row where all cells are NaN/empty
    empty_row_idx = None
    for idx, row in df.iterrows():
        if row.isna().all():
            empty_row_idx = idx
            break

    if empty_row_idx is not None:
        print(f"Found empty row at index {empty_row_idx}, truncating data")
        df = df.iloc[:empty_row_idx]

    # Apply filters to clean the data
    niet_toebedelen_col = df.columns[4]  # "Niet kunnen toebedelen"
    generiek_col = df.columns[5]  # "Generiek"
    print(f"Total rows before filtering: {len(df)}")

    # Convert to numeric, treating non-numeric values as NaN
    df[niet_toebedelen_col] = pd.to_numeric(df[niet_toebedelen_col], errors='coerce')
    df[generiek_col] = pd.to_numeric(df[generiek_col], errors='coerce')

    # Filter out rows where "Niet kunnen toebedelen" has any numeric value (positive, negative, or zero)
    df = df[pd.isna(df[niet_toebedelen_col])]
    print(f"Rows after filtering out 'Niet kunnen toebedelen': {len(df)}")

    # Get sector columns (columns H to Z, but exclude Generiek column)
    # Column H is at index 7, Column Z is at index 25
    # Generiek is at index 5, so we skip it when collecting sector columns
    all_columns = df.columns[7:26]  # From H (index 7) to Z (index 25)
    # Filter out the Generiek column from our sector columns
    sector_columns = [col for col in all_columns if col != generiek_col]
    print(f"Processing {len(sector_columns)} sector columns (excluding Generiek)")

    # Convert all sector columns to numeric, treating non-numeric values as NaN
    for col in sector_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # Calculate sector totals
    sector_totals = {}
    for col in sector_columns:
        total = df[col].sum()
        if pd.notna(total) and total != 0:
            sector_totals[col] = total

    # Get measure details for each sector
    sector_details = {}
    for col in sector_columns:
        if col in sector_totals:
            measures = []
            for idx, row in df.iterrows():
                amount = row[col]
                if pd.notna(amount) and amount != 0:
                    # Use "Regeling" column (index 3) for measure name
                    measure_name = None
                    if pd.notna(row.iloc[3]) and isinstance(row.iloc[3], str):
                        measure_name = row.iloc[3]
                    else:
                        # Fallback to combining other columns (only use string values)
                        col_0 = row.iloc[0] if pd.notna(row.iloc[0]) and isinstance(row.iloc[0], str) else ""
                        col_1 = row.iloc[1] if pd.notna(row.iloc[1]) and isinstance(row.iloc[1], str) else ""
                        col_2 = row.iloc[2] if pd.notna(row.iloc[2]) and isinstance(row.iloc[2], str) else ""

                        # Build measure name from available columns
                        parts = [p for p in [col_0, col_1, col_2] if p]
                        if parts:
                            measure_name = " - ".join(parts)

                    # Skip if we couldn't determine a valid measure name
                    if measure_name and isinstance(measure_name, str):
                        measures.append({
                            "name": str(measure_name),
                            "amount": float(amount)
                        })
            sector_details[col] = measures

    # Extract industrie subsector data
    print("\nExtracting industrie subsector data...")
    industrie_data = extract_industrie_subsectors(excel_file)

    # Prepare data for web chart
    chart_data = {
        "sector_totals": sector_totals,
        "sector_details": sector_details,
        "industrie_subsectors": industrie_data
    }

    # Save as JSON for web use
    with open("sector_data.json", "w", encoding="utf-8") as f:
        json.dump(chart_data, f, indent=2, ensure_ascii=False)

    print(f"Data extracted successfully!")
    print(f"Found {len(sector_totals)} sectors with data")
    print(f"Sector totals: {list(sector_totals.keys())}")

    return chart_data

def extract_industrie_subsectors(excel_file):
    """Extract industrie subsector breakdown from separate sheet"""

    # Read the industrie subsector sheet
    df = pd.read_excel(excel_file, sheet_name="Uitsplitsing industrie")

    # Stop at first row where first column contains "SOM"
    som_row_idx = None
    for idx, row in df.iterrows():
        first_cell = row.iloc[0]
        if pd.notna(first_cell) and isinstance(first_cell, str) and first_cell.strip().upper() == "SOM":
            som_row_idx = idx
            break

    if som_row_idx is not None:
        print(f"Found 'SOM' row at index {som_row_idx}, truncating industrie data")
        df = df.iloc[:som_row_idx]

    # Get subsector columns (starting from column 5: "10 Vervaardiging van...")
    subsector_columns = df.columns[5:]  # All columns after "Generiek industrie"

    # Convert all subsector columns to numeric
    for col in subsector_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # Calculate subsector totals
    subsector_totals = {}
    for col in subsector_columns:
        total = df[col].sum()
        if pd.notna(total) and total != 0:
            subsector_totals[col] = total

    # Get measure details for each subsector
    subsector_details = {}
    for col in subsector_columns:
        if col in subsector_totals:
            measures = []
            for idx, row in df.iterrows():
                amount = row[col]
                if pd.notna(amount) and amount != 0:
                    # Use "Regeling" column (index 3) for measure name
                    measure_name = None
                    if pd.notna(row.iloc[3]) and isinstance(row.iloc[3], str):
                        measure_name = row.iloc[3]
                    else:
                        # Fallback to combining other columns (only use string values)
                        col_0 = row.iloc[0] if pd.notna(row.iloc[0]) and isinstance(row.iloc[0], str) else ""
                        col_1 = row.iloc[1] if pd.notna(row.iloc[1]) and isinstance(row.iloc[1], str) else ""
                        col_2 = row.iloc[2] if pd.notna(row.iloc[2]) and isinstance(row.iloc[2], str) else ""

                        # Build measure name from available columns
                        parts = [p for p in [col_0, col_1, col_2] if p]
                        if parts:
                            measure_name = " - ".join(parts)

                    # Skip if we couldn't determine a valid measure name
                    if measure_name and isinstance(measure_name, str):
                        measures.append({
                            "name": str(measure_name),
                            "amount": float(amount)
                        })
            subsector_details[col] = measures

    print(f"Found {len(subsector_totals)} industrie subsectors")

    return {
        "subsector_totals": subsector_totals,
        "subsector_details": subsector_details
    }

if __name__ == "__main__":
    data = extract_sector_data()
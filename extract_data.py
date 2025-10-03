import pandas as pd
import json

def extract_sector_data():
    """Extract sector data from Excel file and prepare for web visualization"""

    # Read the Excel file
    excel_file = "Input voor Tool -- gebaseerd op 202500910 Beleidsoverzicht.xlsx"

    # First, let's see what sheets are available
    xl_file = pd.ExcelFile(excel_file)
    print(f"Available sheets: {xl_file.sheet_names}")

    # Try to find the correct sheet name
    sheet_name = None
    for name in xl_file.sheet_names:
        if "selectie" in name.lower() or "beleid" in name.lower() or "tool" in name.lower():
            sheet_name = name
            break

    if sheet_name is None:
        sheet_name = xl_file.sheet_names[0]  # Use first sheet as fallback
        print(f"Using first sheet: {sheet_name}")
    else:
        print(f"Using sheet: {sheet_name}")

    df = pd.read_excel(excel_file, sheet_name=sheet_name)

    # Get sector columns (G to AA)
    sector_columns = df.columns[6:27]  # G=6, AA=26 (0-indexed)

    # Calculate sector totals
    sector_totals = {}
    for col in sector_columns:
        total = df[col].sum()
        if pd.notna(total) and total > 0:
            sector_totals[col] = total

    # Get measure details for each sector
    sector_details = {}
    for col in sector_columns:
        if col in sector_totals:
            measures = []
            for idx, row in df.iterrows():
                amount = row[col]
                if pd.notna(amount) and amount > 0:
                    # Use column D (index 3) for measure name, fallback to columns A and B combined
                    if pd.notna(row.iloc[3]):
                        measure_name = row.iloc[3]
                    else:
                        # Combine columns A and B when D is not available
                        col_a = row.iloc[0] if pd.notna(row.iloc[0]) else ""
                        col_b = row.iloc[1] if pd.notna(row.iloc[1]) else ""
                        if col_a and col_b:
                            measure_name = f"{col_a} - {col_b}"
                        elif col_a:
                            measure_name = col_a
                        elif col_b:
                            measure_name = col_b
                        else:
                            measure_name = f"Measure {idx+1}"
                    measures.append({
                        "name": str(measure_name),
                        "amount": float(amount)
                    })
            sector_details[col] = measures

    # Prepare data for web chart
    chart_data = {
        "sector_totals": sector_totals,
        "sector_details": sector_details
    }

    # Save as JSON for web use
    with open("sector_data.json", "w", encoding="utf-8") as f:
        json.dump(chart_data, f, indent=2, ensure_ascii=False)

    print(f"Data extracted successfully!")
    print(f"Found {len(sector_totals)} sectors with data")
    print(f"Sector totals: {list(sector_totals.keys())}")

    return chart_data

if __name__ == "__main__":
    data = extract_sector_data()
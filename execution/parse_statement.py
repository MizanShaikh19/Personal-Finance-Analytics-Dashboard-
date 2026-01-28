import pandas as pd
import argparse
import json
import os
import sys

def parse_statement(file_path):
    """
    Standardizes various bank CSV formats into a common schema:
    [Date, Amount, Description]
    """
    try:
        # Read the CSV - trying to be flexible with separators
        df = pd.read_csv(file_path)
        
        # Standardize columns (basic guessing logic)
        columns = [col.lower() for col in df.columns]
        
        # Mapping variations to our target schema
        date_col = next((c for c in df.columns if 'date' in c.lower()), None)
        desc_col = next((c for c in df.columns if any(k in c.lower() for k in ['desc', 'memo', 'info', 'trans'])), None)
        amount_col = next((c for c in df.columns if 'amount' in c.lower()), None)
        
        if not all([date_col, desc_col, amount_col]):
            # Fallback to positional if names don't match
            if len(df.columns) >= 3:
                date_col, desc_col, amount_col = df.columns[0], df.columns[1], df.columns[2]
            else:
                return {"error": "Insufficient columns in CSV"}

        # Extract and format
        df_standard = pd.DataFrame({
            "date": pd.to_datetime(df[date_col]).dt.strftime('%Y-%m-%d'),
            "description": df[desc_col].astype(str),
            "amount": df[amount_col].astype(float)
        })
        
        return df_standard.to_dict(orient='records')
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", help="Path to the CSV file")
    args = parser.parse_args()
    
    if args.input and os.path.exists(args.input):
        result = parse_statement(args.input)
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "File not found"}))

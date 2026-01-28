# SOP: Parse Bank Statement CSV

## Goal
Extract transaction data from a user-uploaded CSV file and prepare it for database insertion.

## Inputs
- `csv_path`: Path to the uploaded bank statement in `.tmp/` or specific upload folder.

## Tools
- `execution/parse_statement.py`: Python script utilizing Pandas to clean and standardize the CSV.

## Workflow
1. **Validation**: Ensure the file exists and is a valid CSV.
2. **Execution**: Call `python execution/parse_statement.py --input <csv_path>`.
3. **Review**: The script will output a standardized JSON or clean CSV to `.tmp/processed_transactions.json`.
4. **Error Handling**: If parsing fails (unknown format), notify the user and ask for the bank's specific column map.

## Output
- A standardized dataset ready for categorization and SQL insertion.

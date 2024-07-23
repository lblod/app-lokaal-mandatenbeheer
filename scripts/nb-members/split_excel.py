import pandas as pd
import sys

excel_file = sys.argv[1]
output_base = excel_file[:excel_file.rfind('.')]

xls = pd.ExcelFile(excel_file)

for sheet_name in xls.sheet_names:
  df = pd.read_excel(xls, sheet_name = sheet_name)
  df.to_csv(f'{output_base}_{sheet_name}.csv', index=False);

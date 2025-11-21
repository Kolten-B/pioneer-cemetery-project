import pandas as pd

# Load your existing CSVs
cem = pd.read_csv("data/cemetery_data.csv")
grid = pd.read_csv("data/grid_lookup.csv")

# Merge based on matching Ward and Block columns
cem_fixed = cem.merge(grid[['Ward', 'Block', 'Grid']], on=['Ward', 'Block'], how='left')

# Save new file
cem_fixed.to_csv("data/cemetery_data_fixed.csv", index=False)

print("✅ cemetery_data_fixed.csv created successfully!")

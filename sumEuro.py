'''import pandas as pd

# Read the CSV file
# df = pd.read_csv("European_data.csv")
df = pd.read_csv("global_power_plant_database.csv")

# Selecting required columns
df = df[['country_long', 'primary_fuel', 'estimated_generation_gwh_2017']]

# Dropping rows with missing values
df = df.dropna(subset=['country_long', 'primary_fuel', 'estimated_generation_gwh_2017'])

# Grouping by country and fuel type, then summing up the generation
summary_df = df.groupby(['country_long', 'primary_fuel']).agg({'estimated_generation_gwh_2017': 'sum'}).reset_index()

# Writing the summary to a new CSV file
# summary_df.to_csv("European_sum.csv", index=False)
summary_df.to_csv("global_sum.csv", index=False)'''


'''
a country-level summary that includes:

Number of power plants per country

Total estimated generation per country

Country center coordinates (latitude & longitude)
'''

import pandas as pd

# Load global power plant data
df = pd.read_csv("global_power_plant_database.csv")

# Select relevant columns
df = df[['country_long', 'primary_fuel', 'estimated_generation_gwh_2017']]

# Drop rows with missing values
df = df.dropna(subset=['country_long', 'primary_fuel', 'estimated_generation_gwh_2017'])

# 1️⃣ Total generation per country per fuel type
country_fuel_summary = df.groupby(['country_long', 'primary_fuel']).agg(
    total_generation_gwh=('estimated_generation_gwh_2017', 'sum'),
    num_power_plants=('primary_fuel', 'count')
).reset_index()

country_fuel_summary.to_csv("global_country_fuel_summary.csv", index=False)
print("Saved country + fuel summary to global_country_fuel_summary.csv")

# 2️⃣ Total generation per fuel type worldwide
fuel_summary = df.groupby('primary_fuel').agg(
    total_generation_gwh=('estimated_generation_gwh_2017', 'sum'),
    num_power_plants=('primary_fuel', 'count')
).reset_index()

fuel_summary.to_csv("global_fuel_summary.csv", index=False)
print("Saved fuel summary to global_fuel_summary.csv")
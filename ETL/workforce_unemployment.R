# ETL Data relevant to workforce development/unemployment

# Possible data sources 
# - ACS
# - Unemployment insurance data (TBD)

library(here)
library(tidyverse)
library(tidycensus)

# Set the API key for the Census 
census_api_key(Sys.getenv("CENSUS_API_KEY"))

# Look at the variable table
# acs1_vars <- load_variables(2020, "acs5")

# Variables for unemployment
# Unemployment rate: B23025_005 (unemployed civilian labor force) / B23025_003 (total civilian labor force)
# Not In labor force: https://www.census.gov/glossary/#term_Notinlaborforce

unemployment_vars <- c("unemployed" = "B23025_005",
                       "total_labor_force" =  "B23025_003")

get_acs_unemployment <- function(year){ 
  get_acs(geography = "tract",
          variables = unemployment_vars,
          state = "DE",
          year = year,
          output = "wide")
}

# 5-year ACS data is available from 2009 through 2020
# But the unemployment variable (B23025_005) is only available 2011 onwards
# Note: The end year should be adjusted when new data become available
target_years <- 2011:2020 

# Create a container table
de_unemployment <- tibble("year" = target_years)

# Map through the target years to get the census data & save to a df column
de_unemployment <- de_unemployment %>%
  mutate(census_df = map(year, get_acs_unemployment))

# Unnest the df column
de_unemployment <- de_unemployment %>%
  unnest(census_df)

# Calculate the proportions unemployed 
de_unemployment <- de_unemployment %>%
  mutate(unemployed_prop = unemployedE / total_labor_forceE)

# Save data
write_rds(de_unemployment, here("data/processed/workforce_unemployment.rds"))

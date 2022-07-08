# ETL Data relevant to workforce development/unemployment

# Possible data sources 
# - ACS
# - Unemployment insurance data (TBD)

library(here)
library(tidyverse)
library(tidycensus)

source(here("utils/label_tracts_with_places.R"))


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
  tryCatch(
    # Try quering
    get_acs(geography = "tract",
            variables = unemployment_vars,
            state = "DE",
            year = year,
            output = "wide"),
    # In case of an error, print out an error message
    error = function(e) cat("Error getting data from Census API")
  )
}

# 5-year ACS data is available from 2009 through 2020
# But the unemployment variable (B23025_005) is only available 2011 onwards
# Note: The end year should be adjusted when new data become available
current_year <- Sys.Date() %>% format(., "%Y") %>% as.numeric()
target_years <- 2011:current_year 

# Target Census Tracts
target_tracts <- c("CT 30.02 (Riverside)" = "10003003002",
                   "CT 6.01" = "10003000601",
                   "CT 6.02" = "10003000602")
target_tracts_labels <- c("Riverside",
                          "Eastlake",
                          "Northeast")
names(target_tracts_labels) <- target_tracts

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

# Label the tracts with city information
de_unemployment <- de_unemployment %>%
  label_tracts_with_places()

# Save the tract data
# Long format
write_rds(de_unemployment, here("data/processed/workforce_unemployment.rds"))

# Transform into summary tables
unemployment_summary_de <- de_unemployment %>%
  group_by(year) %>%
  summarise(unemployed_prop = mean(unemployed_prop, na.rm = TRUE)) %>%
  mutate(label = "Delaware")

unemployment_summary_wilmington <- de_unemployment %>%
  filter(NAME_place == "Wilmington") %>% 
  group_by(year) %>%
  summarise(unemployed_prop = mean(unemployed_prop, na.rm = TRUE)) %>%
  mutate(label = "Wilmington")

unemployment_summary_target_tracts_aggregate <- de_unemployment %>%
  filter(GEOID %in% target_tracts) %>%
  group_by(year) %>%
  summarise(unemployed_prop = mean(unemployed_prop, na.rm = TRUE)) %>%
  mutate(label = "WRK")

unemployment_summary_target_tracts <- de_unemployment %>%
  filter(GEOID %in% target_tracts) %>%
  group_by(year, GEOID) %>% 
  summarise(unemployed_prop = mean(unemployed_prop, na.rm = TRUE)) %>%
  mutate(label = recode(GEOID, !!!target_tracts_labels)) %>% 
  select(-GEOID)

# Long format
unemployment_summary_long <- unemployment_summary_de %>%
  bind_rows(unemployment_summary_wilmington) %>%
  bind_rows(unemployment_summary_target_tracts_aggregate) %>%
  bind_rows(unemployment_summary_target_tracts)

# Wide format - each row is a year
unemployment_summary_wide <- unemployment_summary_long %>%
  pivot_wider(names_from = label, values_from = unemployed_prop)
# Calculate the gaps
unemployment_summary_wide <- unemployment_summary_wide %>%
  mutate(WRK_gap_to_Delaware = WRK - Delaware,
         WRK_gap_to_Wilmington = WRK - Wilmington)

# Save summary tables
write_rds(unemployment_summary_long, here("data/processed/workforce_unemployment_sum_long.rds"))
write_rds(unemployment_summary_wide, here("data/processed/workforce_unemployment_sum_wide.rds"))


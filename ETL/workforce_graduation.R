# Get Student Graduation Data from Open Data Delaware
# https://data.delaware.gov/Education/Student-Graduation/t7e6-zcnn

library(here)
library(tidyverse)

# Function to query the Open Data Delaware API

# Get data for East Side and Edison Schools
# Note: This does not work since the dataset does not contain data for these schools

# graduation <- get_de_open_data("t7e6-zcnn", 
#                  list("$where" = "schoolcode in(575,571)",
#                       "race" = "All Students",
#                       "gender" = "All Students",
#                       "specialdemo" = "All Students",
#                       "$limit" = "50000"))


# Get data for 3 school districts 
christina_brandywine_colonial <- get_de_open_data("t7e6-zcnn",
  list("$where" = "districtcode in(31,33,34)",
       "schoolcode" = "0", # Only get district-wide summaries
       "race" = "All Students",
       "gender" = "All Students",
       "specialdemo" = "All Students",
       "rowstatus" = "REPORTED",
       "$limit" = "50000")
)

# Get statewide data
delaware <- get_de_open_data("t7e6-zcnn",
  list("district" = "State of Delaware",
       "race" = "All Students",
       "gender" = "All Students",
       "specialdemo" = "All Students",
       "rowstatus" = "REPORTED",
       "$limit" = "50000")
)


# Combine data
graduation_joined <- christina_brandywine_colonial %>%
  bind_rows(delaware)

# Clean data types
graduation_joined <- graduation_joined %>%
  # Convert numeric fields to numeric
  mutate(across(c(schoolyear, districtcode, schoolcode,
                  graduates, students, pctgraduates),
                ~as.numeric(.)))

# Save the dataset
write_rds(graduation_joined, here("data/processed/workforce_graduation.rds"))

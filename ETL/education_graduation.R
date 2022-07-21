# Get Student Graduation Data from Delaware Open Data
# https://data.delaware.gov/Education/Student-Graduation/t7e6-zcnn

library(here)
library(tidyverse)
library(RColorBrewer)
source(here("utils/get_de_open_data.R"))
source(here("utils/wrk_pal.R"))

# Function to query the Delaware Open Data API

# Get data for East Side and Edison Schools
# Note: This does not work since the dataset does not contain data for these schools

# graduation <- get_de_open_data("t7e6-zcnn", 
#                  list("$where" = "schoolcode in(575,571)",
#                       "race" = "All Students",
#                       "gender" = "All Students",
#                       "specialdemo" = "All Students",
#                       "$limit" = "50000"))


# Get data for 3 school districts ----------------------------------------------
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

# Add a variable to compare with the state with the 3 regions
graduation_joined <- graduation_joined %>%
  mutate(compare_w_state = recode(district, 
                                  "State of Delaware" = "State of Delaware", 
                                  .default = "Brandywine, Christina, or Colonial"))

# Save the dataset
write_rds(graduation_joined, here("data/processed/education_graduation.rds"))


# Produce the wide file where one row represents a year ------------------------
graduation_gaps  <- graduation_joined %>%
  # Focus on 4-year graduation
  filter(ratetype == "4-year graduation rate") %>% 
  group_by(schoolyear, compare_w_state) %>%
  summarise(pctgraduates = mean(pctgraduates))

# Recode the comapre_with labels for pivoting
graduation_gaps  <- graduation_gaps %>% 
  mutate(group_level = recode(compare_w_state,
                              "State of Delaware" = "delaware",
                              "Brandywine, Christina, or Colonial" = "brandywine_christina_colonial"))

graduation_gaps_wide <- graduation_gaps %>%
  ungroup() %>%
  select(-compare_w_state) %>%
  pivot_wider(names_from = group_level,
              values_from = pctgraduates)

# Calculate the gap
graduation_gaps_wide <- graduation_gaps_wide %>%
  mutate(gap = brandywine_christina_colonial - delaware)

# Add a color palette
color_palette <- brewer.pal(n = 3, name = "Pastel1")
graduation_gaps_wide <- graduation_gaps_wide %>%
  mutate(plot_color = case_when(gap >= 0 ~ get_wrk_color("green"),
                                gap < 0 ~ get_wrk_color(palette = "secondary",
                                                        colorname = "yellow")))

# Save the dataset
write_rds(graduation_gaps_wide, here("data/processed/education_graduation_summary.rds"))

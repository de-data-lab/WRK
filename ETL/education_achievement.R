# Education
library(jsonlite)
library(httr)
library(tidyverse)
library(here)

# Data Source: Delaware Open Data - Student Asessment Performance
# https://data.delaware.gov/Education/Student-Assessment-Performance/ms6b-mt82

# Focusing on schools within the WRK group 
# - Thomas Edison Charter School - Code: 575
# - East Side Charter School - Code: 571

# Compare with:
# - State 
# - Wilmington?
# - Any larger school district (Brandywine district: District Code = 31)

# Census tract 6.02: Brandywine district: District Code = 31
# Census tract 6.01: Brandywine district: District Code = 31
# Census tract 30.02: Christina School District (Code=33) & Colonial School District (Code=34)


# Data Dictionary:
# https://data.delaware.gov/api/views/ms6b-mt82/files/11ade1f2-298b-488d-9ec3-d12100961eb8?download=true&filename=Data%20Dictionary_STUDENTASSESSMENT_PERFORMANCE.pdf

# What is the definition of low income?
# https://www.doe.k12.de.us/Page/1890

# Specify a function to aid parsing URL parameters
get_edu_data <- function(params = list()){
  base_URL <- "https://data.delaware.gov/resource/ms6b-mt82.json?"
  params_URL <- paste0(names(params),"=", params, collapse = "&")
  query_URL <- URLencode(paste0(base_URL, params_URL))
  
  # Convert data to numeric and return as a tibble
  fromJSON(query_URL) %>%
    as_tibble() %>%
    mutate(pctproficient = as.numeric(pctproficient),
           schoolyear = as.numeric(schoolyear))
}

# Get data from the Delaware Open Data Portal
# raw_data <- get_edu_data(
#   list("$where" = "schoolcode>0",
#        "rowstatus" = "REPORTED",
#        "$limit" = "50000")
# )

target_schools <- get_edu_data(
  list("$where" = "schoolcode in(575,571)",
       "race" = "All Students",
       "gender" = "All Students",
       "specialdemo" = "All Students",
       "rowstatus" = "REPORTED",
       "$limit" = "50000")
)

christina_brandywine_colonial <- get_edu_data(
  list("$where" = "districtcode in(31,33,34)",
       "schoolcode" = "0", # Only get district-wide summaries
       "race" = "All Students",
       "gender" = "All Students",
       "specialdemo" = "All Students",
       "rowstatus" = "REPORTED",
       "$limit" = "50000")
)

delaware <- get_edu_data(
  list("district" = "State of Delaware",
       "race" = "All Students",
       "gender" = "All Students",
       "specialdemo" = "All Students",
       "rowstatus" = "REPORTED",
       "$limit" = "50000")
)

delaware_target <- delaware %>%
  filter(grade %in% unique(target_schools$grade),
         contentarea %in% unique(target_schools$contentarea),
         assessmentname %in% unique(target_schools$assessmentname))

christina_brandywine_colonial_target <- christina_brandywine_colonial %>%
  filter(grade %in% unique(target_schools$grade),
         contentarea %in% unique(target_schools$contentarea),
         assessmentname %in% unique(target_schools$assessmentname))

combined_data <- target_schools %>% 
  bind_rows(delaware_target) %>%
  bind_rows(christina_brandywine_colonial_target)

# Clean content area capitalization
combined_data <- combined_data %>% 
  mutate(contentarea = str_to_upper(contentarea))

# Level the grades
combined_data <- combined_data %>%
  mutate(grade = factor(grade, levels = c(
    "3rd Grade",
    "4th Grade",
    "5th Grade",
    "6th Grade",
    "7th Grade",
    "8th Grade",
    "All Students"
  )))


# Save the processed dataset, 
write_rds(combined_data, here("data/processed/education_achievement.rds"))

# Create a wide dataset, comparing, comparing the gap with the Delaware average
education_wide <- combined_data %>% 
  # Disregard grade levels
  filter(subgroup == "All Students") %>%
  # Focus on ELA vs. MATH 
  filter(contentarea %in% c("ELA", "MATH")) %>% 
  # Only get the relevant variables
  select(schoolyear, organization, contentarea, pctproficient)

# Label districts
education_wide <- education_wide %>%
  mutate(org_label = recode(organization,
                            "East Side Charter School" = "east_side",
                            "Edison (Thomas A.) Charter School" = "edison",
                            "Colonial School District" = "colonial",
                            "Christina School District" = "christina",
                            "Brandywine School District" = "brandywine",
                            "State of Delaware" = "delaware"))

# Pivot to one-year-per-row format
education_wide <- education_wide %>%
  select(-organization) %>%
  pivot_wider(names_from = c(contentarea, org_label),
              values_from = pctproficient)

# Bring the delaware columns at the end
education_wide <- education_wide %>%
  relocate(ends_with("_delaware"), .after = last_col())

# Create a table for literacy
ELA <- education_wide %>%
  select(schoolyear, starts_with("ELA_")) %>%
  rename_with(starts_with("ELA_"), .fn = ~str_remove(., "ELA_"))
## Save data
write_rds(ELA, here("data/processed/education_achievement_wide_ELA.rds"))

# Create a table for math
math <- education_wide %>%
  select(schoolyear, starts_with("MATH_")) %>%
  rename_with(starts_with("MATH_"), .fn = ~str_remove(., "MATH_"))
## Save data
write_rds(math, here("data/processed/education_achievement_wide_math.rds"))

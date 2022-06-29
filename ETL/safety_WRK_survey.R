# Extract data from WRK survey results (2020-2021)
# This script requires private data not checked into the GitHub repo
library(tidyverse)
library(readxl)
library(here)
library(codebook)
library(labelled)
library(AzureStor)

# Download the Excel file from the blob storage
AZURE_WRK_SURVEY_RAW_URL <- Sys.getenv("AZURE_WRK_SURVEY_RAW_URL")
AZURE_WRK_SURVEY_RAW_SAS_TOKEN <- Sys.getenv("AZURE_WRK_SURVEY_RAW_SAS_TOKEN")
temp_raw_file <- tempfile()
download_from_url(AZURE_WRK_SURVEY_RAW_URL,
                  sas = AZURE_WRK_SURVEY_RAW_SAS_TOKEN,
                  temp_raw_file)

# Load the downloaded Excel file
survey_raw <- read_xlsx(temp_raw_file)

# Add metadata to the data
metadata(survey_raw) <- c(name = "REACH Riverside Survey Data - 2020-2021",
                          description = "A dataset for the REACH riverside survey",
                          creator = list("@type" = "Organization"))

# Export the colnames for manual labeling
survey_variables <- tibble(var = names(survey_raw))
write_csv(survey_variables, here("data/safety_WRK_survey_variables.csv"))
# Load the manually-coded variables (partially re-coded)
recode_dictionary <- read_csv(here("data/safety_WRK_survey_recode_dictionary.csv"))

# Select only the variables with recode labels
variables_to_recode <- recode_dictionary %>% 
  drop_na(to_name)

# Get the named list for re-labeling the variables 
recode_named_list <- variables_to_recode %>%
  select(to_name, from_name) %>%
  deframe()

# Rename the variables
survey_df <- survey_raw %>% 
  rename(!!!recode_named_list)

# Clean the labels (remove leading numbers and whitespaces)
clearn_variable_labels <- recode_named_list %>% 
  str_remove("^\\d+\\s*[-\\.)]?\\s+") %>%
  str_remove("^\\d+")
# Assumes that the order did not change
names(clearn_variable_labels) <- names(recode_named_list)

# Label the variables using {labelled}
survey_df <- set_variable_labels(survey_df, !!!clearn_variable_labels)

# Convert to factors and set factor levels
## Re-code community safety levels
community_safety_levels <- c("Very poor",
                             "Poor",
                             "Fair",
                             "Good",
                             "Very good")
survey_df <- survey_df %>%
  mutate(community_safety = fct_relevel(community_safety,
                                        community_safety_levels)) 
## Re-code "Feel safe" factor levels
feel_safe_levels <- c("Very unsafe",
                      "Somewhat unsafe",
                      "Somewhat safe",
                      "Very safe")
survey_df <- survey_df %>%
  mutate(across(c(feel_safe_day,
                  feel_safe_night),
                .fns = ~fct_relevel(., feel_safe_levels))) 

# (TBD) Re-code Binary variables ("Yes" or NA) 
vars_to_logical <- c("printz_public_safety", 
                     "safety_concerns_desolation", "safety_concerns_child_abuse", 
                     "safety_concerns_domestic_violence", "safety_concerns_gang", 
                     "safety_concerns_gun_violence", "safety_concerns_homeless", "safety_concerns_burglary", 
                     "safety_concerns_theft", "safety_concerns_drug_use", "safety_concerns_drug_sell", 
                     "safety_concerns_drinking", "safety_concerns_traffic", "future_safe_stable")
# Note: I'm not sure if NA's are representing true missing data or "No" response
# Converting to a logical vector is not suitable because we cannot document missingness here


# Extract Safety-Related Variables  ------------------------------
# Get the safety variables
safety_variables <- variables_to_recode %>% 
  filter(safety_related) %>% 
  pull(to_name)

# Create a dataframe for safety variables only
safety_df <- survey_df %>%
  select(safety_variables)

# Save the dataset to the Azure blob storage
temp_output_file <- tempfile()
write_rds(safety_df, temp_output_file)

# Upload the processed file
AZURE_WRK_SURVEY_PROCESSED_URL <- Sys.getenv("AZURE_WRK_SURVEY_PROCESSED_URL")
AZURE_WRK_SURVEY_PROCESSED_SAS_TOKEN <- Sys.getenv("AZURE_WRK_SURVEY_PROCESSED_SAS_TOKEN")
temp_output_file %>%
  upload_to_url(dest = AZURE_WRK_SURVEY_PROCESSED_URL,
                sas = AZURE_WRK_SURVEY_PROCESSED_SAS_TOKEN)


# Get summary tables for checking in to the repo ------------------------------
# Set aside the free-form responses
textinput_vars <- c("")

# Summary data 
categorical_variables <- c("community_safety",
                           "feel_safe_day", 
                           "feel_safe_night")
categorical_summary_df <- tibble(question = categorical_variables)
count_by_variable <- function(x){
  # Use `ensym` to get unquoted 
  current_variable_ensym <- ensym(x)
  safety_df %>% 
    count(!!current_variable_ensym)
}

categorical_summary_df <- categorical_summary_df %>%
  mutate(summary_df = map(question, count_by_variable))
## Community Safety
community_safety_summary <- safety_df %>% 
  count(community_safety)

# For the "yes" questions, get the number of yes
yes_questions_summary <- safety_df %>% 
  select(vars_to_logical) %>%
  pivot_longer(everything(),
               names_to = "question") %>% 
  mutate(value = case_when(value == "Yes" ~ 1,
                           TRUE ~ 0)) %>%
  group_by(question) %>%
  summarise(total_count = sum(value))

# Save the summary data object
## Bundle summaries as a list of tables
WRK_survey_safety_summaries <- list(
  categoricals = categorical_summary_df,
  yes_questions = yes_questions_summary
)
## Save the summary list
write_rds(WRK_survey_safety_summaries,
          here("data/processed/safety_WRK_survey_2021.rds"))



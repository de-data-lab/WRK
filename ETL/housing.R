# Clean hud data
library(here)
library(tidyverse)
library(readxl)
library(lubridate)

# Get all the raw data
hud_files <- list.files(here("data/raw/hud/"))

# Prepare a container df to bind all dfs together
container_df <- NULL
for (file in hud_files){
  cur_df <- read_excel(here("data/raw/hud", file))
  cur_df <- cur_df %>%
    filter(state == "DE", 
           program_label == "Public Housing") %>%
    mutate(source_file = file)
  
  container_df <- container_df %>%
    bind_rows(cur_df)
}

# Label the years 
container_df <- container_df %>%
  mutate(year = year(Quarter)) %>%
  select(year, source_file, everything())

# Estimate the number of occupied units
container_df <- container_df %>%
  mutate(occupied_units = case_when(pct_occupied == -4 ~ NA_real_,
                                    TRUE ~ round(total_units * (pct_occupied/100), 0)))

# Recode the missing values 
container_df <- container_df %>%
  mutate(across(where(is.numeric),
                ~na_if(., y = -1))) %>%
  mutate(across(where(is.numeric),
                ~na_if(., y = -4)))

# Save the df
write_rds(container_df,
          here("data/processed", "hud_DE_combined.rds"))

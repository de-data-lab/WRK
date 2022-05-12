# Clean hud data
library(here)
library(tidyverse)
library(readxl)
library(lubridate)

hud_files <- list.files(here("data/raw/hud/"))

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

# Label the year
container_df <- container_df %>%
  mutate(year = year(Quarter)) %>%
  select(year, source_file, everything())

write_rds(container_df,
          here("data/processed", "hud_DE_combined.rds"))

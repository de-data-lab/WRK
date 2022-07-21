# ETK Kindergarten Readiness Scores from the Kids Count
library(readxl)
library(tidyverse)
library(here)

kidscount_URL <- "https://datacenter.kidscount.org/rawdata.axd?ind=10050&loc=9"

# Get a temp file to download data
temp_data <- tempfile()
download.file(kidscount_URL, temp_data)

# Read the temp xlsx file 
kinder_readiness_DE <- read_xlsx(temp_data)
# Currently we only have data from 2016-2019

# Convert the data to numeric
kinder_readiness_DE <- kinder_readiness_DE %>%
  mutate(Data = as.numeric(Data)) %>%
  mutate(TimeFrame = as.numeric(TimeFrame))

# Convert the file to a wide format (one row represents a year)
kinder_readiness_DE_wide <- kinder_readiness_DE %>%
  pivot_wider(names_from = `Assessment area`, values_from = Data)

# Calculate the mean percentage across the domains
kinder_readiness_DE_wide <- kinder_readiness_DE_wide %>%
  rowwise() %>%
  mutate(mean = mean(c(Cognitive, Language, Literacy, Physical, `Socio Emotional`))) %>%
  ungroup()

# Save the file
write_rds(kinder_readiness_DE_wide, here("data/processed/", "education_kinder_readiness_wide.rds"))

# Get calendar from the following page
# https://thewarehouse.recdesk.com/Community/Calendar

# Do a POST request. Sample URL:
# https://thewarehouse.recdesk.com/Community/Calendar/GetCalendarItems?facilityId=-1&startDate=1/1/2020&endDate=12/31/2020&getChildren=false&SelectedView=month&SelectedMonth=1&SelectedYear=2020

library(tidyverse)
library(here)
library(httr)
library(jsonlite)
library(lubridate)

# Function to download the calendar data from a specified period
download_calendar <- function(year = 2020){
  # From date 
  from_date = paste0("1/1/", year)
  to_date = paste0("12/31/", year)
  
  # Query the calendar for the given year
  res <- POST("https://thewarehouse.recdesk.com/Community/Calendar/GetCalendarItems",
              query = list(facilityId = -1,
                           startDate = from_date,
                           endDate = to_date,
                           getChildren = FALSE,
                           SelectedView = "month",
                           SelectedMonth = 1,
                           SelectedYear = 2020))
  
  # Get the content of the response as JSON
  res_content <- content(res, as = "text")
  
  # Get the list of dataframes in the content 
  raw_dfs <- fromJSON(res_content)
  
  # Get the events data frame only
  events_df <- raw_dfs$Events %>% 
    as_tibble()
  
  return(events_df)
}


# Get the nested table
# Get the current year
current_year <- Sys.Date() %>%
  format("%Y") %>% 
  as.numeric()
# Get the vector of years that we want to pull calendar
target_years <- 2020:current_year

# Create a parent df for mapping 
all_calendars_df <- tibble(year = target_years)

# Map years and get nested tables of calendars 
all_calendars_df <- all_calendars_df %>% 
  mutate(calendar_df = map(year, ~download_calendar(.)))

# Unnest the tables
all_calendars_df <- all_calendars_df %>%
  unnest(calendar_df)

# Clean up the variables not relevant
all_calendars_df <- all_calendars_df %>% 
  select(-OrganizationId, -EventUrl, -FacilityUrl,
         -MemberId, -MemberName, -Description, -IsPrivate, 
         -AllowPreCart, -InPreCart, -PreCartName)

# Parse date-times from the start and end time character vectors
all_calendars_df <- all_calendars_df %>%
  mutate(across(c(StartTimeISO8601, EndTimeISO8601),
                .fns = ~ymd_hms(.))) %>%
  # Calculate duration of each event
  mutate(duration = EndTimeISO8601 - StartTimeISO8601)

# Calculate the intervals for each event, and calculate the duration in hours
all_calendars_df <- all_calendars_df %>%
  mutate(interval = StartTimeISO8601 %--% EndTimeISO8601) %>%
  mutate(duration_hour = interval / hours())

# Replace the negative/zero duration and long hours to missing
duration_max_hour <- 8
all_calendars_df <- all_calendars_df %>%
  mutate(duration_hour = case_when(duration_hour <= 0 ~ NA_real_,
                                   duration_hour >= duration_max_hour ~ NA_real_,
                                   TRUE ~ duration_hour))

# Get year and month into separate columns for easier data handling
all_calendars_df <- all_calendars_df %>%
  mutate(year = year(StartTimeISO8601),
         month = month(StartTimeISO8601))

# Code locations "-None Specified-" as a missing vaue
all_calendars_df <- all_calendars_df %>% 
  mutate(FacilityName = na_if(FacilityName, "-None Specified-"))

# Code locations that are appearing less than threshold as "Other"
num_locations <- 5
# Create a new column "location" and store coded values 
all_calendars_df <- all_calendars_df %>% 
  mutate(location = fct_lump_n(FacilityName, num_locations))

# TODO: Label the event types 

# Save the processed dataset
write_rds(all_calendars_df, here("data/processed/events_warehouse_calendar.rds"))


# Export names for manual coding ------------------------------------------------
# Get the unique event names for manual labeling and classification
event_names <- all_calendars_df %>%
  transmute(event_name = EventName, event_type = EventType) %>%
  distinct() %>%
  arrange(event_name)

# Save the unique event names
write_csv(event_names, here("data/processed/", "event_names_to_code.csv"))

# TODO: Once the events have the number of participants, load the hand-coded data back.
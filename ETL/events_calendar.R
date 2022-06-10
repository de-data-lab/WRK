# Get calendar from the following page
# https://thewarehouse.recdesk.com/Community/Calendar

# Do a POST request. Sample URL:
# https://thewarehouse.recdesk.com/Community/Calendar/GetCalendarItems?facilityId=-1&startDate=1/1/2020&endDate=12/31/2020&getChildren=false&SelectedView=month&SelectedMonth=1&SelectedYear=2020

library(tidyverse)
library(here)
library(httr)
library(jsonlite)

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

# Get the unique event names for manual labeling and classification
event_names <- all_calendars_df %>%
  transmute(event_name = EventName) %>%
  distinct() %>%
  dplyr::arrange(event_name)

# Save the unique event names
write_csv(event_names, here("data/processed/", "event_names_to_code.csv"))

# TODO: Once the events have the number of participants, load the hand-coded data back.
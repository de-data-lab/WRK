# ETL the light poles data from the Firstmap Delaware
library(here)
library(jsonlite)
library(tidyverse)

# The query URL to get all data
# Note that the WHERE clause is set to get any object ID that's positive (objectId >= 0). 
# Without this clause, the query fails.
query_URL <- "https://enterprise.firstmap.delaware.gov/arcgis/rest/services/Transportation/DE_Boundary_and_Point/FeatureServer/13/query?where=objectId%20%3E=0&f=JSON&outFields=*"

# Set up a container for data
container_df <- NULL

# Start with the page
cur_page <- 1
# Offset for query, to be updated during the loop
result_offset <- 0

# Paginate the query to get all data 
while(TRUE){
  cat("Processing Cases starting with ", result_offset, "\n")
  
  queary_URL_paged <- paste0(query_URL, "&resultOffset=", result_offset)
  
  downloaded_list <- fromJSON(queary_URL_paged)
  
  # Get attributes
  current_attributes <- downloaded_list[["features"]][["attributes"]] %>%
    as_tibble()
  
  # Get geometry
  current_geometry_df <- downloaded_list[["features"]][["geometry"]] 
  
  # Bind the columns
  current_data_df <- current_attributes %>%
    bind_cols(current_geometry_df)
  
  # Bind to the output container
  container_df <- container_df %>% 
    bind_rows(current_data_df)
  
  # Update the offset
  result_offset <- result_offset + nrow(current_data_df)
  
  # Do not continue if the obtained json does not exceed the transfer limit
  if(is.null(downloaded_list$exceededTransferLimit)) break
}


# Save the file
write_rds(container_df, here("data/processed/safety_light_poles.rds"))
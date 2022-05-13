# Query the Delaware Open Data API given the dataset ID

library(tidyverse)
library(jsonlite)

get_de_open_data <- function(resource_id, params = list()){
  base_URL <- str_glue("https://data.delaware.gov/resource/{resource_id}.json?")
  params_URL <- paste0(names(params),"=", params, collapse = "&")
  query_URL <- URLencode(paste0(base_URL, params_URL))
  if(length(params) == 0) query_URL <- base_URL
  raw_data <- fromJSON(query_URL) %>%
    as_tibble()
  return(raw_data)
}


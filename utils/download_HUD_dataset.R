library(httr)
library(stringr)
library(readxl)

# Download a HUD dataset given a year and 
download_HUD_dataset <- function(year, state_range = "AK_MN"){
  state_range_options = c("AK_MN", "MO_WY")
  if(!(state_range %in% state_range_options)){
    stop("state_range should be ", 
         paste(state_range_options, collapse = " or "))
  }

  # Construct the URL
  dataset_URL <- str_glue("https://www.huduser.gov/portal/datasets/pictures/files/TRACT_{state_range}_{year}.xlsx")
  # Use httr::HEAD to check if file exists
  response <- HEAD(dataset_URL)
  # If the file exists 
  if(response$status_code == "200"){
    temp_xlsx <- tempfile()
    download.file(url = dataset_URL,
                  destfile = temp_xlsx)
    read_xlsx(temp_xlsx)
  } else {
    stop("File does not exist.", "Status Code:", response$status_code)
  }
}

# Download a temporary shapefile in zip, unzip it, and load as shapefile
library(sf)

read_shape_URL <- function(URL){
  cur_tempfile <- tempfile()
  download.file(url = URL, destfile = cur_tempfile)
  out_directory <- tempfile()
  unzip(cur_tempfile, exdir = out_directory)
  
  out_df <- read_sf(dsn = out_directory)

  return(out_df)
}
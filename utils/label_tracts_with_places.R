# Label tracts with places/cities for DE
library(sf)

source("utils/read_shape_URL.R")

label_tracts_with_places <- function(input_df){
  
  de_tracts_URL <- "https://www2.census.gov/geo/tiger/GENZ2021/shp/cb_2021_10_tract_500k.zip"
  de_tracts <- read_shape_URL(de_tracts_URL)
  
  de_places_URL <- "https://www2.census.gov/geo/tiger/GENZ2021/shp/cb_2021_10_place_500k.zip"
  de_places <- read_shape_URL(de_places_URL)
  
  
  de_joined <- de_tracts %>%
    st_join(de_places, join = st_intersects, 
            suffix = c("_tract", "_place"))
  
  # Only label
  # - GEOID_place
  # - NAME_place
  # - NAMELSAD_place
  
  de_key_table <- de_joined %>%
    st_drop_geometry() %>% 
    select(GEOID_tract, GEOID_place, NAME_place, NAMELSAD_place)
  
  output_df <- input_df %>% 
    left_join(de_key_table, by = c("GEOID" = "GEOID_tract"))
  
  return(output_df)
}



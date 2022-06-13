# Utility functions to theme the app according to the WRK brand

# Primary colors 
WRK_primary_colors <- c(
  "blue" = "#0c8ccd",
  "navy_blue" = "#123c63",
  "green" = "#00a454"
)

# Secondary colors
WRK_secondary_colors <- c(
  "orange" = "#f5831f",
  "blue_green" = "#298996",
  "yellow" = "#ffc934",
  "gray" = "#d9d9d9",
  "dark_green" = "#236030"
)

# Combine pallets
WRK_pallets <- list(
  primary = WRK_primary_colors,
  secondary = WRK_secondary_colors
)


# Function to produce a helper function to produce a n-length color vector
wrk_pal <- function(palette = "primary",
                    reverse = FALSE,
                    ...){
  
  pal <- WRK_pallets[[palette]]
  
  if(reverse) pal <- rev(pal)
  
  colorRampPalette(pal, ...)
}

# Function to get a specific color from a specific pallette
get_wrk_color <- function(colorname = "blue", 
                          palette = "primary"){
  
  pal <- WRK_pallets[[palette]]
  
  return(pal[[colorname]])
  
}

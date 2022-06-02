#' Function to extract Tech Impact colors as hex codes
#'
#' @param ... Character names of Tech Impact Palette (ti_blue, ti_green, ti_orange, ti_gray) 
#'
tech_impact_colors <- function(...){
  
  tech_impact_palette <- c(
    "ti_blue" = "#0057B8",
    "ti_green" = "#78BE20",
    "ti_orange" = "#ED8B00",
    "ti_gray" = "#C1C6C8"
  )
  
  current_colors <- c(...)
  
  if(is.null(current_colors)) return(tech_impact_palette)
  
  return(tech_impact_palette[current_colors])
}


tech_impact_pallette <- function(...){
  colorRampPalette(tech_impact_colors(), ...)
}

scale_color_tech_impact <- function(palette = "main",
                                    discrete = TRUE, 
                                    reverse = FALSE,
                                    ...) {
  pal <- tech_impact_pallette()
  
  if (discrete) {
    discrete_scale("colour", paste0("tech_impact_pallette"), palette = pal, ...)
  } else {
    scale_color_gradientn(colours = pal(256), ...)
  }
}


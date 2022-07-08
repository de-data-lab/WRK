#' Add a Plotly line & marker trace with an annotation 
#'
#' @param p 
#' @param .data 
#' @param level 
#' @param color 
#' @param dash 
#' @param offset_y 
#' @param offxet_x 
#' @param force_annotation_position 
#' @param font_size 
#'
#' @return
#' @export
#'
#' @examples
plotly_add_employed_ine <- function(p,
                                    .data,
                                    level,
                                    color = "grey",
                                    dash = "solid",
                                    offset_y = 0,
                                    offxet_x = 0.6,
                                    force_annotation_position = FALSE,
                                    font_size = 14) {
  
  # Select the level to plot
  filtered_data <- .data %>% filter(level == {{ level }})
  
  # Calculate the latest year and the corresponding y-value
  # for rendering the annotation
  y_range <- range(.data$prop_employed) %>%
    diff()
  annotation_y_offset <- (y_range / 100) * offset_y
  latest_year <- filtered_data %>% 
    pull(year) %>%
    max()
  latest_prop_employed <- filtered_data %>% 
    filter(year == latest_year) %>% 
    pull(prop_employed)
  previous_prop_employed <- filtered_data %>% 
    filter(year == latest_year - 1) %>% 
    pull(prop_employed)
  annotation_y_position <- case_when(latest_prop_employed < previous_prop_employed ~ latest_prop_employed - annotation_y_offset,
                                     TRUE ~ latest_prop_employed + annotation_y_offset)
  # If annotation position is forced, follow the argument
  if(force_annotation_position == "top") annotation_y_position <- latest_prop_employed + annotation_y_offset
  if(force_annotation_position == "bottom") annotation_y_position <- latest_prop_employed - annotation_y_offset
  
  # Prepare the hover template
  hovertemplate <- str_glue("In {level}, %{{y:,.1%}} of workers were employed in %{{x}}") %>%
    str_wrap_hovertemplate() %>%
    paste0("<extra></extra>")
  

  p %>%
    add_trace(type = "scatter", mode = "markers+lines",
              data = filtered_data,
              color = ~I(color),
              line = list(dash = dash),
              hovertemplate = hovertemplate) %>%
    plotly_add_annotation(text = level,
                          color = color,
                          x = latest_year + offxet_x,
                          y = annotation_y_position,
                          size = font_size)
}
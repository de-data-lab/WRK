#' Create a dubbell plot give a data frame, a x variable, and two y variables 
#'
#' @param summary_data 
#' @param x a string 
#' @param y1 a string 
#' @param y2 a string 
#' @param marker_size 
#' @param y1_color 
#' @param y2_color 
#' @param y1_hovertemplate 
#' @param y2_hovertemplate 
#' @param ... 
#'
#' @return
#' @export
#'
#' @examples 
#' unemployment_summary_wide %>%
#'   plotly_dumbbell(x = "year",
#'                  y1 = "Wilmington",
#'                  y2 = "WRK")

plotly_dumbbell <- function(summary_data = data.frame(),
                           x, y1, y2,
                           marker_size = 12,
                           y1_color = "grey",
                           y2_color = get_wrk_color("green"),
                           y1_hovertemplate = NULL,
                           y2_hovertemplate = NULL,
                           text = NULL){
  
  if (!is.null(text)) text_formula <- as.formula(paste0("~", text))
  
  x_formula <- as.formula(paste0("~", x))
  y1_formula <- as.formula(paste0("~", y1))
  y2_formula <- as.formula(paste0("~", y2))
  
  summary_data %>% 
    plot_ly(text = text_formula) %>%
    add_segments(x = x_formula,
                 xend = x_formula,
                 y = y1_formula,
                 yend = y2_formula,
                 color = I("grey")) %>%
    # Add markers for East Side Students
    add_markers(x = x_formula,
                y = y1_formula,
                color = I(y1_color),
                hovertemplate = y1_hovertemplate,
                marker = list(opacity = 1, size = marker_size)) %>%
    add_markers(x = x_formula,
                y = y2_formula,
                color = I(y2_color),
                hovertemplate = y2_hovertemplate,
                marker = list(size = marker_size)) %>%
    # Remove grid lines
    layout(xaxis = list(showgrid = FALSE)) %>% 
    # Remove axis titles
    plotly_remove_axis_titles() %>%
    # Hide legend 
    hide_legend() %>%
    # Hide modebar
    plotly_hide_modebar() %>%
    # Disable zoom
    plotly_disable_zoom()
}

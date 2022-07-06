#' Render a line plot showing the kindergarten readiness across the WRK Group 
#' and Delaware children 
#'
#' @param summary_df a summary dataset with the following columns:
#' `year`, `kinder_ready_prop`, `location_label`
#'
#' @return Plotly object
#' @export
#'
#' @examples
render_kinder_readiness <- function(summary_df) {
  # Set the title
  plot_title <- "Children achieving kindergarten readiness"
  title_size <- 14
  
  # Create the plot
  plot_ly(
    x = ~year,
    y = ~kinder_ready_prop,
    text = ~location_label,
    hovertemplate = "In %{x} in %{text}, %{y:.0%} of children were kindergarten ready <extra></extra>"
  ) %>%
    add_trace(
      data = summary_df %>% filter(location_label == "Riverside"),
      type = "scatter", 
      mode = "markers+lines",
      hoveron = "points",
      color = I(WRK_primary_colors[["green"]])) %>%
    add_trace(
      data = summary_df %>% filter(location_label == "Delaware"),
      type = "scatter", 
      mode = "markers+lines",
      hoveron = "points",
      color = I("gray")) %>%
    # Format the y-axis as percentages 
    layout(yaxis = list(tickformat = ".0%")) %>%
    # Add title 
    layout(title = list(text = plot_title,
                        xanchor = "left", x = 0,
                        font = list(size = title_size))) %>% 
    # Add annotations
    # Add annotation labels for the Riverside and Delaware
    layout(annotations = list(
      x = 2020, 
      y = 0.75, 
      text = "Riverside",
      font = list(size = 16, color = get_wrk_color("green")),
      showarrow = FALSE
    )) %>%
    layout(annotations = list(
      x = 2017, 
      y = 0.625, 
      text = "Delaware",
      font = list(size = 16, color = "gray"),
      showarrow = FALSE
    )) %>%
    # Add source
    plotly_caption_source("Kids Count", 
                          "https://datacenter.kidscount.org/data/tables/10050-kindergarten-readiness",
                          y = -0.08) %>% 
    # Hide gridlines for the x-axis
    layout(xaxis = list(showgrid = FALSE)) %>%
    hide_legend() %>%
    plotly_remove_axis_titles() %>%
    plotly_hide_modebar() %>%
    plotly_disable_zoom()
}


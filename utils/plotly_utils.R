# Utility Functions for Plotly

# Place the lenged on top right
plotly_legend_top_right <- function(p) {
  layout(p, legend = list(orientation = 'h',
                          yanchor = "top",
                          y = 1.05,
                          xanchor = "right",
                          x = 1))
}

plotly_legend_bottom_center <- function(p) {
  layout(p, legend = list(orientation = 'h',
                          xanchor = "center",
                          x = 0.5,
                          yanchor = "bottom",
                          y = -0.2))
}

plotly_disable_zoom <- function(p) {
  p %>%
    layout(xaxis = list(fixedrange = TRUE),
           yaxis = list(fixedrange = TRUE))
}

plotly_hide_modebar <- function(p) {
  p %>%
    config(displayModeBar = FALSE)
}


format_plotly <- function(p) {
  p %>%
    plotly_legend_bottom_center() %>%
    plotly_disable_zoom() %>%
    plotly_hide_modebar() %>%
    layout(plot_bgcolor = "transparent",
           paper_bgcolor = "transparent")
}

plotly_remove_axis_titles <- function(p) {
  # Remove axis title
  p %>% 
    layout(yaxis = list(title = ""),
           xaxis = list(title = ""))
}


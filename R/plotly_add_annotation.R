plotly_add_annotation <- function(p, text,
                                  x, y, color, 
                                  size,
                                  align = "center",
                                  xanchor = "center") {
  p %>% 
    layout(annotations = list(
      align = align,
      xanchor = xanchor,
      x = x, 
      y = y, 
      text = text,
      font = list(size = size, color = color),
      showarrow = FALSE))
  
}

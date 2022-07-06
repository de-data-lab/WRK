plotly_add_annotation <- function(p, text,
                                  x, y, color, 
                                  size) {
  p %>% 
    layout(annotations = list(
      x = x, 
      y = y, 
      text = text,
      font = list(size = size, color = color),
      showarrow = FALSE))
  
}

plotly_caption_source <- function(p, name,
                                  href,
                                  x = 1, y = -0.1) {
  # Create the caption body
  a_tag <- a(name, href = href)
  
  # Create the source text
  caption <- paste0("Source: ", a_tag)
  
  p %>% 
    add_annotations(x = x, y = y,
                    text = caption,
                    showarrow = FALSE, xref ="paper", yref = "paper", 
                    xanchor = "right", yanchor = "auto",
                    font = list(color = "grey"))
}

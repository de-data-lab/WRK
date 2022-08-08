plotly_caption_source <- function(p, name,
                                  href = NULL,
                                  x = 1, y = -0.1) {
  # Create the caption body
  a_tag <- a(name, href = href)
  
  # If href is null, just use span
  if(is.null(href)) a_tag <- span(name)
  
  # Create the source text
  caption <- paste0("Source: ", a_tag)
  
  p %>% 
    add_annotations(x = x, y = y,
                    text = caption,
                    showarrow = FALSE, xref ="paper", yref = "paper", 
                    xanchor = "right", yanchor = "auto",
                    font = list(color = "grey"))
}

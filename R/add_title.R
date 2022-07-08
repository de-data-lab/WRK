#' Add a title to a Plotly plot
#'
#' @param p 
#' @param text 
#' @param title_size 
#' @param xanchor 
#' @param x 
#'
#' @return
#' @export
#'
#' @examples
add_title <- function(p, text, title_size = 16,
                      xanchor = "left", x = 0) {
  p %>% 
    layout(title = list(text = text,
                        xanchor = xanchor, x = x,
                        font = list(size = title_size)))
}

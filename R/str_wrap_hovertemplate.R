#' Wrap string in a safe way for the plotly hovertemplate
#'
#' @param string 
#'
#' @return
#' @export
#'
#' @examples
str_wrap_hovertemplate <- function(string, ...) {
  string %>%
    str_wrap(..., width = 40) %>% 
    # Patch the instances where a line break is inserted 
    # between a percent sign and a brace
    str_replace("%\\n\\{", "%{")
}
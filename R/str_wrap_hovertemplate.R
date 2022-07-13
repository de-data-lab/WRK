#' Wrap string in a safe way for the plotly hovertemplate
#'
#' @param string 
#'
#' @return
#' @export
#'
#' @examples
str_wrap_hovertemplate <- function(string, ..., width = 40) {
  string %>%
    str_wrap(..., width = width) %>% 
    # Patch the instances where a line break is inserted 
    # between a percent sign and a brace
    str_replace("%\\n\\{", "%{")
}
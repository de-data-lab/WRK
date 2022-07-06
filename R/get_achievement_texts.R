#' Get a list of texts to render for the education achievement section
#'
#' @param summary_df 
#' @param coeff 
#'
#' @return
#' @export
#'
#' @examples
get_achievement_texts <- function(summary_df, coeff){
  # Create values for plotting
  # Get the latest year
  latest_year <- summary_df %>% 
    filter(schoolyear == max(schoolyear)) %>% 
    mutate(across(where(is.numeric), round, 1))
  # Get the text indicating the direction
  direction_text <- 
    case_when(coeff > 0 ~ "improving",
              coeff == 0 ~ "staying the same",
              coeff < 0 ~ "worsening")
  
  list(df = latest_year,
       direction_text = direction_text,
       coeff = coeff)
}

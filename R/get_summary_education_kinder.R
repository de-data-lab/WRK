#' Get a summary table about kindergarten readiness
#'
#' @return
#' @export
#'
#' @examples
get_summary_education_kinder <- function(){
  kinder_readiness_DE_wide <- read_rds(here("data/processed/education_kinder_readiness_wide.rds"))
  DE_kinder <- kinder_readiness_DE_wide %>%
    transmute(year = TimeFrame,location = Location,
              kinder_ready_prop = mean)
  
  WRK_wide <-
    read_rds(here("data/processed/education_kinder_readiness_WRK.rds"))
  
  WRK_kinder <- WRK_wide %>%
    transmute(year = year, location = "WRK",
              kinder_ready_prop = kinder_ready_prop) %>%
    arrange(year)
  
  all_kinder <- DE_kinder %>%
    bind_rows(WRK_kinder)
  
  # Set labels and colors for plotting
  all_kinder <- all_kinder %>%
    # Set labels 
    mutate(location_label = recode(location,
                                   "WRK" = "Riverside"))
  
  all_kinder
  
}

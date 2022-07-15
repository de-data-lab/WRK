#' Render the employment plot comparing one level to another
#'
#' @param .data 
#' @param level the target level
#' @param compare_to the baseline level to compare to
#'
#' @return a plotly object
#' @export
#'
#' @examples
render_employment <- function(.data, level = "WRK", compare_to = "Wilmington") {

  level_label <- level
  level_annotation <- level
  if (level == "WRK"){
    level_label <- "the 3 census tracts served by the WRK group"
    level_annotation <- "Riverside, \nEastlake, \n& Northeast"
  }
  
  gap_variable <- str_glue("{level}_gap_to_{compare_to}")
  baseline_hovertemplate <- str_glue("In {compare_to}, %{{y:,.1%}} of workers were employed in %{{x}} <extra></extra>")
  target_hovertemplate <- str_glue("In {level_label}, %{{y:,.1%}} of workers were employed in %{{x}}.
  The gap to {compare_to} was %{{text:+,.1%}} <extra></extra>")
  
  # Set Plot title
  plot_title <- str_glue("Employment rate of {level_label} compared to {compare_to}")
  
  # Determine the positions of the annotations
  offset <- 0.01
  # Get the latest year 
  latest_year <- .data %>% 
    pull(year) %>%
    max()
  # Get the y-positions for the latest year and offset
  positions <- .data %>% 
    filter(year == latest_year)
  
  # Get the positions of the annotations
  target_latest <- positions[[level]]
  baseline_latest <- positions[[compare_to]]
  annotations_pos <- list()
  if(target_latest > baseline_latest){
    annotations_pos$target <- target_latest + offset
    annotations_pos$baseline <- baseline_latest - offset
  }
  if(target_latest <= baseline_latest){
    annotations_pos$target <- target_latest - offset
    annotations_pos$baseline <- baseline_latest + offset
  }
  
  .data %>% 
    plotly_dumbbell(x = "year",
                    y1 = compare_to,
                    y2 = level,
                    y1_hovertemplate = str_wrap_hovertemplate(baseline_hovertemplate),
                    y2_hovertemplate = str_wrap_hovertemplate(target_hovertemplate),
                    text = gap_variable) %>%
    # Add the y-axis suffix
    layout(yaxis = list(tickformat = ".0%")) %>% 
    # Add annotations
    plotly_add_annotation(text = level_annotation,
                          x = latest_year, y = annotations_pos$target,
                          color = get_wrk_color("green"),
                          size = 12) %>%
    plotly_add_annotation(text = compare_to,
                          x = latest_year, y = annotations_pos$baseline,
                          color = "grey",
                          size = 12) %>%
    # Add title
    add_title(plot_title) %>%
    # Add source
    plotly_caption_source("Census 5-year ACS",
                          href = "https://www.census.gov/")
}

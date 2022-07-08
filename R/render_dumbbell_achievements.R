#' Render a dumbbell plot showing the gap between East Side Charter and Delaware
#'
#' @param summary_df a summary data frame with the following columns: `schoolyear`, `delaware`, `east_side`, `gap`
#' @param area one of `ELA` or `math`
#'
#' @return
#' @export
#'
#' @examples
render_dumbbell_achievements <- function(summary_df,
                            area = "ELA") {
  # Set the title size 
  title_size <- 14
  # Font size for annotations
  annotation_size <- 14
  # Wrap width
  str_wrap_width <- 80 - 40
  # Set the size for the point markers
  point_size <- 12
  # Label offset value
  offset <- 5
  
  
  
  if(area == "ELA"){
    area_text <- "literacy"
  }
  
  if(area == "math"){
    area_text <- "math"
  }
  
  # Create hover template
  # Use double braces to insert literal braces
  eastside_hovertemplate <- str_glue(
    "In %{{x}}, %{{y:.1f}}% of East Side Charter students achieved {area_text} proficiency.
    The gap to the Delaware average was %{{text:+.1f}}%.") %>% 
    str_wrap(width = str_wrap_width) %>% 
    # Patch the instances where a line break is inserted between a percent sign and 
    # a brace
    str_replace("%\\n\\{", "%{") %>%
    paste0("<extra></extra>")
  
  
  delaware_hovertemplate <-str_glue(
    "In %{{x}}, %{{y:.1f}}% of Delaware students achieved {area_text} proficiency"
  ) %>% 
    str_wrap(width = str_wrap_width) %>% 
    # Patch the instances where a line break is inserted between a percent sign and 
    # a brace
    str_replace("%\\n\\{", "%{") %>%
    paste0("<extra></extra>")
  
  # Get the latest year 
  latest_year <- summary_df %>% 
    pull(schoolyear) %>%
    max()
  # Get the y-positions for the latest year and offset
  positions <- summary_df %>% 
    filter(schoolyear == latest_year) %>% 
    mutate(which_larger = case_when(delaware > east_side ~ "delaware",
                                    east_side <= delaware ~ "east_side")) %>%
    transmute(delaware_pos = case_when(which_larger == "delaware" ~ delaware + offset,
                                       which_larger == "east_side" ~ delaware - offset),
              east_side_pos = case_when(which_larger == "delaware" ~ east_side - offset,
                                        which_larger == "east_side" ~ east_side + offset)) 
  
  # summary_df %>% 
  #   plot_ly(text = ~gap) %>%
  #   add_segments(x = ~schoolyear,
  #                xend = ~schoolyear,
  #                y = ~delaware,
  #                yend = ~east_side,
  #                color = I("grey")) %>%
  #   # Add markers for East Side Students
  #   add_markers(x = ~schoolyear,
  #               y = ~east_side,
  #               color = ~I(get_wrk_color("green")),
  #               hovertemplate = eastside_hovertemplate,
  #               marker = list(size = point_size)) %>% 
  #   add_markers(x = ~schoolyear,
  #               y = ~delaware,
  #               color = I("grey"),
  #               hovertemplate = delaware_hovertemplate,
  #               marker = list(opacity = 1, size = point_size)) %>% 
  
  summary_df %>% 
  plotly_dumbbell(x = "schoolyear",
                  y1 = "delaware",
                  y2 = "east_side",
                  y1_hovertemplate = delaware_hovertemplate,
                  y2_hovertemplate = eastside_hovertemplate,
                  text = "gap") %>% 
  
    # Add annotations
    plotly_add_annotation(text = "East Side \nCharter",
                          x = 2021, y = positions$east_side_pos,
                          color = get_wrk_color("green"),
                          size = annotation_size) %>%
    plotly_add_annotation(text = "Delaware",
                          x = 2021, y = positions$delaware_pos,
                          color = "grey",
                          size = annotation_size) %>%
    # Add % to suffixes
    layout(yaxis = list(ticksuffix = "%")) %>% 
    # Add title 
    layout(title = list(text = str_glue(
      "Children achieving {area_text} proficiency \n(3rd-8th graders) "),
      xanchor = "left", x = 0,
      font = list(size = title_size))) %>% 
    # Add caption
    plotly_caption_source(name = "Delaware Open Data",
                          href = "https://data.delaware.gov/Education/Student-Assessment-Performance/ms6b-mt82",
                          y = -0.08)
}

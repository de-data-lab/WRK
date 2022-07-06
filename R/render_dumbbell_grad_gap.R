#' Render a dumbbell plot showing the graduation gap
#'
#' @param summary_df a summary data frame with the following columns: `schoolyear`, `Brandywine, Christina, or Colonial`,
#'  `State of Delaware`, `gap`
#'
#' @return
#' @export
#'
#' @examples
render_dumbbell_gap <- function(summary_df) {
  # Set the title size
  title_size <- 14
  
  # Create hover template
  # Use double braces to insert literal braces
  eastside_hovertemplate <- str_glue(
    "In %{{x}}, %{{y:.1f}}% of students in Brandywine, Christina, and Colonial districts
    graduated within 4 years.
    The gap to the Delaware average was %{{text:.1f}}%.") %>% 
    str_wrap(width = 40) %>% 
    # Patch the instances where a line break is inserted between a percent sign and 
    # a brace
    str_replace("%\\n\\{", "%{") %>%
    paste0("<extra></extra>")
  
  
  delaware_hovertemplate <-str_glue(
    "In %{{x}}, %{{y:.1f}}% of Delaware high school students graduated within 4 years"
  ) %>% 
    str_wrap(width = 40) %>% 
    # Patch the instances where a line break is inserted between a percent sign and 
    # a brace
    str_replace("%\\n\\{", "%{") %>%
    paste0("<extra></extra>")
  
  # Set the size for the point markers
  point_size <- 12
  # Get the latest year 
  latest_year <- summary_df %>% 
    pull(schoolyear) %>%
    max()
  # Set the y-offset for annotations
  offset <- 1
  # Set font size for annotations
  font_size_annotations <- 12
  # Get the y-positions for the latest year and offset
  positions <- summary_df %>% 
    filter(schoolyear == latest_year) %>% 
    mutate(which_larger = case_when(delaware > brandywine_christina_colonial ~ "delaware",
                                    brandywine_christina_colonial <= delaware ~ "brandywine_christina_colonial")) %>%
    transmute(delaware_pos = case_when(which_larger == "delaware" ~ delaware + offset,
                                       which_larger == "brandywine_christina_colonial" ~ delaware - offset),
              brandywine_christina_colonial_pos = case_when(which_larger == "delaware" ~ brandywine_christina_colonial - offset,
                                        which_larger == "brandywine_christina_colonial" ~ brandywine_christina_colonial + offset)) 
  
  summary_df %>% 
    plot_ly(text = ~gap) %>%
    add_segments(x = ~schoolyear,
                 xend = ~schoolyear,
                 y = ~delaware,
                 yend = ~brandywine_christina_colonial,
                 color = I("grey")) %>%
    # Add markers for East Side Students
    add_markers(x = ~schoolyear,
                y = ~brandywine_christina_colonial,
                color = ~I(get_wrk_color("green")),
                hovertemplate = eastside_hovertemplate,
                marker = list(size = point_size)) %>% 
    add_markers(x = ~schoolyear,
                y = ~delaware,
                color = I("grey"),
                hovertemplate = delaware_hovertemplate,
                marker = list(opacity = 1, size = point_size)) %>% 
    # Add annotations
    plotly_add_annotation(text = "Brandywine, \nChristina, \nColonial Districts",
                          x = latest_year, y = positions$brandywine_christina_colonial_pos,
                          color = get_wrk_color("green"),
                          size = font_size_annotations) %>%
    plotly_add_annotation(text = "Delaware",
                          x = latest_year, y = positions$delaware_pos,
                          color = "grey",
                          size = font_size_annotations) %>%
    # Add % to suffixes
    layout(yaxis = list(ticksuffix = "%")) %>% 
    # Add title 
    layout(title = list(text = str_glue("High school students graduating within 4 years"),
                        xanchor = "left", x = 0,
                        font = list(size = title_size))) %>% 
    # Add caption
    add_annotations(x = 1, y = -0.06,
                    text = "Source: <a href='https://data.delaware.gov/Education/Student-Graduation/t7e6-zcnn' target='_blank'>Delaware Open Data</a>",
                    showarrow = FALSE, xref ="paper", yref = "paper", 
                    xanchor = "right", yanchor = "auto") %>%
    # Remove grid lines
    layout(xaxis = list(showgrid = FALSE)) %>% 
    # Remove axis titles
    plotly_remove_axis_titles() %>%
    # Hide legend 
    hide_legend() %>%
    # Hide modebar
    plotly_hide_modebar()
}

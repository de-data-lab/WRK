library(here)

combined_data <- read_rds(here("data/processed/education.rds"))

# Set colors for the data 
orgs <- unique(combined_data$organization)
orgs_color <- RColorBrewer::brewer.pal(length(orgs), "Set2")
names(orgs_color) <- orgs
combined_data <- combined_data %>%
  mutate(plot_color = recode(organization, !!!orgs_color))


# Function to plot the achievement over time
plot_education <- function(selected_contentarea = c("ELA", "MATH"),
                           selected_orgs = c("State of Delaware")){
  cur_data <- combined_data %>%
    filter(contentarea %in% selected_contentarea) %>%
    filter(organization %in% selected_orgs) 
  
  cur_plot <- cur_data %>% 
    ggplot(aes(x = schoolyear, y = pctproficient,
               color = organization, group = organization)) +
    geom_line() +
    geom_point() +
    facet_grid(fct_rev(grade) ~ contentarea) +
    scale_color_manual(name = NULL,
                       values = orgs_color,
                       breaks = selected_orgs) +
    scale_y_continuous(labels = ~paste0(., "%")) + 
    xlab("Year") +
    ylab("% Proficient") +
    ggtitle("Students achieving proficiency") +
    labs(caption = "Source: data.delaware.gov - Student Asessment Performance") +
    theme_gray()
  
  return(cur_plot)
}

# Choices for UI
contentareas <- unique(combined_data$contentarea)
groups <- unique(combined_data$organization)

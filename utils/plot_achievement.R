library(here)

# Load data
education_data <- read_rds(here("data/processed/education_achievement.rds"))

# Set colors for the data 
orgs <- unique(education_data$organization)
orgs_color <- RColorBrewer::brewer.pal(length(orgs), "Set2")
names(orgs_color) <- orgs
education_data <- education_data %>%
  mutate(plot_color = recode(organization, !!!orgs_color))


# Function to plot the achievement over time
plot_achievement <- function(selected_contentarea = c("ELA", "MATH"),
                           selected_orgs = c("State of Delaware"),
                           selected_grades = "All Students"){
  cur_data <- education_data %>%
    filter(contentarea %in% selected_contentarea) %>%
    filter(organization %in% selected_orgs) %>% 
    filter(subgroup %in% selected_grades)
  
  # Create a plot
  cur_data %>% 
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
}

# Choices for UI
contentareas <- unique(education_data$contentarea)
groups <- unique(education_data$organization)

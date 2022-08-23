# Utility functions
source(here("utils/wrk_pal.R"))

# Function to clean each table
clean_metrics <- function(.tbl){
  .tbl %>% 
    filter(.[[1]] != "") %>%
    filter(!str_detect(.[[1]], "Metrics"),
           !str_detect(.[[1]], "Goal:")) %>%
    filter(!is.na(.[[2]])) %>% 
    rename_with(~c("metric", "value")) 
}


# Aggregate the excel file 
# Function to clean the document 
extract_table <- function(docx_file, year, quarter){
  domains <- c("housing",
               "education",
               "workforce",
               "engagement",
               "health",
               "finance",
               "race")
  domain_labels <- rep(domains, each = 2)
  
  all_tables <- docx_file %>% docx_extract_all_tbls()
  
  tables_raw <- tibble(tables = all_tables) %>%
    mutate(type = case_when(((row_number() %% 2) == 0) ~ "metric",
                            TRUE ~ "qualitative")) %>%
    mutate(domain = domain_labels)
  
  # Qualitative table
  qualitatives <- tables_raw %>% 
    filter(type == "qualitative") %>% 
    unnest(tables)
  
  qualitatives <- qualitatives %>% 
    mutate(qual_progress = coalesce(Qualitative.Progress, Event.Highlights))
  
  # Metrics table
  metrics <- tables_raw %>%
    filter(type == "metric") %>% 
    mutate(tables_clean = map(tables, clean_metrics))
  
  # filter the values
  metrics %>%
    unnest(tables_clean) %>%
    select(-tables) %>% 
    mutate(year = year,
           quarter = quarter)
}

# Plot Settings
geom_plot_col <- list(
  geom_col(width = 0.7, fill = get_wrk_color("blue")),
  theme_minimal()
)

# Plot a bar plot
plot_bar <- function(.data, outcome, method = "mean", y_lab, x_lab){
  
  selectedOutcome <- sym(outcome)

  if(method == "mean") {
    y_lab_summary = str_glue("Mean of {y_lab}")
  outplot <- .data %>%
    group_by(year) %>%
    summarise("outcome" = mean(!!selectedOutcome, na.rm = T)) %>%
    ggplot(aes(x = year, y = outcome)) +
    geom_plot_col +
    ylab(y_lab_summary)
  }
  
  if(method == "sum") {
    y_lab_summary = str_glue("Sum of {y_lab}")
    outplot <-  .data %>%
      group_by(year) %>%
      summarise("outcome" = sum(!!selectedOutcome, na.rm = T)) %>%
      ggplot(aes(x = year, y = outcome)) +
      geom_plot_col +
      ylab(y_lab_summary)
  }
  
  outplot
  
}




# Aggregate files
library(tidyverse)
library(here)
library(docxtractr)
library(readxl)

source(here("utils/utils.R"))

# ETL data about WRK Group
# This script reads data from files in "data-private" folder

# Define domains
domains <- c("housing",
             "education",
             "workforce",
             "engagement",
             "health",
             "finance",
             "race")

## 2021 Q1 ------------------------------------
# Read the data
raw_21_Q1 <- read_docx(here("data-private/2021-Q1 WRK Group Q1 2021 Goals and Metrics.docx"))

all_tables <- raw_21_Q1 %>% docx_extract_all()

domain_labels <- rep(domains, each = 2)

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
metrics_clean <- metrics %>%
  unnest(tables_clean) %>%
  select(-tables) %>% 
  mutate(year = 2021,
         quarter = 1)


# 2021 Overall ------------------------------------
## Attempting converting information from the docx file 
raw_21_all <- read_docx(here("data-private/2021-Overall WRK Group 2021 Goals and Metrics FINAL.docx"))
raw_21_all_tables <- raw_21_all %>% docx_extract_all_tbls()

## Housing
housing_21 <- raw_21_all_tables[[3]] %>%
  clean_metrics() %>%
  mutate(domain = "housing")

## Education
education_21 <- raw_21_all_tables[[5]] %>% 
  clean_metrics() %>%
  mutate(domain = "education")

education_21_recode_vars <- c(
  "Number of children ages 1-5 enrolled." = "children_enrolled",
  "Number of children who achieved developmental milestones as determined by a standardized developmental assessment." = "child_dev_milestone",
  "Number of children assessed as kindergarten-ready using a standardized assessment tool." = "kinder_ready"
)
education_21_wide <- education_21 %>%
  mutate(name = recode(metric,
                       !!!education_21_recode_vars,
                       .default = NA_character_)) %>%
  drop_na()

## Crime & Safety
### TBD -----

## Workforce development
workforce_21 <- raw_21_all_tables[[7]] %>%
  clean_metrics() %>% 
  mutate(domain = "workforce")

## 2021 all
all_2021 <- housing_21 %>%
  bind_rows(education_21) %>%
  bind_rows(workforce_21)

### Manual cleaning
all_2021_clean <- all_2021 %>%
  mutate(value = case_when(metric == "Number of pre-k children enrolled in Redding/ECAP (30 seats)." ~ 30,
                           metric == "Number of children with 85% attendance or higher (Head Start standard)." ~ 55,
                           metric == "Number of children who achieved developmental milestones as determined by a standardized developmental assessment." ~ 75,
                           metric == "Number of children assessed as kindergarten-ready using a standardized assessment tool." ~ 9,
                           metric == "Number of youth who increased resilience and protective factors (as measured by pre-/post-assessments) using developmental asset mapping." ~ 45,
                           metric == "Number of youth who improved social/emotional learning competencies." ~ 0,
                           metric == "Number of youth who increased self-regulation skills, social-emotional learning competencies, and bullying prevention skills (using an evidence-based curriculum and assessment)." ~ 0,
                           metric == "Number of youth promoted to the next grade." ~ 25,
                           metric == "Number of youth who increased knowledge of substance use/abuse, as evidenced by completing an evidence-based curriculum." ~ 0,
                           metric == "Amount of scholarships received." ~ 146000,
                           TRUE ~ as.numeric(value))) %>%
  add_row(domain = "education",
          metric = "Proportion of children assessed as kindergarten-ready using a standardized assessment tool.",
          value = 0.820) %>%
  add_row(domain = "education",
          metric = "Proportion of children who achieved developmental milestones as determined by a standardized developmental assessment.",
          value = 0.97) %>% 
  add_row(domain = "education",
          metric = "Proportion of youth promoted to the next grade.",
          value = 1.00)


# Add year
all_2021_clean <- all_2021_clean %>%
  mutate(year = 2021) %>%
  select(year, domain, everything())


# 2020 Overall -----------------------------------------------------------------
## Manually plugging in the numbers from reading the report 
all_2020 <- tribble(
  ~domain, ~var_name, ~value,
  "education", "child_milestone", 49, # Q1 number
  "education", "child_miletone_prop", 0.94, # Q1 number
  "education", "child_milestone_tested", 52, # Q1 number
  "education", "kinder_ready", 15, 
  "education", "kinder_ready_tested", 19, 
  "education", "kinder_ready_prop", 0.79, 
  "education", "teen_ontrack", 7,
  "education", "teen_enrolled", 10, # Q1 - Participating in tutoring or academic workshops
  "education", "youth_next_grade", NA, # Not available due to COVID
  "education", "youth_next_grade_prop", NA, # Not available due to COVID
)

all_2020_wide <- all_2020 %>% 
  select(-domain) %>%
  pivot_wider(names_from = var_name, values_from = value) %>%
  mutate(year = 2020)


# 2019 Overall ------------------------------------
all_2019 <- read_xlsx(here("data-private/2019 - Goals and Metrics.xlsx"))

all_2019_target <- all_2019 %>%
  filter(!is.na(var_name))

all_2019_target_year_end <- all_2019_target %>%
  group_by(var_name) %>%
  summarise(sum = sum(value))

all_2019 <- tribble(
  ~domain, ~var_name, ~value,
  "education", "child_milestone", 56,
  "education", "child_miletone_prop", 0.88,
  "education", "kinder_ready", 15,
  "education", "kinder_ready_prop", 0.71,
  "education", "teen_ontrack", 26,
  "education", "teen_enrolled", NA,
  "education", "youth_next_grade", 36,
  "education", "youth_next_grade_prop", 1.00,
)

all_2019_wide <- all_2019 %>% 
  select(-domain) %>%
  pivot_wider(names_from = var_name, values_from = value) %>%
  mutate(year = 2019)

# Aggregate data into one file
all_2021_clean_targets <- all_2021_clean %>%
  mutate(var_name = recode(metric,
                           "Number of children who achieved developmental milestones as determined by a standardized developmental assessment." = "child_milestone",
                           "Proportion of children who achieved developmental milestones as determined by a standardized developmental assessment." = "child_miletone_prop",
                           "Number of youth promoted to the next grade." = "youth_next_grade",
                           "Number of children assessed as kindergarten-ready using a standardized assessment tool." = "kinder_ready",
                           "Proportion of children assessed as kindergarten-ready using a standardized assessment tool." = "kinder_ready_prop",
                           "Proportion of youth promoted to the next grade." = "youth_next_grade_prop",
                           .default = NA_character_))

all_2021_wide <- all_2021_clean_targets %>% 
  drop_na() %>% 
  select(-domain, -metric) %>% 
  pivot_wider(names_from = var_name, values_from = value)


# Combine 2019 and 2021 datasets
all_combined <- all_2019_wide %>%
  bind_rows(all_2021_wide) %>%
  bind_rows(all_2020_wide) %>%
  select(year, everything())

### Recalculation
all_combined <- all_combined %>%
  mutate(child_milestone_tested = round(child_milestone / child_miletone_prop, 0),
         child_milestone_not_achieved = child_milestone_tested - child_milestone)

# Calculate the children who were tested for kidnergarden readiness
all_combined <- all_combined %>%
  mutate(kinder_ready_tested = round(kinder_ready / kinder_ready_prop, 0),
         kinder_not_ready = kinder_ready_tested - kinder_ready)

# Save the combined processed file
write_rds(all_combined, "data-private/WRK_wide.rds")

# Create a pivot table and plot a stacked bar chart
# geom_default <- list(
#   theme_minimal(),
#   theme(panel.grid.minor = element_blank(),
#         panel.grid.major.x = element_blank()) # remove vertical lines
# )

## Developmental Milestone
# Teaching strategies GOLD - https://journals.sagepub.com/doi/10.1177/2043610615627925
# plot_milestone <- all_combined %>% 
#   select(year, child_milestone_not_achieved, child_milestone) %>% 
#   pivot_longer(cols = -year) %>%
#   ggplot(aes(x = year, y = value, fill = rev(name))) +
#   geom_bar(position = "stack", stat = "identity", width = 0.6) + 
#   scale_x_continuous(breaks = 2019:2021, 
#                      expand = c(0.1, 1)) +
#   scale_fill_discrete(name = NULL,
#                       labels = c("Not Achieved", "Achieved")) +
#   ylab(NULL) + 
#   xlab(NULL) + 
#   ggtitle("Children achieving developmental milestone") +
#   geom_default


## Kindergarten Readiness
# plot_kidergarten <- all_combined %>% 
#   select(year, kinder_ready, kinder_not_ready) %>% 
#   pivot_longer(cols = -year) %>%
#   ggplot(aes(x = year, y = value, fill = name)) +
#   geom_bar(position = "stack", stat = "identity", width = 0.6) + 
#   scale_x_continuous(breaks = 2019:2021, 
#                      expand = c(0.1, 1)) +
#   scale_fill_discrete(name = NULL,
#                       labels = c("Not ready", "Ready")) +
#   ylab(NULL) + 
#   xlab(NULL) + 
#   ggtitle("Children ready for kindergarten") +
#   geom_default

## Combine plots
# library(ggpubr)
# ggarrange(plot_milestone, plot_kidergarten, legend = "bottom") 

[![Production](https://img.shields.io/badge/Deployment-Production-78BE20)](https://techimpact.shinyapps.io/WRK-dashboard) [![Test](https://img.shields.io/badge/Deployment-Test-0057B8)](https://techimpact.shinyapps.io/WRK-dashboard-test)

# WRK Group Dashboard

A repository for the WRK Group Dashboard in 2022.

## Environment Variables

The environment variables are stored in the `.Renviron` file.

-   `CENSUS_API_KEY`: The Census API key obtained from [here](https://api.census.gov/data/key_signup.html)

### Azure-Related

To get data for the survey results, we pull private data from the Azure blob with the following environment variables:

#### For downloading the raw responses

-   `AZURE_WRK_SURVEY_RAW_URL` - URL to the Excel file
-   `AZURE_WRK_SURVEY_RAW_SAS_TOKEN` - SAS token for the file

#### For uploading the processed dataset about safety-related responses

-   `AZURE_WRK_SURVEY_PROCESSED_URL` - URL to the processed data Excel file
-   `AZURE_WRK_SURVEY_PROCESSED_SAS_TOKEN` - SAS token for the file

Note that SAS token may expire with time. Check with the Azure console in case of an error.

## How the data are sourced

The scripts that downloads and transforms the data are stored in the `/ETL` folder.

### Housing Data

Housing data are sourced from the [assisted housing data](https://www.huduser.gov/portal/datasets/assthsg.html) from [the US Department of Housing and Urban Development (HUD)](https://www.hud.gov/). The data are stored in Excel files. Each year's dataset is divided into two files depending on the states (AK-MN vs. MO-WY). The "AK-MN" Excel files contain Delaware's data, and thus they are downloaded into the `data/raw/hud` folder.

Note: To add new data, simply download new Excel files into the `data/raw/hud` folder.

The ETL script (`housing.R`) will looks for all the excel files available in the raw folder, combines them, and saves the processed file into an RDS file (`data/processed/hud_DE_combined.rds`).

### Education

#### Kindergarten Readiness

National kindergarten readiness data are sourced from [the Kindergarten readiness in Delaware dataset](https://datacenter.kidscount.org/data/tables/10050-kindergarten-readiness?loc=9&loct=2#detailed/2/any/false/1729,37,871,870/3284,3285,6044,6046,6047/19442) from [Kids Count Data Center](https://datacenter.kidscount.org/). The ETL script (`education_kindergarten.R`) downloads the Excel data as a temporary file and saves the processed data into an RDS file (`education_kinder_readiness_wide.rds`).

In addition, the dashboard uses the WRK Group's internal data about the kindergarten readiness. The summary dataset is stored in an RDS file (`education_kinder_readiness_WRK.rds`).

#### High School Achievement and Graduation Rate

High school achievement and graduation rate data are sourced from the [Delaware Open Data Portal](https://data.delaware.gov/).

The high school achievement data are sourced from [the Student Assessment Performance dataset](https://data.delaware.gov/Education/Student-Assessment-Performance/ms6b-mt82). The ETL script (`education_achievement.R`) calls the portal's API, add additional labels, and produces two datasets separately for the literacy/ELA achievement (`education_achievement_wide_ELA.rds`) and math achievement (`education_achievement_wide_math.rds`).

The high school graduation data are sourced from the [Student Graduation dataset](https://data.delaware.gov/Education/Student-Graduation/t7e6-zcnn). The ETL script (`education_graduation.R`) calls the portal's API, downloads the data, add additional labels, and saves the dataset into two RDS files, a district-wise dataset (`education_graduation.rds`), and a summary dataset (`education_graduation_summary.rds`).

### Workforce Development

Employment data are sourced from the [5-year American Community Survey datasets](https://www.census.gov/programs-surveys/acs) from the [US Census](https://www.census.gov/). The ETL script (`workforce_unemployment.R`) calls the Census API with a Census API key, stored as an environment variable (`CENSUS_API_KEY`). Then, the script gets the data about the number of total labor force (B23025_003) and the number of unemployed people (B23025_005) for census tracts across the years. The script is set up to get the data from 2014 to the latest year. The script saves two files: a tract-wise dataset (`workforce_unemployment.rds`), and a summary table (`workforce_unemployment_sum_long.rds`).

### Safety

Safety data are sourced from the 2021 WRK Group Community survey. The original, participant-wise dataset is private, and stored in a blob storage on Azure. The ETL script (`safety_WRK_survey.R`) uses the environment variables to download the Excel file containing data. Then, the script transforms the data into a summary table. Along the way, the script also uploads the processed dataset back into an Azure instance. Finally, the script saves the summary dataset as an RDS file (`safety_WRK_survey_2021.rds`).

### Events

Events data are sourced from [The Warehouse Calendar](https://thewarehouse.recdesk.com/Community/Calendar). The ETL script (`events_calendar.R`) performs a POST request to the calendar API, and repeats it to get the calendar from 2020 to the latest year. The script transforms the data and saves the dataset as an RDS file (`events_warehouse_calendar.rds`).

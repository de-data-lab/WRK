[![Production](https://img.shields.io/badge/Deployment-Production-78BE20)](https://techimpact.shinyapps.io/WRK-dashboard) [![Test](https://img.shields.io/badge/Deployment-Test-0057B8)](https://techimpact.shinyapps.io/WRK-dashboard-test)

# WRK

A repository for the publicly-available metrics work with the WRK group in 2022.

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

FROM rocker/shiny-verse:4.1.1
RUN install2.r rsconnect plotly sf shinyWidgets flexdashboard \ 
    tidyverse readxl here patchwork maptools rgdal sp tidycensus tigris \
    lubridate
WORKDIR /home/shinyusr
COPY ./ /home/shinyusr/app/
COPY deploy.R deploy.R
CMD Rscript deploy.R

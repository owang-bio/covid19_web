# export GOOGLE_APPLICATION_CREDENTIALS="/home/owang/.google/BigQuery.json"
from google.cloud import bigquery
import pandas as pd

# project = 'bigquery-281204'
# client = bigquery.Client(project=project)

def get_covid_stat(client):
    query = """
    with temp as (
      select date
        , sum(confirmed_cases) as cumulative_confirmed_cases
        , sum(deaths) as cumulative_deaths
      from `bigquery-public-data.covid19_nyt.us_states`
      group by date
      order by date
    )
    select date
    , cumulative_confirmed_cases
    , cumulative_confirmed_cases - first_value(cumulative_confirmed_cases) over (diff) as daily_cases_growth
    , cumulative_deaths
    , cumulative_deaths - first_value(cumulative_deaths) over (diff) as daily_death_growth
    from temp
    window diff as (
      order by date
      rows between 1 preceding and current row
    )
    ;
    """
    query_job = client.query(query).to_dataframe()
    query_job.to_csv('data/covid19_stat.csv')
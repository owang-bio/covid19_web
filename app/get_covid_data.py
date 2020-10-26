# export GOOGLE_APPLICATION_CREDENTIALS="/home/owang/.google/BigQuery.json"
from google.cloud import bigquery
import pandas as pd
import json
import os

project = 'bigquery-281204'
client = bigquery.Client(project=project)

# air traffic data
def get_air_data(interval, client):
    
    config = bigquery.QueryJobConfig()
    PARAMS = [
        bigquery.ScalarQueryParameter("interval", 
                                      "STRING",
                                      interval)
    ]
    config.query_parameters = PARAMS
    
    query_air = """
    SELECT date
        , airport_name
        , percent_of_baseline
        , ST_x(center_point_geom) as longitude
        , ST_y(center_point_geom) as latitude
    FROM `bigquery-public-data.covid19_geotab_mobility_impact.airport_traffic`
    where lower(country_name) like '%united states%' 
    AND date = DATE_SUB(CURRENT_DATE('America/Denver'), INTERVAL @interval DAY)
    ;
    """
        
    query_job = client.query(query_air, job_config=config)
    df = query_job.to_dataframe()
    
    if df.empty:
        df = get_air_data(interval + 1, client)
        
    return df

def save_air_data(get_air_data, client):
  
    df = get_air_data(0, client)
    json_obj = df.to_json(orient='records')

    with open(f'{os.getcwd()}/data/air.json', 'w') as file:
        for line in json_obj:
            file.write(line)
        
# city congestion
def get_congestion_data(client):
    query_city = """
    with temp as (
    SELECT *
      , extract(date from date_time) as `date` 
      , extract(hour from date_time) as `hour`
    FROM `bigquery-public-data.covid19_geotab_mobility_impact.city_congestion`
    ) 
    select *
    from temp
    order by city_name, date_time
    ;
    """
    query_job = client.query(query_city)
    df = query_job.to_dataframe()
    df.to_csv(f'{os.getcwd()}/data/city.csv', index=False)

# gas fillup
def get_gas_data(client):
  query_gas = """
  with temp as (
    SELECT * replace(
        percent_of_normal_volume / 100 as percent_of_normal_volume
      , replace(country_iso_code_2, 'US-', '') as country_iso_code_2
      )
    FROM `bigquery-public-data.covid19_geotab_mobility_impact.fuel_station_weekly_fillups`
    WHERE country_iso_code_2 like "US-%"
    order by week_start
  )
  select week_start as date
    , country_iso_code_2 as code
    , percent_of_normal_volume as percentage
  from temp
  ;
  """
  query_job = client.query(query_gas)
  df = query_job.to_dataframe()
  df.to_csv(f'{os.getcwd()}/data/gas.csv', index=False)

# covid-19 stat
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
    
save_air_data(get_air_data, client)
get_congestion_data(client)
get_gas_data(client)
get_covid_stat(client)
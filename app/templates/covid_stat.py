from google.cloud import bigquery
import pandas as pd

project = 'bigquery-281204'

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
 , cumulative_deaths - first_value(cumulative_deaths) over (diff) as daily_deaths_growth
from temp
window diff as (
  order by date
  rows between 1 preceding and current row
)
;
"""

client = bigquery.Client(project=project)
query_job = client.query(query_string).to_dataframe()
print(query_job)
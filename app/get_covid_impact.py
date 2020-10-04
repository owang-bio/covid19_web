# export GOOGLE_APPLICATION_CREDENTIALS="/home/owang/.google/BigQuery.json"
from google.cloud import bigquery
import pandas as pd
import json
import os

project = 'bigquery-281204'

# air traffic
query_air = """
SELECT date
    , airport_name
    , percent_of_baseline
    , ST_x(center_point_geom) as longitude
    , ST_y(center_point_geom) as latitude
FROM `bigquery-public-data.covid19_geotab_mobility_impact.airport_traffic`
where lower(country_name) like '%united states%' 
AND date = DATE_SUB(CURRENT_DATE('America/Denver'), INTERVAL 3 DAY)
;
"""

client = bigquery.Client(project=project)
query_job = client.query(query_air)
df = query_job.to_dataframe()
json_obj = df.to_json(orient='records')

with open(f'{os.getcwd()}/data/air.json', 'w') as file:
    for line in json_obj:
        file.write(line)
        
# city congestion

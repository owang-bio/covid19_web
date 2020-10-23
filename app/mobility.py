from flask import Blueprint, render_template, redirect, url_for
import pandas as pd
import os

bp = Blueprint('mobility', __name__, url_prefix='/mobility')

@bp.route('/')
def mob():
    df = pd.read_csv(f'{os.getcwd()}/app/data/covid19_stat.csv')
    stat = df.tail(1).to_dict('records')[0]
    return render_template('mobility/mobility.html', stat =  stat)

@bp.route('/air')
def air_traffic():
    return redirect(url_for('serve_json', file_name='air'))

@bp.route('/city')
def city_congestion():
    return 'Success'

@bp.route('/city/<int:hour>/<string:city>')
def serve_congestion_data(hour, city):
    df = pd.read_csv(f'{os.getcwd()}/app/data/city.csv')
    df = df.query('hour == @hour').query('city_name == @city')
    df['percent_congestion'] = df.percent_congestion / 100
    return df.to_json(orient='records')    

@bp.route('/gas')
def fillup():
    df = pd.read_csv(f'{os.getcwd()}/app/data/gas.csv')
    df_id = pd.read_table(f'{os.getcwd()}/app/data/us_state_id.txt')
    date = df.iloc[df.shape[0] - 1, 0]
    df = (
        df.query('date == @date')
            .merge(df_id, on = 'code')
        )
    return df.to_json(orient='records')


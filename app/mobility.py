from flask import Blueprint, render_template

bp = Blueprint('mobility', __name__, url_prefix='/mobility')

@bp.route('/')
def mob():
    import pandas as pd
    import os
    df = pd.read_csv(f'{os.getcwd()}/app/data/covid19_stat.csv')
    stat = df.tail(1).to_dict('records')[0]
    return render_template('mobility/mobility.html', stat =  stat)

@bp.route('/air')
def air_traffic():
    import pandas as pd
    import os
    df = pd.read_csv(f'{os.getcwd()}/app/data/covid19_stat.csv')
    stat = df.tail(1).to_dict('records')[0]
    return render_template('mobility/mobility_pages/air.html', stat =  stat)

@bp.route('/city')
def city_congestion():
    import pandas as pd
    import os
    df = pd.read_csv(f'{os.getcwd()}/app/data/covid19_stat.csv')
    stat = df.tail(1).to_dict('records')[0]
    return render_template('mobility/mobility_pages/city_congestion.html', stat =  stat)

@bp.route('/border')
def border_wait():
    pass

@bp.route('/gas')
def fillup():
    pass

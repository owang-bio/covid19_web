from flask import Blueprint, render_template

bp = Blueprint('mobility', __name__, url_prefix='/mobility')

@bp.route('/air')
def air_traffic():
    return render_template('mobility/mobility.html')

@bp.route('/city')
def city_congestion():
    pass

@bp.route('/border')
def border_wait():
    pass

@bp.route('/gas')
def fillup():
    pass

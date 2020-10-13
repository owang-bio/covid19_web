import os
from flask import Flask, render_template, send_file, redirect, url_for

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY = 'dev',
        # DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    @app.route('/')
    def hello():
        # import pandas as pd
        # import os
        # df = pd.read_csv(f'{os.getcwd()}/app/data/covid19_stat.csv')
        # stat = df.tail(1).to_dict('records')[0]
        # return render_template('base.html', stat = stat)
        return redirect(url_for('mobility.mob'))
    
    @app.template_filter()
    def num_format(value):
        return f'{value:,}'
    
    @app.route('/serve/<file_name>')
    def serve_json(file_name):
        return send_file(f'{os.getcwd()}/app/data/{file_name}.json')
    
    from . import mobility
    app.register_blueprint(mobility.bp)

    return app
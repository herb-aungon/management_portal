#!/usr/bin/env python                                                                                                                                                                                       
#-*- coding: utf-8 -*- 

from flask import Flask,request, render_template, flash, jsonify, make_response, Response, url_for, redirect
from pymongo import MongoClient
import json, local_settings, calendar, collections, pygal
from modules.management_portal_obj import *
from datetime import *
from pygal.style import Style
from pygal import *
config = local_settings.env
app = Flask(__name__)


"""
Initialise Mongdo DB Connection
"""
client = MongoClient(config.get('MONGODB_HOST'))
mongodb = client[config.get('MONGODB_COLLECTION')]

"""
Flask config for changing Debug mode, SECRET_KEY
"""
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='development key',
))


#Used to display errors on webpage
@app.errorhandler( 500 )
def internal_500_error( exception ):
     #app.logger.exception( exception )
     return json.dumps( exception )

@app.errorhandler( 404 )
def internal_404_error( exception ):
     #app.logger.exception( exception )
     return 'management portal <br/>\n%s<br/>\n%s' % ( exception, request.url )

@app.errorhandler( 401 )
def internal_401_error( exception ):
     #app.logger.exception( exception )
     return 'management portal<br/>\n%s<br/>\n%s' % ( exception, request.url )


def default_encoder( obj, encoder=json.JSONEncoder() ):
    if isinstance( obj, ObjectId ): 
        return str( obj )  
    if isinstance(obj, datetime):
         date = datetime.date(obj.year, obj.month, obj.day)
         return str(date)#.strftime( '%Y-%m-%d' )
    return encoder.default( obj )



@app.route("/login", methods = [ 'GET' ] )
def log_in_get():
     return render_template('log_in.html')

@app.route("/login", methods = [ 'POST' ] )
def log_in_post():
     try:
          token_id = "test"
          payload = request.data
          payload_json = json.loads(payload)
          user_details = payload_json
          user_details.update({ "headers":dict(request.headers), "cookies":dict(request.cookies) })
          user_init = user(mongodb)
          get_result = user_init.check(user_details)
          result = json.dumps (get_result, default=default_encoder, indent = 2, sort_keys = True)
          resp = make_response(result)
          resp.headers.add('X-token',get_result.get('data'))
     except Exception as e:
          resp="Error! %s " % e
     return resp

@app.route("/login", methods = [ 'OPTIONS' ] )
def log_in_options():
     return ''


@app.route("/home/<token>", methods = [ 'GET' ] )
def home_get(token):
     ##token=request.headers.get('X-token')
     user_init = user(mongodb)
     token_check = user_init.token_validator(token)
     if token_check.get('success')==True:
          try:
               data_init = raw_data(mongodb)
               get_data = data_init.get()
               names = get_data.get('data').get('names')
               months =json.dumps(get_data.get('data').get('months'))
               budget_init = chart(mongodb)
               get_budget = budget_init.get_all()
               budget = json.dumps(get_budget, default=default_encoder, indent=2, sort_keys = True)
               month_name=[]
               for x in get_data.get('data').get('months'):
                    month_name.append(x.get('name'))

               date_now = datetime.now()
               year_now = date_now.year - 2
               years=[]
               while year_now < date_now.year:
                    year_counter = year_now + 1
                    years.append(year_counter)
                    year_now += 1

               custom_style = Style(
                    background='transparent',
                    plot_background='transparent',
                    opacity='.6',
                    opacity_hover='.9',
                    transition='400ms ease-in',
                    label_font_size = 13,
                    major_label_font_size=15
               )

                    
               line_chart = pygal.Bar(
                    width=1040, height=600,
                    # explicit_size=True,
                    style=custom_style,
                    disable_xml_declaration=True
               )
               
               line_chart.title = 'Budget Comparison Between Last Year and Current Year'
               line_chart.x_labels = month_name
               year_1 =[]
               year_2 =[]
               budget_raw = get_budget.get('data')
               counter = 0
               current_year = date_now.year - 1
               while counter < len(years):
                    year = years[counter]

                    for y in month_name:
                         month_year = "%s_%s" % (y,year)
                         month_val=budget_raw.get(month_year)

                         if year == current_year:
                              if month_val:
                                   year_1.append(month_val.get('amount_pesos'))
                              else:
                                   year_1.append(0)
                         else:
                              if month_val:
                                   year_2.append(month_val.get('amount_pesos'))
                              else:
                                   year_2.append(0)
                    counter += 1
               line_chart.add(str(years[0]),year_1 )
               line_chart.add(str(years[1]),year_2 )
               resp = render_template('finance_page.html', names=names, months=months, chart_test=line_chart, budget=year_2)
          except Exception as e:
               resp="Error! %s " % e
     else:
          resp = render_template('log_in.html')#json.dumps(message)
     return resp



@app.route("/home/<token>", methods = [ 'OPTIONS' ] )
def home_opts(token):
     return ''



@app.route("/logout", methods = [ 'DELETE' ] )
def logout_del():
     try:
          token=request.headers.get('X-token')
          logout_init = user(mongodb)
          logout = logout_init.delete(token)
          # result = json.dumps (logout, default=default_encoder, indent = 2, sort_keys = True)
          # resp = make_response(result)
          resp = json.dumps(logout, default=default_encoder, indent = 2, sort_keys = True)
     except Exception as e:
          resp="Error! %s " % e
     return resp

@app.route("/logout", methods = [ 'OPTIONS' ] )
def logout_options():
     return ''


@app.route("/home/<token>/monthly_budget", methods = [ 'GET' ] )
def budget_get(token):
     user_init = user(mongodb)
     token_check = user_init.token_validator(token)
     if token_check.get('success')==True:
          try:
               payload = request.data
               payload_json = json.loads(payload)
               
               resp = render_template('finance_page.html', names=names, months=months)#json.dumps(message)
          except Exception as e:
               resp="Error! %s " % e
     else:
          resp = render_template('log_in.html')#json.dumps(message)
     return resp

@app.route("/home/<token>/monthly_budget", methods = [ 'POST' ] )
def budget_post(token):
     user_init = user(mongodb)
     token_check = user_init.token_validator(token)
     if token_check.get('success')==True:
          try:
               payload = request.data
               payload_json = json.loads(payload)
               monthly_init = budget(mongodb)
               create_budget = monthly_init.create(payload_json) 
               resp = json.dumps(create_budget, indent=2, sort_keys=True)
          except Exception as e:
               resp="Error! %s " % e
     else:
          resp = render_template('log_in.html')#json.dumps(message)
     return resp


@app.route("/home/<token>/monthly_budget", methods = [ 'OPTIONS' ] )
def budget_options(token):
     return ""

@app.route("/home/<token>/get_budget/<month>/<year>", methods = [ 'GET' ] )
def get_budget(token,month,year):
     user_init = user(mongodb)
     token_check = user_init.token_validator(token)
     if token_check.get('success')==True:
          try:
               data={"month":month, "year":int(year)}
               monthly_init = budget(mongodb)
               get_budget = monthly_init.get(data)

               data_init = raw_data(mongodb)
               get_data = data_init.get()
               names = get_data.get('data').get('names')


               custom_style = Style(
                    background='transparent',
                    plot_background='transparent',
                    opacity='.6',
                    opacity_hover='.9',
                    transition='400ms ease-in',
                    label_font_size = 12
               )

                    # value_label_font_size =0,


               
               title = '%s %s Budget Breakdown' % (month, year)
               line_chart = pygal.HorizontalBar(
                    width=1220,
                    height=850,
                    explicit_size=True,
                    title=title,
                    style=custom_style,
                    disable_xml_declaration=True,
                    show_legend=False
               )
               
               list_name = []
               for x in names:
                    list_name.append(x.get('name'))
               line_chart.x_labels = list_name
               monthly_breakdown = dict(get_budget.get('data') )
               budget_val = []
               for x in list_name:
                    y = monthly_breakdown.get(x)
                    budget_val.append(y)
                    # test.append(x)
                    
               line_chart.add(str('Name'),budget_val )
               

               data= json.dumps(get_budget.get('data'), indent=2, sort_keys=True)
               # resp = render_template('finance_page.html', names=names, months=months, chart_test=line_chart, budget=year_2)
               resp = render_template('finance_page.html',data=data, monthly_chart=line_chart)
          except Exception as e:
               resp="Error! %s " % e
     else:
          resp = render_template('log_in.html')#json.dumps(message)
     return resp


@app.route("/home/<token>/workout", methods = [ 'GET' ] )
def workout_get(token):
     user_init = user(mongodb)
     token_check = user_init.token_validator(token)
     if token_check.get('success')==True:
          try:
               resp=render_template('workout_management.html')#json.dumps(message)
          except Exception as e:
               resp="Error! %s " % e
     else:
          resp = render_template('login.html')#json.dumps(message)
     return resp


@app.route("/home/<token>/workout", methods = [ 'OPTIONS' ] )
def workout_options(token):
     return ''

@app.route("/home/<token>/get_budget", methods = [ 'OPTIONS' ] )
def get_budget_options(token):
     return ''




@app.route("/home/<token>/add_member", methods = [ 'POST' ] )
def add_POST(token):
     user_init = user(mongodb)
     token_check = user_init.token_validator(token)
     if token_check.get('success')==True:
          try:
               payload = request.data
               payload_json = json.loads(payload)
               member_init = member(mongodb)
               add_member = member_init.add(payload_json) 
               resp = json.dumps(add_member, indent=2, sort_keys=True)
          except Exception as e:
               resp="Error! %s " % e
     else:
          resp = render_template('log_in.html')#json.dumps(message)
     return resp



@app.route("/home/<token>/add_member", methods = [ 'OPTIONS' ] )
def add_options(token):
     return ''

##workout routes##
@app.route("/home/<token>/create_workout", methods = [ 'GET' ] )
def workout_temp_get(token):
     user_init = user(mongodb)
     token_check = user_init.token_validator(token)
     if token_check.get('success')==True:
          try:
               workout_init = workout(mongodb)
               get_temp = workout_init.get()
               resp = json.dumps(get_temp, indent=2, sort_keys = True)
               
          except Exception as e:
               resp="Error! %s " % e
     else:
          resp = render_template('log_in.html')#json.dumps(message)
     return resp

@app.route("/home/<token>/create_workout", methods = [ 'OPTIONS' ] )
def workout_temp_options(token):
     return ''


@app.route("/home/<token>/health", methods = [ 'GET' ] )
def health_get(token):
     user_init = user(mongodb)
     token_check = user_init.token_validator(token)
     if token_check.get('success')==True:
          try:
               resp=render_template('health.html')#json.dumps(message)
          except Exception as e:
               resp="Error! %s " % e
     else:
          resp = render_template('log_in.html')#json.dumps(message)
     return resp



if __name__ == "__main__":
    app.run(debug=True)


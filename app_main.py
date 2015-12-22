#!/usr/bin/env python                                                                                                                                                                                       
#-*- coding: utf-8 -*- 

from flask import Flask,request, render_template, flash, jsonify, make_response, Response, url_for, redirect
from pymongo import MongoClient
import json, datetime, local_settings, calendar, collections
from modules.management_portal_obj import *

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
               resp = render_template('fin.html', names=names, months=months)#json.dumps(message)
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
               
               resp = "test" #render_template('fin.html', names=names, months=months)#json.dumps(message)
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


if __name__ == "__main__":
    app.run(debug=True)


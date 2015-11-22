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
     return 'scheduler <br/>\n%s<br/>\n%s' % ( exception, request.url )

@app.errorhandler( 401 )
def internal_401_error( exception ):
     #app.logger.exception( exception )
     return 'scheduler<br/>\n%s<br/>\n%s' % ( exception, request.url )


def default_encoder( obj, encoder=json.JSONEncoder() ):
    if isinstance( obj, ObjectId ): 
        return str( obj )  
    if isinstance(obj, datetime.datetime):
         date = datetime.date(obj.year, obj.month, obj.day)
         return str(date)#.strftime( '%Y-%m-%d' )
    return encoder.default( obj )


@app.route("/login", methods = [ 'GET' ] )
def log_in_get():
     token_id = "hi" #request.headers.get('x-token')
     resp = make_response()
     resp.headers.add('X-token',token_id)

     return render_template('log_in.html',resp=resp )

@app.route("/login", methods = [ 'POST' ] )
def log_in_post():
     token_id = "hi" #request.headers.get('x-token')
     try:
          payload = request.data
          payload_json = json.loads(payload)
          user_details = payload_json[0]
          user_details.update({ "headers":dict(request.headers), "cookies":dict(request.cookies) })
          user_init = user(mongodb)
          get_result = user_init.check_login(user_details)
          result = json.dumps (get_result, default=default_encoder, indent = 2, sort_keys = True)
          resp = make_response(result)
          resp.headers.add('X-token',token_id)
     except Exception as e:
          resp="Error! %s " % e
     return resp

@app.route("/login", methods = [ 'OPTIONS' ] )
def log_in_options():
     return ''

@app.route("/logout", methods = [ 'DELETE' ] )
def logout_del():
     try:
          payload = request.data
          payload_json = json.loads(payload)
          id_raw = payload_json[0]
          logout_init = user(mongodb)
          logout = logout_init.logout(id_raw.get('id'))
          result = json.dumps (logout, default=default_encoder, indent = 2, sort_keys = True)
          resp = make_response(result)
     except Exception as e:
          resp="Error! %s " % e
     return resp

@app.route("/logout", methods = [ 'OPTIONS' ] )
def logout_options():
     return ''






if __name__ == "__main__":
    app.run(debug=True)
    #app.run()

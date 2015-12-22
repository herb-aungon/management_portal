import  pprint, dpath.util,  json, bson, copy, calendar, collections
from bson.objectid import ObjectId
from datetime import *
class message():
    def __init__(self):
        self.__resp = {'success':False, 'message':None, 'data':None}

    def update(self, data):
        for i in data.keys():
            self.__resp[i]=data.get(i)
        return self.__resp

class user():
    def __init__( self, mongodb ):
        self.__mongodb = mongodb

    def check(self, user_data):
        msg_class = message()
        resp_data = {}

        try:
            username = user_data.get('username')
            password = user_data.get('password')
            if len(username)>0 or len(password)>0:
                user_check = self.__mongodb.user.find_one( { "username":username, "password":password } )
                if user_check:
                    token = self.__mongodb.token.insert( { 
                        "login_date" :datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        "headers":user_data.get('headers'),
                        "cookies":user_data.get('cookies'),
                        "username":user_check.get('username'),
                        "last_activity":datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    } )
                    resp_data.update({'message':'Welcome %s' % user_check.get('username'), 'success':True, 'data':token})
                else:
                    resp_data.update({'message':'Login Failed!Incorrect username/password'})
            else:
                resp_data.update({'message':'username or password cannot be empty!'})
        except Exception as e:
            resp_data.update({ 'message':'Failed to Authorise Login!Reason:%s' % e })
            
        msg_upd=msg_class.update(resp_data)
        return msg_upd 


    def token_validator(self,token_id):
        msg_class = message()
        resp_data = {}

        try:
            token = self.__mongodb.token.find_one({"_id": ObjectId(token_id)})
        except Exception as e:
            #token = None
            resp_data.update({ 'message':'Failed to Authenticate tokenn!Reason:%s' % e })
            msg_upd=msg_class.update(resp_data)
            return msg_upd 

        try:
            if token:
                last_act = datetime.strptime(token.get('last_activity'),'%Y-%m-%d %H:%M:%S')
                now_raw = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                now = datetime.strptime(now_raw,'%Y-%m-%d %H:%M:%S')
                time_left = (now - last_act).total_seconds()/60
                
                if time_left <= 60:
                    self.__mongodb.token.update(
                        {
                            "_id": ObjectId(token_id)
                        },
                        { "$set":
                          {
                              "last_activity": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                          }
                      },
                        upsert= False,
                        multi=False
                    )
                    resp_data.update({ 'message':'Login session renewed for user %s' % token.get('username'), 'success':True })
                else:
                    self.__mongodb.token.remove( { "_id": ObjectId(token_id) } )
                    resp_data.update({ 'message':'Login session expired for user %s' % token.get('username') })
            else:
                resp_data.update({ 'message':'Token not found!' })

        except Exception as e:
            resp_data.update({ 'message':'Failed to Authenticate tokenn!Reason:%s' % e })

        msg_upd=msg_class.update(resp_data)
        return  msg_upd

    def delete(self, token):
        msg_class = message()
        resp_data = {}
        try:
            self.__mongodb.token.remove( { "_id": ObjectId(token) } )
            resp_data.update({'message':'Token %s removed' % token, 'success':True })
        except Exception as e:
            resp_data.update({ 'message':'Failed to removed token !Reason:%s' % e })
            
        msg_upd=msg_class.update(resp_data)
        return msg_upd 

class budget():
    def __init__( self, mongodb ):
        self.__mongodb = mongodb

    def create(self,data):
        msg_class = message()
        resp_data = {}
        try:
            if len(data)>0:
                format_data = {}
                format_data['amount_pesos']= int( data.get('amount_pesos'))
                format_data['month']= data.get('month')
                format_data['year'] = int(data.get('year'))
                format_data['rate'] = int(data.get('rate'))
                format_data['amount_pounds']= int(data.get('amount_pounds'))

                #exclude the fields below
                del data['amount_pesos']
                del data['month']
                del data['year']
                del data['rate']
                del data['amount_pounds']

                data_keys = data.keys()
                breakdown=[]

                #format data 
                for name in data_keys:
                    breakdown.append({ "name":name, "amount":data.get(name) })

                format_data["budget_breakdown"]=breakdown

                resp_data.update({'message':'Monthly Budget Created', 'data':format_data, 'success':True})
            else:
                resp_data.update({'message':'data empty!'})
        except Exception as e:
            resp_data.update({ 'message':'Failed to create!Reason: %s' % e })
            
        msg_upd=msg_class.update(resp_data)
        return msg_upd 




class raw_data():
    def __init__( self, mongodb ):
        self.__mongodb = mongodb

    def get(self):
        msg_class = message()
        resp_data = {}
        try:
            names = self.__mongodb.list_name.find({},{'_id':0})
            name=[]
            for n in names:
                name.append(n)
            months = self.__mongodb.month.find( {},{ "_id": 0 } )
            month=[]
            for m in months:
                month.append(m)
            resp_data.update({'message':'data returned', 'success':True, 'data':{'names':name, 'months':month} })
        except Exception as e:
            resp_data.update({ 'message':'No data Found!Reason:%s' % e })
            
        msg_upd=msg_class.update(resp_data)
        return msg_upd 
        

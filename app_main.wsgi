#!/usr/bin/env python
#-*- coding: utf-8 -*-

activate_this = '/home/herb/Desktop/Projects/management_portal/env/bin/activate_this.py'
exec(open(activate_this).read(), dict(__file__=activate_this))

import sys, site, os
sys.stdout = sys.stderr
sys.path.insert( 0, os.path.dirname( os.path.realpath( __file__ ) ) )
sys.path.insert( 0, os.path.dirname( os.path.realpath( __file__ ) ) +  "/home/herb/Desktop/Projects/management_portal/env/lib/python2.7/site-packages/" )# import packages sys and site to control the environment)

# import my code
from app_main import app as application


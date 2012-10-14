#!/usr/bin/env python

import urllib2
import cgitb
import cgi
cgitb.enable()

form = cgi.FieldStorage()
f = urllib2.urlopen(form.getfirst('url'))
print 'Content-Type: ' + f.info().getheader('Content-Type') + ';charset=utf-8'
print
print urllib2.quote(f.read().encode("base64"))

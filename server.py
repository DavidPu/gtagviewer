#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import BaseHTTPServer,CGIHTTPServer
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('-b', action='store', dest='host',
                    help='host name/address bind to', default='127.0.0.1')
parser.add_argument('-p', action='store', dest='port',
                    help='port number bind to', type=int, default=8080)

ret = parser.parse_args()
http = BaseHTTPServer.HTTPServer((ret.host, ret.port), CGIHTTPServer.CGIHTTPRequestHandler)
print "starting server " + ret.host + ":" + str(ret.port)
http.serve_forever()

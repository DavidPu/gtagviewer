#!/usr/bin/env python

import cgi
import cgitb
cgitb.enable()
import os
import sys
import subprocess
import json

import config

#os.chdir('cgi-bin')
print "Content-Type: text/html\n\n"

print open("README.md", 'r').read()

exit(0)

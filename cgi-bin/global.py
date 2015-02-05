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
print "Content-Type: text/html\n"

ROOT= config.ROOT
FIND_CMD = config.FIND
GLOBAL_CMD = config.GLOBAL

def execute(cmd):
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                         shell=True)
    out = p.communicate();
    return out

form = cgi.FieldStorage()
fromhere = form.getvalue('fromhere', '')
pattern = form.getvalue('pattern', '')
type = form.getvalue('type', '')
flag = 'd'
if type == 'reference':
    flag = 'r'
elif type == 'symbol':
    flag = 's'
elif type == 'path':
    flag = 'P'
elif type == 'grep':
    flag = 'g'
elif type == 'idutils':
    flag = 'I'
elif type == 'file':
    flag = 'f'


fflag = ''
if fromhere != '':
    fflag = ' --from-here=' + fromhere

os.chdir(ROOT)
if flag != 'f':
    cmdline = GLOBAL_CMD  + fflag + ' -x' +  flag + 'e' + ' ' + pattern
else:
    cmdline = GLOBAL_CMD  + fflag + ' -x' +  flag + ' ' + pattern
#print cmdline
ret = execute(cmdline)[0]
os.sys.stdout.write(ret)

exit(0)

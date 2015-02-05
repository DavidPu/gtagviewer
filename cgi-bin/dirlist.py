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

ROOT= config.ROOT
FIND_CMD = config.FIND

def execute(cmd):
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                         shell=True)
    out = p.communicate();
    return out[0]

form = cgi.FieldStorage()
s = form.getvalue("path", "")
path = ROOT + s

if not os.path.exists(path):
    print json.dumps({'code':-1, 'path':s, 'result':[]})
    exit(0)

cmd = FIND_CMD + ' ' + path + ' -maxdepth 1 -type d ! -name ".*" -printf "%f\n"'
dirs = execute(cmd)
pos = dirs.index('\n')+1
if pos >= len(dirs):
    dirs = ""
else:
    dirs = dirs[dirs.index('\n')+1:]

find_params = ' -maxdepth 1 -type f ! -name ".*" ! -name "GPATH"  ! -name "GRTAGS" ! -name "GTAGS" -printf "%f\n"'
cmd = FIND_CMD + ' ' + path + find_params
flist = execute(cmd)
result = []
if dirs != "":
    for d in dirs.split('\n'):
        if len(d) > 0:
            result.append({'type':'d', 'name':d})

flist = flist.split('\n')
if len(flist) > 0:
    for f in flist:
        if len(f) > 0:
            result.append({'type':'f', 'name':f})
if len(result) > 0:
    result = sorted(result, key=lambda elem: elem['name'].lower())
    print json.dumps({'code':len(result), 'path':s, 'result':result})
else:
    print json.dumps({'code':0, 'path':s, 'result':[]})

exit(0)

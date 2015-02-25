#!/usr/bin/env python

import cgi
import cgitb
cgitb.enable()
import os
import sys
import subprocess
import json
from tocommand import Command
import config

#os.chdir('cgi-bin')
print "Content-Type: text/html\n"

ROOT= config.ROOT
FIND_CMD = config.FIND
GLOBAL_CMD = config.GLOBAL

def execute(cmd, timeout):
#    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
#                         shell=True)
#    out = p.communicate();
#    return out
    cmd = Command(cmd)
    return cmd.run(timeout)


form = cgi.FieldStorage()
fromhere = form.getvalue('fromhere', '')
pattern = form.getvalue('pattern', '')
if pattern == '':
    exit(0)

type = form.getvalue('type', '')
autocomp = form.getvalue('autocomp', '')
icase = form.getvalue('icase', '')
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

if icase == 'i':
    flag = flag + 'i'

if autocomp == 'c' and flag != 'g':
    flag = 'c' + flag
    #fromhere = ''

fflag = ''
if fromhere != '':
    fflag = ' --from-here=' + fromhere

os.chdir(ROOT)
if flag != 'f':
    cmdline = GLOBAL_CMD  + fflag + ' -x' +  flag + 'e' + ' ' + '"' + pattern + '"'
else:
    cmdline = GLOBAL_CMD  + fflag + ' -x' +  flag + ' ' + '"' + pattern + '"'

to = 5
if autocomp == 'c':
    to = 1

#print cmdline
ret = execute(cmdline, to)[1]
os.sys.stdout.write(ret)

exit(0)

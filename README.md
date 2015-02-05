=== Usage ===

0. you may need to build latest global by following: http://www.gnu.org/software/global/download.html

1. generate tags with 'global' under your source code tree. e.g:
   cd ~/src/mydroid
   gtags
   ... wait ....

2. untar the gtagviewer somewhere you want to run. e.g:
   tar -jxf gtagviewer.tar.bz2 -C ~/gtagviewer

3. modify gtagviewer/cgi-bin/config.py:
   ROOT: point to your ~/src/mydroid. use FULL path instead.
   FIND: point to your GNU find command, e.g: /usr/bin/find. check with 'which find'.

4. create a symbol link 'src' ---> ~/src/mydroid under gtagviewer folder. e.g:
  cd ~/gtagviewer
  ln -s ~/src/mydroid src

5. start the server && browse your code with your web browser:
   sudo python server.py -b 127.0.0.1 -p 80 &
   google-chrome http://127.0.0.1


=== KEY Bindings ===

1. use F6/F7/F8 to toggle Left/Bottom/Right panels.

2. all panels works just like a vim editor! type '/' to search something, '#' to select word, use hjkl to move around!

3. Mouse: try to left/right/middle button click to see what happens..

   Happy Hacking!

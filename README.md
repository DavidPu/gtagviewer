## Usage

* you may need to build latest global by following: http://www.gnu.org/software/global/download.html

* generate tags with 'global' under your source code tree. e.g:
   ```bash
   cd ~/src/mydroid
   gtags
   ... wait ....
   ```

* untar the gtagviewer somewhere you want to run. e.g:
   tar -jxf gtagviewer.tar.bz2 -C ~/gtagviewer

* modify gtagviewer/cgi-bin/config.py:
	```bash
   ROOT: point to your ~/src/mydroid. use FULL path instead.
   FIND: point to your GNU find command, e.g: /usr/bin/find. check with 'which find'.
	```
* create a symbol link 'src' ---> ~/src/mydroid under gtagviewer folder. e.g:
   ```bash
  cd ~/gtagviewer
  ln -s ~/src/mydroid src
   ```
* start the server && browse your code with your web browser:
   ```bash
   sudo python server.py -b 127.0.0.1 -p 80 &
   google-chrome http://127.0.0.1
   ```

## KEY Bindings

* use F6/F7/F8 to toggle Left/Bottom/Right panels.

* all panels works just like a vim editor! type '/' to search something, '#' to select word, use hjkl to move around!

* Mouse: try to left/right/middle button click to see what happens..

   Happy Hacking!

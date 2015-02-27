## Usage

* you may need to build latest global by following: http://www.gnu.org/software/global/download.html

* generate tags with 'global' under your source code tree. e.g:
   ```bash
   cd ~/src/mydroid
   gtags
   ```

* get the gtagviewer somewhere you want to run. e.g:
  ```bash
  git clone https://github.com/DavidPu/gtagviewer.git ~/gtagviewer
  ```

* modify gtagviewer/cgi-bin/config.py:
   ```bash
   ROOT: point to your ~/src/mydroid. use FULL path instead. e.g: /home/username/src/mydroid
   FIND: point to location of GNU find command, e.g: /usr/bin/find. check with 'which find'.
   GLOBAL: point to location of global command, e.g: /usr/local/bin/global
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

## Screen Shot

* simple file browser:
   ![search path](demo/images/dirlist.png?raw=true)

* search box with autocomplete supported:	
   ![search path](demo/images/autocomp.png?raw=true)

* definition/reference search with Left/Middle mouse key click:
   ![search path](demo/images/searchdef.png?raw=true)

* path search with regex support:
   ![search path](demo/images/path.png?raw=true)


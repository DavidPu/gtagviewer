//var util = require("gtagviewer/util");

$(function() {
  String.prototype.format = function() {
    var formatted = this;
    for( var arg in arguments ) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
  };

  function getSearchValue(str, key, defvaule) {
    //return util.getSearchValue(str, key, defvaule);
    return env.Util.getSearchValue(str, key, defvaule);
  }
  
    (function(window,undefined){
    //History.pushState({state:1,rand:Math.random()}, "State 1", "?state=1");
    // Bind to StateChange Event
    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        var s = getSearchValue(State.url, "path", "");
        if (s.length <= 0) {
            return
        }
        s = "/cgi-bin/dirlist.py?path=" + s;
        $.getJSON(s, loadData);
    });
    
    })(window);
  
  
  function openAll(data) {
    if (data.code <= 0) {
        return;
    }
    var paths = data.result;
    var fh = env ?  env.fileHistory : null;
    if (!fh) {
        return;
    }
    for (var i = 0; i < paths.length; i++) {
        if (paths[i].type == 'f') {
            var s = data.path + '/' + paths[i].name;
            fh.pushFile(s.indexOf('/') == 0 ? s.substr(1) : s);
        }
    }
    //show code viewer page
    env.Util.showpage('codeviewer');
  }
  
  function updatePath(path) {
    var pathtxt = '<a class="anchorclick" href="?path="> &nbsp;/root</a>';

    if (path !== "") {
      var paths = path.split('/');
      var subpath = ""
      for (var i = 0; i < paths.length-1; i++) {
        if (paths[i].length > 0) {
          subpath += '/' + paths[i];
          pathtxt += '<a class="anchorclick" href="?path={0}">{1}</a>'.format(subpath, '/' + paths[i]);
        }
      }
      pathtxt += "/" + paths[paths.length-1];
    }
    $(".pathurl")[0].innerHTML = pathtxt;
  }
  function loadData(data) {
    updatePath(data.path);
    if (data.code == 0) {
      $("#filelist")[0].innerHTML = '<tr class="flist"><tr<td class="flist"> Empty Folder</td></tr>'
    }
    if (data.code > 0) {
      var tabstr = "";
      var tabs = [];
      var MAX = 1000;
      var hasfile = false;
      for (var i = 0; i < data.result.length && i < MAX; i++) {
        if (data.result[i].type == 'f') {
            hasfile = true;
        }
        var type = data.result[i].type == 'f' ? "file2.png " : "dir2.png ";
        var name = data.result[i].name;
        var href = data.result[i].type == 'f' ? /*location.pathname + */ "?file=" + data.path + '/' + name : 
                                                                          "?path=" + data.path + '/' + name;
        /*var clazz = data.result[i].type == 'f' ? "" : 'anchorclick'; */
        var clazz = 'anchorclick';
        tabstr += '<td class="flist"><a class="{0}" href="{1}" ><img class="icon" src="../3rdparty/icons/{2}" alt="{3}" />&nbsp;{4}</a></td>'.format(clazz, href, type, name, name);
        if ((i > 0 && (i+1) % 5 == 0) || (i == data.result.length - 1) || (i == MAX -1) ) {
            tabs.push('<tr class="flist"> ' + tabstr + '</tr>\r\n');
            tabstr = "";
        }
      }
      $("#filelist")[0].innerHTML = tabs.join("");
      if (hasfile) {
        var allfiles = '<a class="anchorclick" href="?all={0}">OpenAll</a>'.format(data.path == "" ? "/" : data.path);
        $(".pathurl")[0].innerHTML += "&nbsp;&nbsp;&nbsp;&nbsp;" + allfiles;
      }
    }
    
    $(".anchorclick").click(function(e) {
        var s = getSearchValue(this.href, "file", "");
        if (s.length > 0) {
            //History.pushState(/*{state:1,rand:Math.random()}*/null, s, "?file=" + s);
            var ft = env ? env.fileTags : null;
            if (ft) {
                ft.loadTags(s.indexOf('/') == 0 ? s.substr(1) : s);
            }
            var fh = env ?  env.fileHistory : null;
            if (fh) {
                fh.pushFile(s.indexOf('/') == 0 ? s.substr(1) : s);
                //show code viewer page
                env.Util.showpage('codeviewer');
            }
            s = window.ROOTDIR + s;
            $.get(s, function(t) {
                if (env) {
                    var editor = env.editor;
                    if (editor) {
                        editor.setValue(t, 1);
                    }
                }
                
            });
            return false;
        }
        s = getSearchValue(this.href, "all", "");
        if (s.length > 0) {
            s = "/cgi-bin/dirlist.py?path=" + s;
            $.getJSON(s, openAll);
            return false;
        }
        s = getSearchValue(this.href, "path", "/");
        if (s.length > 0) {
            s = (s == '/' ? "" : s);
            //History.pushState(/*{state:1,rand:Math.random()}*/null, s, "?path=" + s);
            s = "/cgi-bin/dirlist.py?path=" + s;
            $.getJSON(s, loadData);
        }
        return false;
    });

  }

  $.getJSON("/cgi-bin/dirlist.py?path=" + getSearchValue(location.search, "path", ""), loadData);
  /*$.getJSON("/cgi-bin/dirlist.py?path=/art/test", loadData);*/
});

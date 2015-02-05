define("gtagviewer/gtags", function(require, exports, module) {
"use strict";

var env = {};
var openedFiles = [];
/*document.oncontextmenu = function () {
    History.go(-1);
    return false;
};*/

(function(window, undefined) {
    //History.pushState({state:1,rand:Math.random()}, "State 1", "?state=1");
    // Bind to StateChange Event
    History.Adapter.bind(window,'statechange',function(){
    // Note: We are using statechange instead of popstate
	//console.log(History.getState());
    });

})(window);

var event = require("ace/lib/event");
var VimHandler = require("ace/keyboard/vim").handler;
var ace = require("ace/ace");
var AcePopup = require("ace/autocomplete/popup").AcePopup;
var net = require("ace/lib/net");
//var editor = ace.edit("editor");
var elEditor = document.getElementById("editor");
//var theme = require("ace/theme/solarized_light");
var theme = require("ace/theme/clouds");
var Split = require("gtagviewer/split").Split;
var modelist = require("ace/ext/modelist");
var FileHistory = require("gtagviewer/filehistory").FileHistory;
var FileTags = require("gtagviewer/filetags").FileTags;

var split = new Split(elEditor, theme);
var editor = split.getEditor(split.CENTER);

var southEditor = split.getEditor(split.SOUTH);
var westEditor = split.getEditor(split.WEST);
var fileHistory = new FileHistory(westEditor);
env.fileHistory = fileHistory;
var fileTags = new FileTags(split.getEditor(split.EAST));
env.fileTags = fileTags;
//fileHistory.pushFile();

//dblclick
southEditor.on("click", function(e) {
   gotoDefinition(e.editor);
});
editor.on('click', function(e) {
    if (e.domEvent.ctrlKey) {
        getDefinition(e.editor);
    } else if (e.domEvent.which == 2) {
	getDefinition(e.editor, "reference");
    } else if (e.domEvent.which == 1) {
	getDefinition(e.editor, "definition");
    }
});
editor.on("dblclick", function(e){
    getDefinition(e.editor);
});
southEditor.commands.addCommands([
    {
        name: "gotoDefinition",
        bindKey: {win: "F2", mac: "F2"},
        exec: gotoDefinition,
	readOnly: true,
    },
]);

/*
$(document).click(function(e){
  // checking for any non left click and convert to left click.
  if (e.which != 1) { 
    e.which = 1;
  }
});
*/
//southEditor.getSelection().on("changeCursor", function(e) {
//   var pos = editor.getCursorPosition();
//});
/********************************* Editor setup START *****************************/
function showSplits(editor) {
    var sp = env.split;
    var mask = sp.getSplitMask();
    if (mask & sp.MASKWEST) {
        sp.showSplits(mask & ~sp.MASKWEST);
        split.getEditor(split.WEST).focus();
    } else {
        sp.showSplits(mask | sp.MASKWEST);
        split.getEditor(split.CENTER).focus();
    }
}
function showSplits2(editor) {
    var sp = env.split;
        var mask = sp.getSplitMask();
    if (mask & sp.MASKSOUTH) {
        sp.showSplits(mask & ~sp.MASKSOUTH);
        split.getEditor(split.SOUTH).focus();
    } else {
        sp.showSplits(mask | sp.MASKSOUTH);
        split.getEditor(split.CENTER).focus();
    }
}
function showSplits3(editor) {
    var sp = env.split;
        var mask = sp.getSplitMask();
    if (mask & sp.MASKEAST) {
        sp.showSplits(mask & ~sp.MASKEAST);
        split.getEditor(split.EAST).focus();
    } else {
        sp.showSplits(mask | sp.MASKEAST);
        split.getEditor(split.CENTER).focus();
    }
}

function setupEditor(editor, opts) {
    //TODO:F2/F4/F6 confilicts with it.
    //editor.setReadOnly(true);
    editor.setOptions({
	hScrollBarAlwaysVisible: true,
        showPrintMargin: false,
        fontSize: "14px",
	showLineNumbers: true,
	showGutter: false,
	readOnly: true,
    });
    if (opts || typeof opts == "object") {
        editor.setOptions(opts);
    }
    //editor.setShowPrintMargin(false);
    editor.setTheme(theme);
    editor.setKeyboardHandler(VimHandler);
    editor.session.setMode("ace/mode/c_cpp");
    editor.commands.addCommands([
    {
        name: "PopTag",
        bindKey: {win: "Ctrl+\\", mac: "Ctrl+\\"},
        exec: popTag,
	readOnly: true,
    },
    {
        name: "getDefinition",
        bindKey: {win: "Ctrl+]", mac: "Ctrl+]"},
        exec: getDefinition,
	readOnly: true,
    },
    {
        name:"showSideSymoblView",
        bindKey: {win:"F6", mac:"F6"},
        exec: showSplits,
	readOnly: true,
    },
    {
        name:"showSideSymoblView2",
        bindKey: {win:"F7", mac:"F7"},
        exec: showSplits2,
	readOnly: true,
    },    {
        name:"showSideSymoblView3",
        bindKey: {win:"F8", mac:"F8"},
        exec: showSplits3,
	readOnly: true,
    },
    {
	name: "gotopageup",
	bindKey: "PageUp",                                                                                                                        
	exec: function(editor) { editor.scrollPageUp(); },
	readOnly: true

    },]);

}

setupEditor(split.getEditor(split.WEST));
setupEditor(split.getEditor(split.CENTER), {showGutter: true});
setupEditor(split.getEditor(split.SOUTH));
setupEditor(split.getEditor(split.EAST));
//$(editor.container).resizable();
env.editor = editor;
editor.focus();
env.split = split;
window.env = env;


function setEditMode(editor, path) {
    return modelist.getModeForPath(path).mode;
}

/********************************* Editor setup END *****************************/

/********************************* AcePopup setup START *****************************/
var popup = new AcePopup(document.body || document.documentElement);

var src = "";
if (location.search.length > 1) {
    var queries = location.search.substr(1).split("&");
    for (var i = 0; i < queries.length; i++) {
        if (queries[i].indexOf("file=") == 0) {
	    var f = queries[i].substr(5);
        f = f[0] == '/' ? f : '/' + f;
        src = f;
        }
    }
}

var lineNum = 0;
if (location.hash.length > 1) {
    var l = location.hash.substr(1);
    if (l.indexOf("L") == 0) {
        l = parseInt(l.substr(1), 10);
        if (l != NaN) {
            lineNum = l;
        }
    }
}

if (src == "") {
    src = '/cgi-bin/readme.py'
} else {
    setEditMode(editor, src);
    fileHistory.pushFile(src.substr(1)); //remove first '/'
    window.ROOTDIR + '/' + src  
}
net.get(src, function(t){
    var el = document.getElementById("editor");
    env.editor.setValue(t, 1);
    env.editor.gotoLine(lineNum);
    });

function preProcessQuery(txt) {
    if (!txt) {
        return "";
    }
    var s = txt.indexOf("<pre>");
    if (s === -1) {
        return "";
    }
    var e = txt.indexOf("</pre>\n", s);
    return txt.substring(s + "<pre>\n".length, e).replace(/<[^<>]*>/g, '');
}
function getDefinition(editor, type) {
    var pos = editor.getCursorPosition();
    var session = editor.session;
    var range = editor.selection.getWordRange(pos.row, pos.column);
    var line = session.getLine(pos.row);
    var word = line.substring(range.start.column, range.end.column);
    var q = type ? type : "definition";
    //q = "grep";
    var path = fileHistory.getCurFile();
    var fromhere = pos.row + ':'+path;

    if (word) {
        //var src = "/cgi-bin/global.cgi?pattern=" + word + "&id=&type=" + q;
	var src = "/cgi-bin/global.py?pattern=" + word + "&id=&type=" + q;
	if (q == 'definition') {
	    src += "&fromhere=" + fromhere;
	}
	
        //var src = "/cgi-bin/global.cgi?pattern=" + word + "&id=&type=reference";
        //var src = "/cgi-bin/global.cgi?pattern=" + word + "&id=&type=path";
        net.get(src,
                function (txt) {
                    var split = env.split;
                    var editor = split.getEditor(split.SOUTH);
                    var ret = txt;//preProcessQuery(txt);
                    if (ret === '') {
                        editor.setValue(txt.replace(/<[^<>]*>/g, ''), 1);
                    } else {
                        editor.setValue(ret, 1);
                        //editor.focus();
                    }
                }
                );
    }
}

function gotoDefinition(editor) {
    var pos = editor.getCursorPosition();
    var session = editor.session;
    var line = session.getLine(pos.row);
    if (!line) {
        return;
    }
    /* symbol  linenumber filepath codesnippet */
    var files = line.trim(/\s+/).split(/\s+/);
    if (files[2]) {
        var path = files[2];
        var symbol = files[0].trim(/\s+/);
        var lnum = parseInt(files[1], 10);
        var split = env.split;
        var ceditor = split.getEditor(split.CENTER);
        var src = window.ROOTDIR + "/" + path;
        //History.pushState({file:'/' + path, line:lnum},  '/' + path, "?file=" + '/' + path);
	fileHistory.pushFile(path);
        net.get(src, function (txt) {

            ceditor.setValue(txt, 1);
            var session = ceditor.session;
            setEditMode(ceditor, path);
            var line = session.getLine(lnum-1, 10);
            var column = line.indexOf(symbol);
            ceditor.gotoLine(lnum, column + symbol.length/2);
        });
	fileTags.loadTags(path);
    }
}

function popTag(editor) {
    
    getDefinition(editor, "reference");
/*    
    var s = History.getState();
    if (s && s.data) {
	var his = s.data;
        net.get(his.file, function (t) {
            editor.setValue(t, 1);
            editor.gotoLine(his.line);
        });
    }
*/    
}

$(window).on("resize", function(e) {
    //HACK HACK: resize from element also fires window resize,,
    // e.target == window: resize from browser.
    // e.target == div: resize from element.
    if (e.target == window) {
	split.resize();
    }
});

function getSearchValue(str, key, defvaule) {
  var idx;
  if (str.length > 1 && (idx = str.indexOf("?")) >= 0) {
      var queries = str.substr(idx+1).split("&");
      for (var i = 0; i < queries.length; i++) {
	  if (queries[i].indexOf(key + "=") == 0) {
	      var ret = queries[i].substr(key.length + 1);
	      return ret.length > 0 ? ret : defvaule;
	  }
      }
  }
  return defvaule;
}

});

(function() {
    window.require(["gtagviewer/gtags"], function() {});
})();

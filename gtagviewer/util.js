define("gtagviewer/util", ["require","exports","module"], function(require, exports, module) {
"use strict";

var net = require("ace/lib/net");
var modelist = require("ace/ext/modelist");


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


function getDefinition(editor, type, fileHistory) {
    var word = "";
    var fromhere = "";
    var isIcase = $("#icase")[0].checked || false;
    if (typeof editor == 'string') {
	word = editor;
    } else {
	var pos = editor.getCursorPosition();
	var session = editor.session;
	var range = editor.selection.getWordRange(pos.row, pos.column);
	var line = session.getLine(pos.row);
	word = line.substring(range.start.column, range.end.column);
	fromhere = pos.row + ':'+ fileHistory.getCurFile();
    }
    var q = type ? type : "definition";
    //q = "grep";

    if (word) {
	//var src = "/cgi-bin/global.cgi?pattern=" + word + "&id=&type=" + q;
	var src = "/cgi-bin/global.py?pattern=" + word + "&id=&type=" + q;
	if (q == 'definition' && fromhere.length > 0) {
	    src += "&fromhere=" + fromhere;
	}
	if (isIcase) {
	    src +="&icase=i";
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

function setEditMode(editor, path) {
    editor.session.setMode(modelist.getModeForPath(path).mode || "ace/mode/c_cpp");
}

function gotoDefinition(editor, fileHistory, fileTags) {
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
};

function getSearchType() {
    return $('#searchtype').attr('stype').toLowerCase();
};

function showpage(name) {
  $('.active').removeClass('active');
  $(['#', name].join('')).parent().addClass('active');
  if (name == 'codeviewer') {
    $('#filebrowser').hide();
    $('#editor').show();
  } else if (name == 'dirviewer') {
    $('#editor').hide();
    $('#filebrowser').show();
  }
}

module.exports = {
    getSearchValue:getSearchValue,
    getDefinition:getDefinition,
    setEditMode:setEditMode,
    gotoDefinition:gotoDefinition,
    getSearchType:getSearchType,
    showpage:showpage,
    };

});

(function() {
    window.require(["gtagviewer/util"], function() {});

    
$(function() {
	$('#searchbox').suggest('cgi-bin/global.py',{
		minchars: 4,
		delay: 100,
		extraParams : {
			type:  function() { return $('#searchtype').attr('stype').toLowerCase();},
		}
	});
});


$(function(){
    $('.pages').click(function(e){
      env.Util.showpage($(this)[0].id);
      return false;
    });

    $('#editor').show();
    $('#filebrowser').hide();
    $('#searchtype').attr('stype', 'definition');
});

$(function(){
    $('.searchopt').click(function(e){
      $('#searchtype').attr('stype', $(this)[0].text)[0].text = $(this)[0].text;
      $('#searchtype').append('<span class="caret"></span>');
    });
});

})();

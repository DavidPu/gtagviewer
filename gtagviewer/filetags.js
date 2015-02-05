define("gtagviewer/filetags", function(require, exports, module) {
"use strict";

var net = require("ace/lib/net");

var FileTags = exports.FileTags = function(editor) {
    this.$editor = editor;
    this.symbols = null;
    this.$editor.on('click', function (e){
	var pos = e.$pos;
	var fh = env.fileTags;
	var sp = env.split;
	var editor = sp.getEditor(sp.EAST);
	var s =  editor.session;
	var l = s.getLine(pos.row);
	if (pos.row >= 0 && pos.row < fh.symbols.length) {
	    var num = fh.symbols[pos.row].line;
	    var ceditor = sp.getEditor(sp.CENTER);
	    ceditor.gotoLine(num);
	}
    });

};

(function() {
    this.loadTags = function(path) {
	var gtagfile = "/cgi-bin/global.py?pattern=" + path + "&id=&type=file";
	net.get(gtagfile, function(txt) {
	    var sp = window.env.split;
	    var editor = sp.getEditor(sp.EAST);
	    var ft = env.fileTags;
	    ft.symbols = [];
	    var lines = txt.trim('\n').split('\n');
	    var ret = "";
	    for (var i = 0; i < lines.length; i++) {
		var l = lines[i].trim(/\s+/).split(/\s+/);
		ft.symbols.push({name:l[0], line:parseInt(l[1], 10)})
		ret += l[0] + '\n';
	    }
	    editor.setValue(ret, 1);
	});
    };
   
}).call(FileTags.prototype);

exports.FileTags = FileTags;
});

(function() {
    window.require(["gtagviewer/filetags"], function() {});
})();

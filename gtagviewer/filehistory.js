define("gtagviewer/filehistory", function(require, exports, module) {
"use strict";

var net = require("ace/lib/net");

var FileHistory = exports.FileHistory = function(editor) {
    this.$files = [];
    this.MAXLEN = 40;
    this.$editor = editor;
    this.focusedIdx = 0;

    this.$editor.on('click', function (e){
        var pos = e.$pos;
        var fh = env.fileHistory;
        if (pos.row >= fh.$files.length) {
            return
        }
        fh.focusedIdx = pos.row;
        var path = fh.$files[pos.row].path;
        //TODO:: Use History.push to manage all file open.
        net.get(window.ROOTDIR + '/' + path, function(t){
            var sp = window.env.split;
            var ceditor = sp.getEditor(sp.CENTER);
            ceditor.setValue(t, 1);
            ceditor.focus();
        });
        var ft = env.fileTags;
        if (ft) {
           ft.loadTags(path);
        }
    });

};

(function() {

    this.getFileIndex = function(path, isadd) {
        var push = isadd || true;
        for (var i = 0; i < this.$files.length; i++) {
            if (path === this.$files[i].path) {
                return {idx:i, isnew:false};
            }
        }
        if (push) {
            this.pushFile(path);
            return {'idx':this.$files.length - 1, isnew:true};
        }
        return null;

    },
    this.getCurFile = function() {
        var p = this.$files[this.focusedIdx];
        return p.path;
    },
    this.pushFile = function(p) {
        var filename = p.split(/[\/\\]/).pop();
        for (var i = 0; i < this.$files.length; i++) {
            if (p == this.$files[i].path) {
                this.$editor.gotoLine(i+1);
                this.focusedIdx = i;
                return;
            }
        }

        var record = {path:p, thumb:filename};
        this.$files.push(record);
        var txt = "";
        for (var i = 0; i < this.$files.length; i++) {
            txt += this.$files[i].path + "\n";
        }
        this.$editor.setValue(txt, 1);
        this.$editor.gotoLine(this.$files.length);
        this.focusedIdx = this.$files.length - 1;
    };

   
}).call(FileHistory.prototype);

exports.FileHistory = FileHistory;
});

(function() {
    window.require(["gtagviewer/filehistory"], function() {});
})();

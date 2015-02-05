define("ace/split",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/lib/event_emitter","ace/editor","ace/virtual_renderer","ace/edit_session"], function(require, exports, module) {
"use strict";

var oop = require("./lib/oop");
var lang = require("./lib/lang");
var EventEmitter = require("./lib/event_emitter").EventEmitter;

var Editor = require("./editor").Editor;
var Renderer = require("./virtual_renderer").VirtualRenderer;
var EditSession = require("./edit_session").EditSession;


var Split = function(container, theme, splits) {
    this.MASKWEST = 0x1;
    this.MASKSOUTH = 0x2;
    this.WEST = 0x0;
    this.CENTER = 0x1;
    this.SOUTH = 0x2;
    this.VFACTOR = 0.6;
    this.HFACTOR = 0.7;
    this.dispmask = 0x0;

    this.$container = container;
    this.$theme = theme;
    this.$splits = 0;
    this.$editorCSS = "";
    this.$editors = [];
    this.$orientation = this.BESIDE;

    this.createSplits(3);
    this.$cEditor = this.$editors[1];


    this.on("focus", function(editor) {
        this.$cEditor = editor;
    }.bind(this));
    
    var el = this.$editors[1].container;
    $(el).resizable({
    handles: "w, s",
    resize: function(event, ui) {
        console.log("dpu:RRR");
        var split = window.env.split;
        split.resize({w: ui.size.width, h: ui.size.height});
           
        event.preventDefault();
        return true;    
    },
    });
};

(function(){

    oop.implement(this, EventEmitter);

    this.$createEditor = function() {
        var el = document.createElement("div");
        el.className = this.$editorCSS;
        el.style.cssText = "position: absolute; top:0px; bottom:0px; border: 1px solid lightgray;";
        this.$container.appendChild(el);

        var editor = new Editor(new Renderer(el, this.$theme));

        editor.on("focus", function() {
            this._emit("focus", editor);
        }.bind(this));
        
        this.$editors.push(editor);
        editor.setFontSize(this.$fontSize);
        return editor;
    };

    this.createSplits = function(splits) {
        var editor;
        if (splits < 1) {
            throw "The number of splits have to be 3!";
        }

        if (splits == this.$splits) {
            return;
        } else if (splits > this.$splits) {
            while (this.$splits < this.$editors.length && this.$splits < splits) {
                editor = this.$editors[this.$splits];
                this.$container.appendChild(editor.container);
                editor.setFontSize(this.$fontSize);
                this.$splits ++;
            }
            while (this.$splits < splits) {
                this.$createEditor();
                this.$splits ++;
            }
        }
        this.resize();
    };
    
    this.showSplits = function(dispmask) {
        this.resize(null, dispmask);
    };
    this.getSplitMask = function() {
        return this.dispmask;
    };
    this.getSplits = function() {
        return this.$splits;
    };
    this.getEditor = function(idx) {
        return this.$editors[idx];
    };
    this.getCurrentEditor = function() {
        return this.$cEditor;
    };
    this.focus = function() {
        this.$cEditor.focus();
    };
    this.blur = function() {
        this.$cEditor.blur();
    };
    this.setTheme = function(theme) {
        this.$editors.forEach(function(editor) {
            editor.setTheme(theme);
        });
    };
    this.setKeyboardHandler = function(keybinding) {
        this.$editors.forEach(function(editor) {
            editor.setKeyboardHandler(keybinding);
        });
    };
    this.forEach = function(callback, scope) {
        this.$editors.forEach(callback, scope);
    };


    this.$fontSize = "";
    this.setFontSize = function(size) {
        this.$fontSize = size;
        this.forEach(function(editor) {
           editor.setFontSize(size);
        });
    };

    this.$cloneSession = function(session) {
        var s = new EditSession(session.getDocument(), session.getMode());

        var undoManager = session.getUndoManager();
        if (undoManager) {
            var undoManagerProxy = new UndoManagerProxy(undoManager, s);
            s.setUndoManager(undoManagerProxy);
        }
        s.$informUndoManager = lang.delayedCall(function() { s.$deltas = []; });
        s.setTabSize(session.getTabSize());
        s.setUseSoftTabs(session.getUseSoftTabs());
        s.setOverwrite(session.getOverwrite());
        s.setBreakpoints(session.getBreakpoints());
        s.setUseWrapMode(session.getUseWrapMode());
        s.setUseWorker(session.getUseWorker());
        s.setWrapLimitRange(session.$wrapLimitRange.min,
                            session.$wrapLimitRange.max);
        s.$foldData = session.$cloneFoldData();

        return s;
    };
    this.setSession = function(session, idx) {
        var editor;
        if (idx == null) {
            editor = this.$cEditor;
        } else {
            editor = this.$editors[idx];
        }
        var isUsed = this.$editors.some(function(editor) {
           return editor.session === session;
        });

        if (isUsed) {
            session = this.$cloneSession(session);
        }
        editor.setSession(session);
        return session;
    };
    this.getOrientation = function() {
        return this.$orientation;
    };
    this.setOrientation = function(orientation) {
        if (this.$orientation == orientation) {
            return;
        }
        this.$orientation = orientation;
        this.resize();
    };
    this.resize = function(sz, dispmask) {
        var width = this.$container.clientWidth;
        var height = this.$container.clientHeight;
        var s1 = sz || {w: width * this.HFACTOR, h: height * this.VFACTOR};
        var mask = dispmask || 0x0;
        mask &= 0x3;
        this.dispmask = mask;
        var layouts = {
            0x0: [
                {t: 0, l: 0, w: width - s1.w, h: s1.h},
                {t: 0, l: width - s1.w, w: s1.w, h: s1.h},
                {t: s1.h, l: 0, w: width, h: height - s1.h},
            ],
            0x1: [
                {t: 0, l: 0, w: 0, h: 0},
                {t: 0, l: 0, w: width, h: s1.h},
                {t: s1.h, l: 0, w: width, h: height - s1.h},
            ],
            0x2: [
                {t: 0, l: 0, w: width - s1.w, h: height},
                {t: 0, l: width - s1.w, w: s1.w, h: height},
                {t: 0, l: 0, w: 0, h: 0},
            ],
            0x3: [
                {t: 0, l: 0, w: 0, h: 0},
                {t: 0, l: 0, w: width, h: height},
                {t: 0, l: 0, w: 0, h: 0},
            ],
        }
        var sizes = layouts[mask];
        var editor;
        for (var i = 0; i < this.$splits; i++) {
            editor = this.$editors[i];
            editor.container.style.top = sizes[i].t + "px";
            editor.container.style.left = sizes[i].l + "px";
            editor.container.style.width = sizes[i].w + "px";
            editor.container.style.height = sizes[i].h + "px";
            editor.container.style.display = (sizes[i].w == 0) ? "none" : "";
            editor.resize();
        }
    };

}).call(Split.prototype);

 
function UndoManagerProxy(undoManager, session) {
    this.$u = undoManager;
    this.$doc = session;
}

(function() {
    this.execute = function(options) {
        this.$u.execute(options);
    };

    this.undo = function() {
        var selectionRange = this.$u.undo(true);
        if (selectionRange) {
            this.$doc.selection.setSelectionRange(selectionRange);
        }
    };

    this.redo = function() {
        var selectionRange = this.$u.redo(true);
        if (selectionRange) {
            this.$doc.selection.setSelectionRange(selectionRange);
        }
    };

    this.reset = function() {
        this.$u.reset();
    };

    this.hasUndo = function() {
        return this.$u.hasUndo();
    };

    this.hasRedo = function() {
        return this.$u.hasRedo();
    };
}).call(UndoManagerProxy.prototype);

exports.Split = Split;
});

define("ace/ext/split",["require","exports","module","ace/split"], function(require, exports, module) {
"use strict";
module.exports = require("../split");

});
                (function() {
                    window.require(["ace/ext/split"], function() {});
                })();
            
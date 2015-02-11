/* copied && modified from ace split.js */
define("gtagviewer/split", function(require, exports, module) {
"use strict";

var oop = require("ace/lib/oop");
var lang = require("ace/lib/lang");
var EventEmitter = require("ace/lib/event_emitter").EventEmitter;

var Editor = require("ace/editor").Editor;
var Renderer = require("ace/virtual_renderer").VirtualRenderer;
var EditSession = require("ace/edit_session").EditSession;

var Split = function(container, theme) {
    this.MASKWEST = 0x1;
    this.MASKSOUTH = 0x2;
    this.MASKEAST = 0x4;
    this.CENTER = 0x0;
    this.WEST = 0x1;
    this.SOUTH = 0x2;
    this.EAST = 0x3;
    this.VFACTOR = 0.8;
    this.HFACTOR = 0.8;
    this.dispmask = 0x0;

    this.$container = container;
    this.$theme = theme;
    this.$splits = 0;
    this.$editorCSS = "";
    this.$editors = [];
    this.deflayout = null
    

    this.createSplits(4);
    this.$cEditor = this.$editors[this.CENTER];


    this.on("focus", function(editor) {
        this.$cEditor = editor;
    }.bind(this));
    
    var el = this.$cEditor.container;
    $(el).resizable({
    handles: "w, s, e",
    resize: function(event, ui) {
        var edge = ui.originalPosition.left != ui.position.left ? 'w' :
                   ui.originalSize.height != ui.size.height ? 's' :
                   ui.originalSize.width != ui.size.width ? 'e' : 'w';
        var split = window.env.split;
        split.resize({w: ui.size.width, h: ui.size.height}, split.getSplitMask(), edge);
           
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
    
    this.hide = function(isHide) {
        this.$container.style.display = isHide ? "none" : "";
    };

    this.showSplits = function(dispmask) {
        this.resize(null, dispmask);
    };
    this.getSplitMask = function() {
        return this.dispmask;
    };

    /**
     * 
     * Returns the number of splits.
     * @returns {Number}
     **/
    this.getSplits = function() {
        return this.$splits;
    };

    /**
     * @param {Number} idx The index of the editor you want
     *
     * Returns the editor identified by the index `idx`.
     *
     **/
    this.getEditor = function(idx) {
        return this.$editors[idx];
    };

    /**
     * 
     * Returns the current editor.
     * @returns {Editor}
     **/
    this.getCurrentEditor = function() {
        return this.$cEditor;
    };

    /** 
     * Focuses the current editor.
     * @related Editor.focus
     **/
    this.focus = function() {
        this.$cEditor.focus();
    };

    /** 
     * Blurs the current editor.
     * @related Editor.blur
     **/
    this.blur = function() {
        this.$cEditor.blur();
    };

    /** 
     * 
     * @param {String} theme The name of the theme to set
     * 
     * Sets a theme for each of the available editors.
     * @related Editor.setTheme
     **/
    this.setTheme = function(theme) {
        this.$editors.forEach(function(editor) {
            editor.setTheme(theme);
        });
    };

    /** 
     * 
     * @param {String} keybinding 
     * 
     * Sets the keyboard handler for the editor.
     * @related editor.setKeyboardHandler
     **/
    this.setKeyboardHandler = function(keybinding) {
        this.$editors.forEach(function(editor) {
            editor.setKeyboardHandler(keybinding);
        });
    };

    /** 
     * 
     * @param {Function} callback A callback function to execute
     * @param {String} scope The default scope for the callback
     * 
     * Executes `callback` on all of the available editors. 
     *
     **/
    this.forEach = function(callback, scope) {
        this.$editors.forEach(callback, scope);
    };


    this.$fontSize = "";
    /** 
     * @param {Number} size The new font size
     * 
     * Sets the font size, in pixels, for all the available editors.
     *
     **/
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

        // Overwrite the default $informUndoManager function such that new delas
        // aren't added to the undo manager from the new and the old session.
        s.$informUndoManager = lang.delayedCall(function() { s.$deltas = []; });

        // Copy over 'settings' from the session.
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

   /** 
     * 
     * @param {EditSession} session The new edit session
     * @param {Number} idx The editor's index you're interested in
     * 
     * Sets a new [[EditSession `EditSession`]] for the indicated editor.
     * @related Editor.setSession
     **/
    this.setSession = function(session, idx) {
        var editor;
        if (idx == null) {
            editor = this.$cEditor;
        } else {
            editor = this.$editors[idx];
        }

        // Check if the session is used already by any of the editors in the
        // split. If it is, we have to clone the session as two editors using
        // the same session can cause terrible side effects (e.g. UndoQueue goes
        // wrong). This also gives the user of Split the possibility to treat
        // each session on each split editor different.
        var isUsed = this.$editors.some(function(editor) {
           return editor.session === session;
        });

        if (isUsed) {
            session = this.$cloneSession(session);
        }
        editor.setSession(session);

        // Return the session set on the editor. This might be a cloned one.
        return session;
    };


   /**  
     * Resizes the editor.
     * 
        +------+--------------------------+
        |      |                   |      |
        |   1  |   0 (resizable)   |  3   |
        |      |        s1         |      |
        |      |                   |      |
        +------+--------------------------+
        |           2                     |
        |                                 |
        +--------------------------+------+
     **/
    this.resize = function(sz, dispmask, edge) {
        var width = this.$container.clientWidth;
        var height = this.$container.clientHeight;
        var reflow = typeof dispmask == "undefined" && typeof sz == "undefined" && typeof edge == "undefined";
        var mask = typeof dispmask == "undefined" ? this.dispmask : dispmask;
        mask &= 0x7;
        this.dispmask = mask;
        if (reflow ||this.deflayout == null) {
            var s1 = {w: width * this.HFACTOR, h: height * this.VFACTOR};
            this.deflayout = [
                    {t: 0, l: (width - s1.w)/2, w: s1.w, h: s1.h},
                    {t: 0, l: 0, w: (width - s1.w)/2, h: s1.h},
                    {t: s1.h, l: 0, w: width, h: height - s1.h},
                    {t: 0, l:(width - s1.w)/2 + s1.w , w: (width - s1.w)/2, h: s1.h},
            ];
        }
        
        if (sz && edge == 'w') {
            var dw = sz.w - this.deflayout[this.CENTER].w;
            this.deflayout[this.WEST].w -= dw;
            this.deflayout[this.CENTER].l = this.deflayout[this.WEST].w;
            this.deflayout[this.CENTER].w = sz.w;
        } else if (sz && edge == 's') {
            var dh = sz.h - this.deflayout[this.CENTER].h;
            this.deflayout[this.WEST].h = this.deflayout[this.EAST].h = this.deflayout[this.CENTER].h = sz.h;
            this.deflayout[this.SOUTH].t = this.deflayout[this.CENTER].t + sz.h;
            this.deflayout[this.SOUTH].h = height - this.deflayout[this.SOUTH].t;
        } else if (sz && edge == 'e') {
            var dw = sz.w - this.deflayout[this.CENTER].w;
            this.deflayout[this.CENTER].w = sz.w;
            this.deflayout[this.EAST].l = this.deflayout[this.CENTER].l + sz.w;
            this.deflayout[this.EAST].w -= dw;
        }

        var sizes = this.deflayout;
        var eWidth = 0;
        var wWidth = 0;
        if (mask & this.MASKWEST) {
            sizes[this.CENTER].l = 0;
            wWidth = 0;
        } else {
            sizes[this.CENTER].l = sizes[this.WEST].l + sizes[this.WEST].w;
            wWidth = sizes[this.WEST].w;
        }
        if (mask & this.MASKSOUTH) {
            sizes[this.CENTER].h = sizes[this.WEST].h = sizes[this.EAST].h = height;
        } else {
            sizes[this.CENTER].h = sizes[this.WEST].h = sizes[this.EAST].h = height - sizes[this.SOUTH].h;
        }
        if (mask & this.MASKEAST) {
            sizes[this.CENTER].w = width - sizes[this.WEST].w;
            eWidth = 0;
        } else {
            eWidth = sizes[this.EAST].w;
        }
        sizes[this.CENTER].w = width - wWidth - eWidth;
        
        this.deflayout = sizes;
        var editor;
        for (var i = 0; i < this.$splits; i++) {
            editor = this.$editors[i];
            if (i == 0 || !(mask & (0x1 << (i-1)))) {
                editor.container.style.top = sizes[i].t + "px";
                editor.container.style.left = sizes[i].l + "px";
                editor.container.style.width = sizes[i].w + "px";
                editor.container.style.height = sizes[i].h + "px";
                editor.container.style.display = "";
            } else {
                editor.container.style.display = "none";
            }
            editor.resize();
        }
    };

}).call(Split.prototype);


exports.Split = Split;
});

(function() {
    window.require(["gtagviewer/split"], function() {});
})();


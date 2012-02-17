// The xn-nav.js

(function(){
  String.prototype.trim = function() {
    return this.replace(/^\s*([\S\s]*?)\s*$/, '$1');
  };
  
  String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
  };
  
  var dbReplacement = {
    "js" : {
      "base-all.js": "http://dl.dropbox.com/u/6824415/xn/base-all.js",
      "home.js": "http://dl.dropbox.com/u/6824415/xn/home.js",
      "home-frame.js": "http://dl.dropbox.com/u/6824415/xn/home-frame.js"
      // "xn.app.webpager.js": "http://s.xnimg.cn/a25243/jspro/xn.app.webpager.js",
      // "xn.jebe.js": "http://jebe.xnimg.cn/18524/xn.jebe.js"
    },
    "css" : {
      "home-all-min.css": "http://dl.dropbox.com/u/6824415/xn/home-all-min.css",
      "home-frame-all-min.css": "http://dl.dropbox.com/u/6824415/xn/home-frame-all-min.css"
    }
  };

  // Replace the link to the JavaScript and CSS files
  // so that will load from Dropbox
  function loadJSAndCSSFromDropbox() {
    var scripts = document.getElementsByTagName("script");
    console.log(scripts.length + " JS files needed");
    var i, length;
    for (var jsFile in dbReplacement.js) {
      length = scripts.length;
      for (i = 0; i < length; i++) {
        var origJSLink = scripts[i].getAttribute("src");
        if (origJSLink) {
          if (origJSLink.indexOf(jsFile) > 0) {
          scripts[i].setAttribute("src", dbReplacement.js[jsFile]);
          break;
          }
        }
      }
    }
    var stylesheets = document.getElementsByTagName("link");
    console.log(stylesheets.length + " CSS files needed");
    for (var cssFile in dbReplacement.css) {
      length = stylesheets.length;
      for (i = 0; i < length; i++) {
        if (stylesheets[i].getAttribute("rel") === "stylesheet") {
          var origCSSLink = stylesheets[i].getAttribute("href");
          if (origCSSLink) {
            if (origCSSLink.indexOf(cssFile) > 0) {
              stylesheets[i].setAttribute("href", dbReplacement.css[cssFile]);
              break;
            }
          }
        }
      }
    }
  }
  
  // loadJSAndCSSFromDropbox();
  // BEGIN XNKeyNav
  function XNKeyNav() {
    this.keyMapping = {
      // Specific news item
      82  /* key r */: 'refreshNewsFeeds', // reply to status/share/photo
      68  /* key d */: 'markAsRead',  // mark this item as read
      13  /* enter */: 'commentItem', // make comment on the item
      // News feeds related
      190 : '.',  // refresh news feeds
      67  /* key c */: 'markAllAsRead',  // mark all as read
      78  /* key n */: 'postNewStatus', // post new status
      // Navigation
      74  /* key j */: 'navDown', // nav: move down
      75  /* key k */: 'navUp', // nav: move up
      27  /* key esc */: 'escKeyHandler', // nav: exit nav
      0   : '!' // placeholder
    };
    
    this.selectionMode = false; // By default no item is selected
    this.selectedItemIndex = 0;
    this.allItems = null;
  }
  
  XNKeyNav.prototype.findPos = function(elem) {
    var curleft = 0, curtop = 0;
    if (elem.offsetParent) {
      do {
        curleft += elem.offsetLeft;
        curtop += elem.offsetTop;
        elem = elem.offsetParent;
      } while (elem);
    }
    return [curleft,curtop];
  };
  
  // A general method for triggering a click event 
  // on the specified element (either a link or button)
  XNKeyNav.prototype.clickOnElem = function(elem, offsetX, offsetY) {
    var elemPos = this.findPos(elem);
    //console.log("The position of the element is [" + elemPos[0] + ", " + elemPos[1] + "]");
    if (document.createEvent) {
      //console.log("Chrome supports createEvent");
      var clickEvent = document.createEvent("MouseEvent");
      clickEvent.initMouseEvent(
        "click",                // type
        true,                  // canBubble
        false,                  // cancelable
        window,                 // view
        1,                      // detail - number of clicks
        elemPos[0] + offsetX,   // screenX
        elemPos[1] + offsetY,   // screenY
        0,                      // clientX
        0,                      // clientY
        false,                  // ctrlKey
        false,                  // altKey
        false,                  // shiftKey
        false,                  // metaKey
        0,                      // button - 0 indicates left button of mouse
        null                    // relatedTarget
      );
      elem.dispatchEvent(clickEvent);
    }
  };
  
  XNKeyNav.prototype.findMarkAllAsReadButtons = function() {
    var dialogs = document.querySelectorAll('#dropmenuHolder .dialog_content');
    //console.log("Found " + dialogs.length + " dialogs in the page");
    for (var i = 0; i < dialogs.length; i++) {
      var dialog = dialogs[i];
      var dialogBody = dialog.querySelectorAll('.dialog_body')[0].innerHTML;
      //console.log("Dialog body: " + dialogBody);
      if (escape(dialogBody) === // 确定将全部新鲜事设置为已读吗?
      '%u786E%u5B9A%u5C06%u5168%u90E8%u65B0%u9C9C%u4E8B%u8BBE%u7F6E%u4E3A%u5DF2%u8BFB%u5417%3F') {
        return dialog.querySelectorAll('.dialog_buttons input[type=button]');
      }
    }
    return [];
  };

  // Blur the focused element, so the target of all events
  // will be the BODY tag
  XNKeyNav.prototype.blurEverything = function() {
    var focusedElem = document.querySelectorAll(':focus')[0];
    // if (focusedElem.getAttribute('value'))
    //   //console.log("Focused element: " + focusedElem.getAttribute('value'));
    // else
    //   //console.log("Focused element: " + focusedElem.innerHTML);
    if (typeof focusedElem !== 'undefined')
      focusedElem.blur();
  };
  
  // Key enter
  XNKeyNav.prototype.commentItem = function() {
    //console.log("Comment on item [" + new Date() + "]");
    if (!this.selectionMode) return;
    var selItem = this.allItems[this.selectedItemIndex];
    var textarea = selItem.querySelectorAll('textarea.input-text')[0];
    if (typeof textarea !== 'undefined') {
      var replies = selItem.querySelectorAll('.replies')[0];
      if (typeof replies !== 'undefined') {
        if (replies.style.display !== 'none') {
          textarea.addEventListener("keyup", function(e) {
            if (e.keyCode == 27) {// Esc
              textarea.blur();
            }
          }, false);
          textarea.focus();
        } else {
          var links = selItem.querySelectorAll('a');
          for (var i = 0; i < links.length; i++) {
            if (links[i].getAttribute('id') &&
                links[i].getAttribute('id').startsWith('replyKey')) {
              this.clickOnElem(links[i], 2, 2);
              break;
            }
          }          
        }
      }
    }
  };
  
  // Key c
  XNKeyNav.prototype.markAllAsRead = function() {
    //console.log("Mark all as read [" + new Date() + "]");
    var btn = document.querySelectorAll('.mark-all-read a')[0];
    if (typeof btn === 'undefined') {
      //console.log("Cannot mark all as read, the button is not there");
      return;
    }
    this.clickOnElem(btn, 2, 2); // an offset of (2px, 2px) for a general link
    var dialogBtns = this.findMarkAllAsReadButtons();
    var blurFunc = this.blurEverything;
    var escBlurFunc = function(e) {
      if (e.keyCode === 27) {
        blurFunc();
      }
    };
    for (var i = 0; i < dialogBtns.length; i++) {
      var dialogBtn = dialogBtns[i];
      dialogBtn.addEventListener('click', blurFunc, false);
      dialogBtn.addEventListener('keyup', escBlurFunc, false);
    }
  };
  
  // Key d
  XNKeyNav.prototype.markAsRead = function() {
    //console.log("Mark one item as read [" + new Date() + "]");
    if (!this.selectionMode) return;
    if (this.allItems.length === 0) return;
    var deleteBtn = this.allItems[this.selectedItemIndex].querySelectorAll('.delete')[0];
    this.clickOnElem(deleteBtn, 2, 2); // a small btn
    this.selectedItemIndex -= 1;
    if (this.selectedItemIndex < 0) this.selectedItemIndex = 0;
    var updateHighlight = function(currentCount, highlightIndex, navigator) {
      //console.log("Trigger updateHighlight at [" + new Date() + "]");
      nowAllItems = document.querySelectorAll('article.a-feed');
      if (nowAllItems.length < currentCount) {
        navigator.allItems = nowAllItems;
        if (navigator.allItems.length > 0) {
          navigator.highlightItem(navigator.selectedItemIndex);
          navigator.scrollToSelectedElem();
        }
      } else {
        window.setTimeout(updateHighlight, 200, currentCount, highlightIndex, navigator);
      }
    };
    updateHighlight(this.allItems.length, this.selectedItemIndex, this);
  };
  
  // Key r
  XNKeyNav.prototype.refreshNewsFeeds = function(e) {
    //console.log("Refresh news feeds [" + new Date() + "]");
    var refreshLink = document.querySelectorAll('#newsfeed-module-box .feed-module .tabview > h3')[0];
    this.clickOnElem(refreshLink, 2, 2); // an offset of (2px, 2px) for a general link
    this.exitSelectionMode();
  };
  
  // Key n
  XNKeyNav.prototype.postNewStatus = function(e) {
    //console.log("Post new status [" + new Date() + "]");
    this.exitSelectionMode();
    newStatusTextarea.focus();
    e.preventDefault();
  };
  
  XNKeyNav.prototype.selectItem = function(item) {
    item.setAttribute("class", item.getAttribute("class") + " xn_nav_selected");
  };
  
  XNKeyNav.prototype.deselectItem = function(item) {
    var itemClass = item.getAttribute("class").replace("xn_nav_selected", "").trim();
    item.setAttribute("class", itemClass);
  };
  
  XNKeyNav.prototype.clearAllHighlights = function() {
    if (this.allItems === null) return;
    for (var i = 0; i < this.allItems.length; i++) {
      this.deselectItem(this.allItems[i]);
    }
  };
  
  XNKeyNav.prototype.highlightItem = function(index) {
    this.clearAllHighlights();
    this.selectItem(this.allItems[index]);
  };
  
  // Enter selection mode
  XNKeyNav.prototype.selectFirstItem = function() {
    if (!this.selectionMode) {
      this.allItems = document.querySelectorAll('article.a-feed');
      this.selectionMode = true;
    }
    this.selectedItemIndex = 0;
    this.highlightItem(0);
  };
  
  // Exit selection mode
  XNKeyNav.prototype.exitSelectionMode = function() {
    this.selectionMode = false;
    this.clearAllHighlights();
    this.selectedItemIndex = 0;
    this.allItems = null;
    this.blurEverything();
    window.scrollTo(0, 0);
  };
  
  // Key Esc
  XNKeyNav.prototype.escKeyHandler = function() {
    this.selectionMode = false;
    this.clearAllHighlights();
    this.blurEverything();
  };
  
  // TODO: determine whether a scroll is needed
  XNKeyNav.prototype.scrollToSelectedElem = function() {
    var elem = this.allItems[this.selectedItemIndex];
    var elemPos = this.findPos(elem);
    window.scrollTo(elemPos[0], elemPos[1] - 200);
  };
  
  // Key j
  XNKeyNav.prototype.navDown = function() {
    //console.log("Nav down [" + new Date() + "]");
    if (this.selectionMode === false) {
      // this.selectFirstItem();
      if (this.allItems === null)
        this.selectFirstItem();
      else {
        this.selectionMode = true;
        this.highlightItem(this.selectedItemIndex);
      }
    } else {
      var nextIndex = this.selectedItemIndex + 1;
      if (nextIndex < this.allItems.length) {
        this.highlightItem(nextIndex);
        this.selectedItemIndex = nextIndex;
      } else if (nextIndex === this.allItems.length) {
        var reloadedAllItems = document.querySelectorAll('article.a-feed');
        if (reloadedAllItems.length > this.allItems.length) {
          this.allItems = reloadedAllItems;
          this.highlightItem(nextIndex);
          this.selectedItemIndex = nextIndex;
        } else {
          var moreFeedsBtn = document.querySelectorAll('.feed-module .more-feed a')[0];
          //console.log(moreFeedsBtn.style.display);
          // if (moreFeedsBtn.style.display) {
          //   this.clickOnElem(moreFeedsBtn, 5, 5); // The more-feeds button is larger :)
          // }
        }
      }
    }
    this.scrollToSelectedElem();
  };
  
  // Key k
  XNKeyNav.prototype.navUp = function() {
    //console.log("Nav up [" + new Date() + "]");
    if (this.selectionMode === false) {
      if (this.allItems === null)
        this.selectFirstItem();
      else {
        this.selectionMode = true;
        this.highlightItem(this.selectedItemIndex);
      }
    } else {
      var nextIndex = this.selectedItemIndex - 1;
      if (nextIndex >= 0) {
        this.highlightItem(nextIndex);
        this.selectedItemIndex = nextIndex;
      } 
    }
    this.scrollToSelectedElem();
  };
  // END XNKeyNav
  
  var newStatusTextarea = document.querySelectorAll('.status-content')[0];
  var keyNav = new XNKeyNav();
  var navHandler = function(e) {
    if (e.target.tagName !== 'BODY') return;
    var keyHandler = keyNav.keyMapping[e.keyCode];
    // if an undefined key is pressed, simply ignore it
    if (typeof keyHandler == 'string') keyNav[keyHandler](e);
    //alert(e.keyCode);
  };
  // Bind to global
  var bodyTag = document.getElementsByTagName('body')[0];
  bodyTag.addEventListener('keyup', navHandler, false);
  // If ESC is pressed, blur the new status textarea
  newStatusTextarea.addEventListener('keyup', function(e){
    if (e.keyCode == 27) {// Esc
      newStatusTextarea.blur();
    }
  }, false);
})();

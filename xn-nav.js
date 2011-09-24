// The xn-nav.js

(function(){
  String.prototype.trim = function() {
    return this.replace(/^\s*([\S\s]*?)\s*$/, '$1');
  };
  
  // BEGIN XNKeyNav
  function XNKeyNav() {
    this.keyMapping = {
      // Specific news item
      82  /* key r */: 'refreshNewsFeeds', // reply to status/share/photo
      67  : 'c',  // close the item
      // News feeds related
      190 : '.',  // refresh news feeds
      101 : 'e', // clear all news feeds
      78  /* key n */: 'postNewStatus', // post new status
      // Navigation
      74  /* key j */: 'navDown', // nav: move down
      75  /* key k */: 'navUp', // nav: move up
      27  /* key esc */: 'exitSelectionMode', // nav: exit nav
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
  
  // Key r
  XNKeyNav.prototype.refreshNewsFeeds = function(e) {
    console.log("Refresh news feeds [" + new Date() + "]");
    var refreshLink = document.querySelectorAll('.reload-feed')[0];
    var linkPos = this.findPos(refreshLink);
    console.log("The position of refresh link is [" + linkPos[0] + ", " + linkPos[1] + "]");
    if (document.createEvent) {
      console.log("Chrome supports createEvent");
      var clickRefresh = document.createEvent("MouseEvent");
      clickRefresh.initMouseEvent(
        "click",          // type
        false,            // canBubble
        false,            // cancelable
        window,           // view
        1,                // detail - number of clicks
        linkPos[0] + 2,   // screenX
        linkPos[1] + 2,   // screenY
        0,                // clientX
        0,                // clientY
        false,            // ctrlKey
        false,            // altKey
        false,            // shiftKey
        false,            // metaKey
        0,                // button - 0 indicates left button of mouse
        null              // relatedTarget
      );
      refreshLink.dispatchEvent(clickRefresh);
      this.exitSelectionMode();
    }
  };
  
  // Key n
  XNKeyNav.prototype.postNewStatus = function(e) {
    console.log("Post new status [" + new Date() + "]");
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
    window.scrollTo(0, 0);
  };
  
  // TODO: determine whether a scroll is needed
  XNKeyNav.prototype.scrollToSelectedElem = function() {
    var elem = this.allItems[this.selectedItemIndex];
    var elemPos = this.findPos(elem);
    window.scrollTo(elemPos[0], elemPos[1] - 200);
  };
  
  // Key j
  XNKeyNav.prototype.navDown = function() {
    console.log("Nav down [" + new Date() + "]");
    if (this.selectionMode === false)
      this.selectFirstItem();
    else {
      var nextIndex = this.selectedItemIndex + 1;
      if (nextIndex < this.allItems.length) {
        this.highlightItem(nextIndex);
        this.selectedItemIndex = nextIndex;
        this.scrollToSelectedElem();
      } 
    }
  };
  
  // Key k
  XNKeyNav.prototype.navUp = function() {
    console.log("Nav up [" + new Date() + "]");
    if (this.selectionMode === false)
      this.selectFirstItem();
    else {
      var nextIndex = this.selectedItemIndex - 1;
      if (nextIndex >= 0) {
        this.highlightItem(nextIndex);
        this.selectedItemIndex = nextIndex;
        this.scrollToSelectedElem();
      } 
    }
  };
  // END XNKeyNav
  
  var newStatusTextarea = document.querySelectorAll('.status-content')[0];
  var keyNav = new XNKeyNav();
  var navHandler = function(e) {
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

//var num_feeds = $('article.a-feed').length;

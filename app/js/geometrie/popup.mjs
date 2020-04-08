
//Copyright: M.Nelson - technische Informatik
//Die Software darf unter den Bedingungen 
//der APGL ( Affero Gnu Public Licence ) genutzt werden

//datei: js/geometrie/popup.js
//================================================================================
'use strict';

import MneText       from '/js/basic/text.mjs'
import MneLog        from '/js/basic/log.mjs'
import MneElement    from '/js/basic/element.mjs'
import MneTheme      from '/js/basic/theme.mjs'
import MneDocEvents  from '/js/basic/docevents.mjs'
import MneFullscreen from '/js/geometrie/fullscreen.mjs'

export class MnePopup
{
  constructor(frame, title, nointeractive = false )
  {
    MneTheme.loadCss('popup.css');

    var self = this;

    this.container = ( typeof frame == 'string' ) ? document.getElementById(frame) : frame;
    this.frame = document.createElement('div');
    this.istouch = ('ontouchstart' in document.documentElement);
    this.noinit = 1;

    if ( nointeractive )
    {
      this.frame.className += 'popup popup_main popup_nointeractive';
      this.frame.innerHTML = '<div id="content" class="popupcontent"></div><div id="resize" class="popupresize"></div>';
    }
    else
    {
      this.frame.className += 'popup popup_main';
      this.frame.innerHTML = '<div id="titlebar" class="popupheader"><span id="closebutton" class="popupbutton"></span><span id="fullscreenbutton" class="popupbutton"></span><span id="reloadbutton" class="popupbutton"></span><span id="titletext" class="popupheadertext"></span></div><div id="content" class="popupcontent"></div><div id="resize" class="popupresize"></div>';

      this.frame.querySelector('#content').appendChild(this.container);
      this.frame.querySelector('#reloadbutton').onclick = (evt) => { self.reload() };
      this.frame.querySelector('#closebutton').onclick = (evt) => { self.close() };
      ( this.fullscreenbutton = this.frame.querySelector('#fullscreenbutton')).onclick = (evt) => { self.fullscreen() };

      if ( this.istouch )
      {
        this.frame.querySelector('#resize').addEventListener   ('touchstart', (evt) => { self.startresize(evt) }, false);
        this.frame.querySelector('#titlebar').addEventListener ('touchstart', (evt) => { self.startmove(evt) } , false);
        this.frame.querySelector('#titletext').addEventListener('touchstart', (evt) => { self.startmove(evt) } , false);

        this.tmove = (evt) => { return self.touchmove(evt) };
        this.tend  = (evt) => { return self.toucheend(evt) };
      }
      else
      {
        this.frame.querySelector('#resize').addEventListener   ('mousedown', (evt) => { self.startresize(evt) }, false);
        this.frame.querySelector('#titlebar').addEventListener ('mousedown', (evt) => { self.startmove(evt) }, false);

        this.frame.querySelector('#titletext').addEventListener('mousedown', (evt) => { self.startmove(evt) }, false);
        this.frame.querySelector('#titlebar').addEventListener('click',      (evt) => { self.click(evt) }, false);
        this.frame.querySelector('#titlebar').addEventListener('dblclick',   (evt) => { self.dblclick(evt) }, false);
        this.frame.querySelector('#titletext').innerHTML = title;
      }
    }
    document.body.appendChild(this.frame);
    
    this.observer = new MutationObserver(() =>
    {
      var td = document.body.offsetHeight - this.frame.scrollHeight - this.frame.offsetTop;
      if ( td < 0 )
        this.frame.style.top = (parseInt(this.frame.style.top) + td) + "px";

      var ld = document.body.offsetWidth - this.frame.scrollWidth - this.frame.offsetLeft;
      if ( ld < 0 )
        this.frame.style.left = (parseInt(this.frame.style.left) + ld) + "px";
        

    });
    this.observer.observe(this.container, { childList: true, subtree: true, attributes : true, characterData : true } );

  }
  
  async setTitle(title)
  {
    this.frame.querySelector('#titletext').innerHTML = title;
  }
  
  async show()
  {
    if ( ! MneElement.hasClass(this.frame, "display") )
    {
      MneElement.mkClass(this.frame, "display");
      this.frame.style.zIndex = MnePopup.zindex++;
      this.repos();
    }
  }
  
  async reload()
  {
    console.error('MnePopup kein reload definiert');
  }

}

MnePopup.zindex = 10000;

MnePopup.prototype.repos = function()
{
    var wm = document.body.offsetWidth;
    var ws = this.frame.scrollWidth;

    var hm = document.body.offsetHeight;
    var hs = this.frame.scrollHeight;

    this.frame.style.left = ((( wm - ws ) / 2 ) + document.body.parentNode.scrollLeft + document.body.scrollLeft ) + "px";
    this.frame.style.top = ((( hm - hs ) / 2 ) +  document.body.parentNode.scrollTop + document.body.scrollTop ) + "px";
}

MnePopup.prototype.close = function()
{
  if ( MneFullscreen.isfullscreen(this.fullscreenbutton) )  
    MneFullscreen.fullscreen(this.fullscreenbutton, this.frame)

    MneElement.clearClass(this.frame, "display");
}

MnePopup.prototype.fullscreen = function()
{
  MneFullscreen.fullscreen(this.fullscreenbutton, this.frame)
}

MnePopup.prototype.click = function(evt)
{
  this.frame.style.zIndex = MnePopup.zindex++;
}

MnePopup.prototype.dblclick = function(evt)
{
  MneElement.clearClass(this.frame, 'popupisresize' );
  this.frame.style.width = this.frame.style.height = 'auto';

  var td = document.body.offsetHeight - this.frame.scrollHeight - this.frame.offsetTop;
  if ( td < 0 )
    this.frame.style.top = (parseInt(this.frame.style.top) + td) + "px";

  var ld = document.body.offsetWidth - this.frame.scrollWidth - this.frame.offsetLeft;
  if ( ld < 0 )
    this.frame.style.left = (parseInt(this.frame.style.left) + ld) + "px";

}

MnePopup.prototype.startmouse = function(evt)
{
  this.frame.style.zIndex = MnePopup.zindex++;
  if ( this.istouch )
  {
    this.addEventListener('touchmove', this.tmove, false);
    this.addEventListener('touchend',  this.tend,  false);
  }
  else
  {
    MneDocEvents.addInterest('mousemove', this );
    MneDocEvents.addInterest('mouseup', this );
  }
}

MnePopup.prototype.startmove = function(evt)
{
  if ( evt.targetTouches )
  {
    e.preventDefault();
    evt = evt.targetTouches[0];
  }

  this.posx = this.frame.offsetLeft - evt.clientX;
  this.posy = this.frame.offsetTop - evt.clientY;
  this.posw = MneElement.getWidth(this.frame);
  this.posh = MneElement.getHeight(this.frame);

  this.mousemovetype = 'move';
  this.startmouse(evt);
}

MnePopup.prototype.startresize = function(evt)
{
  if ( evt.targetTouches )
  {
    e.preventDefault();
    evt = evt.targetTouches[0];
  }

  this.posx = this.frame.offsetWidth - evt.clientX;
  this.posy = this.frame.offsetHeight - evt.clientY;
  this.post = MneElement.getTop(this.frame);
  this.posl = MneElement.getLeft(this.frame);

  this.mousemovetype = 'resize';
  this.startmouse(evt);
}

MnePopup.prototype.touchmove = function(evt)
{
  MnePopup.prototype.mousemove.call(this, evt.targetTouches[0]);
};

MnePopup.prototype.mousemove = function(evt)
{
  var x,y;
  x = evt.clientX  + this.posx;
  y = evt.clientY  + this.posy;

  switch ( this.mousemovetype )
  {
    case "move" :

      if ( x < 0 ) x = 0;
      if ( y < 0 ) y = 0;

      if ( x + this.posw > document.body.scrollWidth )  x = document.body.scrollWidth  - this.posw;
      if ( y + this.posh > document.body.scrollHeight ) y = document.body.scrollHeight - this.posh;

      this.frame.style.left = x + "px";
      this.frame.style.top  = y + "px";
      break;

    case "resize" : 
      if ( x < 50 ) x = 50;
      if ( y < 50 ) y = 50;
      if ( x + this.posl > document.body.scrolltWidth - 10 ) x = document.body.scrollWidth  - this.posl - 10;
      if ( y + this.post > document.body.scrollHeight -10 )  y = document.body.scrollHeight - this.post - 10;

      this.frame.style.width   = x + "px";
      this.frame.style.height  = y + "px";

      MneElement.mkClass(this.frame, 'popupisresize' );
      break;
  }
  return true;
};

MnePopup.prototype.mouseup = function(evt)
{
  MneDocEvents.removeInterest('mousemove', this );
  MneDocEvents.removeInterest('mouseup', this );

  return true;
}

MnePopup.prototype.touchend = function(evt)
{
  evt.targetTouches[0].target.removeEventListener('touchmove', this.move, false);
  evt.targetTouches[0].target.removeEventListener('touchend',  this.tend,  false);

  return true;
}


export default MnePopup

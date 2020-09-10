//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/geometrie/popup.mjs
//================================================================================
'use strict';

import MneText       from '/js/basic/text.mjs'
import MneLog        from '/js/basic/log.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneTheme      from '/js/basic/theme.mjs'
import MneFullscreen from '/js/geometrie/fullscreen.mjs'

export class MnePopupFrame
{
  constructor(frame, title, nointeractive = false, parent )
  {
    MneTheme.loadCss('popup.css');

    var self = this;

    this.container = ( typeof frame == 'string' ) ? document.getElementById(frame) : frame;
    this.frame = document.createElement('div');
    this.istouch = ('ontouchstart' in document.documentElement);
    this.noinit = 1;
    this.nointeractive = nointeractive

    if ( nointeractive )
    {
      this.frame.className += 'popup popup_main popup_nointeractive';
      this.frame.innerHTML = '<div id="content" class="popupcontent noframe"></div>';
      this.frame.querySelector('#content').appendChild(this.container);
    }
    else
    {
      this.frame.className += 'popup popup_main';
      this.frame.innerHTML = '<div id="titlebar" class="popupheader"><span id="closebutton" class="popupbutton"></span><span id="fullscreenbutton" class="popupbutton"></span><span id="reloadbutton" class="popupbutton"></span><span id="querybutton" class="popupbutton"></span><span id="titletext" class="popupheadertext"></span></div><div id="content" class="popupcontent"></div><div id="resize" class="popupresize"></div>';

      this.frame.querySelector('#content').appendChild(this.container);
      this.frame.querySelector('#querybutton').onclick = (evt) => { self.query() };
      this.frame.querySelector('#reloadbutton').onclick = (evt) => { self.reload() };
      this.frame.querySelector('#closebutton').onclick = (evt) => { self.close() };
      ( this.fullscreenbutton = this.frame.querySelector('#fullscreenbutton')).onclick = (evt) => { self.fullscreen() };

      if ( this.istouch )
      {
        this.frame.querySelector('#resize').addEventListener   ('touchstart', (evt) => { self.startresize(evt) }, false);
        this.frame.querySelector('#titlebar').addEventListener ('touchstart', (evt) => { self.startmove(evt) } , false);
        this.frame.querySelector('#titletext').addEventListener('touchstart', (evt) => { self.startmove(evt) } , false);

        this.tmove = (evt) => { return self.touchmove(evt) };
        this.tend  = (evt) => { return self.touchend(evt) };
      }
      else
      {
        this.frame.querySelector('#resize').addEventListener   ('mousedown', (evt) => { self.startresize(evt) }, false);
        this.frame.querySelector('#titlebar').addEventListener ('mousedown', (evt) => { self.startmove(evt) }, false);

        this.frame.querySelector('#titletext').addEventListener('mousedown', (evt) => { self.startmove(evt) }, false);
        this.frame.querySelector('#titlebar').addEventListener('click',      (evt) => { self.click(evt) }, false);
        this.frame.querySelector('#titlebar').addEventListener('dblclick',   (evt) => { self.dblclick(evt) }, false);
        this.frame.querySelector('#titletext').innerHTML = title;

        this.mmove = (evt) => { return self.mousemove(evt) };
        this.mend  = (evt) => { return self.mouseup(evt)   };
      }

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
    (( parent != undefined ) ? parent : document.body).appendChild(this.frame);

  }

  async setTitle(title)
  {
    try { this.frame.querySelector('#titletext').innerHTML = title; } catch(e) {};
  }

  get visible ()
  {
    return MneElement.hasClass(this.frame, "display");
  }

  async show()
  {
    if ( ! this.visible )
    {
      MneElement.mkClass(this.frame, "display");
      this.repos();
    }
    this.frame.style.zIndex = MnePopupFrame.zindex++;
  }

  async reload()
  {
    console.error('MnePopupFrame kein reload definiert');
  }

  async query()
  {
    console.error('MnePopupFrame kein query definiert');
  }

  repos ()
  {
    if ( this.nointeractive ) return;

    var wm = document.body.offsetWidth;
    var ws = this.frame.scrollWidth;

    var hm = document.body.offsetHeight;
    var hs = this.frame.scrollHeight;

    this.frame.style.left = ((( wm - ws ) / 2 ) + document.body.parentNode.scrollLeft + document.body.scrollLeft ) + "px";
    this.frame.style.top = ((( hm - hs ) / 2 ) +  document.body.parentNode.scrollTop + document.body.scrollTop ) + "px";
  }

  close ()
  {
    if ( MneFullscreen.isfullscreen(this.fullscreenbutton) )  
      MneFullscreen.fullscreen(this.fullscreenbutton, this.frame)

      MneElement.clearClass(this.frame, "display");
  }

  fullscreen ()
  {
    MneFullscreen.fullscreen(this.fullscreenbutton, this.frame)
  }

  click (evt)
  {
    this.frame.style.zIndex = MnePopupFrame.zindex++;
  }

  dblclick (evt)
  {
    MneElement.clearClass(this.frame, 'popupisresize' );
    MneElement.clearClass(this.frame, 'popupdoresize' );
    this.frame.style.width = this.frame.style.height = 'auto';

    var td = document.body.offsetHeight - this.frame.scrollHeight - this.frame.offsetTop;
    if ( td < 0 )
      this.frame.style.top = (parseInt(this.frame.style.top) + td) + "px";

    var ld = document.body.offsetWidth - this.frame.scrollWidth - this.frame.offsetLeft;
    if ( ld < 0 )
      this.frame.style.left = (parseInt(this.frame.style.left) + ld) + "px";

  }

  startmouse (evt)
  {
    this.frame.style.zIndex = MnePopupFrame.zindex++;
    if ( this.istouch )
    {
      document.addEventListener('touchmove', this.tmove, false);
      document.addEventListener('touchend',  this.tend,  false);
    }
    else
    {
      document.addEventListener('mousemove', this.mmove );
      document.addEventListener('mouseup',   this.mend  );
    }
  }

  startmove (evt)
  {
    if ( evt.targetTouches )
    {
      evt.preventDefault();
      evt = evt.targetTouches[0];
    }

    this.posx = this.frame.offsetLeft - evt.clientX;
    this.posy = this.frame.offsetTop - evt.clientY;
    this.posw = MneElement.getWidth(this.frame);
    this.posh = MneElement.getHeight(this.frame);

    this.mousemovetype = 'move';
    this.startmouse(evt);
  }

  startresize (evt)
  {
    if ( evt.targetTouches )
    {
      evt.preventDefault();
      evt = evt.targetTouches[0];
    }

    this.posx = this.frame.offsetWidth - evt.clientX;
    this.posy = this.frame.offsetHeight - evt.clientY;
    this.post = MneElement.getTop(this.frame);
    this.posl = MneElement.getLeft(this.frame);

    this.mousemovetype = 'resize';
    this.startmouse(evt);
  }

  touchmove (evt)
  {
    this.mousemove(evt.targetTouches[0]);
  };

  mousemove (evt)
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

        MneElement.mkClass(this.frame, 'popupdoresize' );
        MneElement.mkClass(this.frame, 'popupisresize' );
        break;
    }
    return true;
  };

  mouseup (evt)
  {
    document.removeEventListener('mousemove', this.mmove );
    document.removeEventListener('mouseup',   this.mend  );

    MneElement.clearClass(this.frame, 'popupdoresize' );
    return true;
  }

  touchend (evt)
  {
    document.removeEventListener('touchmove', this.tmove, false);
    document.removeEventListener('touchend',  this.tend,  false);

    return true;
  }

}

MnePopupFrame.zindex = 10000
export default MnePopupFrame

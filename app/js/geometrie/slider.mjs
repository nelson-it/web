// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: js/geometrie/slider.mjs
//================================================================================
'use strict';

import MneDocEvents from '/js/basic/docevents.mjs'
import MneElement   from '/js/basic/element.mjs'
import MneTheme     from '/js/basic/theme.mjs'

class MneSlider
{
  constructor(frame, direction, pos, typ )
  {
    var self = this;
    
    MneTheme.loadCss('slider.css');
    
    this.frame = ( typeof frame == 'string' ) ? document.getElementById(frame) : frame;
    this.typ = ( typ ) ? typ : "move";
    
    this.num = MneSlider.slidercount
    this.istouch = ('ontouchstart' in document.documentElement);
    
    this.tmove = function(evt) { return self.touchmove(evt); };
    this.tend  = function(evt) { return self.touchend(evt);  };
    
    MneElement.mkClass(this.frame, 'slider' + direction, true)
    MneElement.mkClass(this.frame, 'slider' + this.typ,  true)

    this.frame.innerHTML = '<div class="sliderframe sliderframe0"><div></div><div id="slider' + this.num + '"></div></div><div class="sliderframe sliderframe1"><div></div></div>';

    this.slider = this.frame.firstChild.lastChild;
    this.frame0 = this.frame.firstChild
    this.frame1 = this.frame.lastChild
    
    this.container0 = this.frame0.firstChild;
    this.container1 = this.frame1.firstChild;

    if ( this.typ == 'move' )
    {
      if ( this.istouch )
      {
        this.slider.addEventListener ('touchstart', (evt) => { self.starttouch(evt) }, false);
        this.frame0.addEventListener ('touchstart', (evt) => { self.starttouch(evt) }, false);
        this.frame1.addEventListener ('touchstart', (evt) => { self.starttouch(evt) }, false);
      }
      else
      {
        this.slider.addEventListener('mousedown', (evt) => { self.startmove(evt) }, false);
      }
    }

    if( pos == 'auto' )
    {
      this.container0.appendChild(document.createElement("div"));
      this.container0 = this.container0.firstChild;
      this.container0.style.position = "absolute";
    }

  }
}
MneSlider.slidercount = 0;
MneSlider.minVal = 10;

MneSlider.prototype.reset = function()
{
}

MneSlider.prototype.updatePosition = function(evt)
{
}

export class MneVSlider extends MneSlider
{
  constructor( frame, pos, typ )
  {
    super(frame, 'V', pos, typ);

    this.frame0.style['width'] = ( pos == 'auto' ) ? '10px' : pos;
    this.frame1.style['left']  = ( pos == 'auto' ) ? '10px' : pos;

    if( pos == 'auto' )
    {
      var self = this;
      this.checksize = function()
      {
        var size = ( this.container0['scrollWidth'] > this.container0['offsetWidth'] ) ?  this.container0['scrollWidth'] : this.container0['offsetWidth']
        if ( size != this.autosize )
        {
          this.autosize = size;
          size = size + this.frame0.offsetWidth - this.container0.parentNode.offsetWidth;
          this.frame0.style['width'] = size + "px";
          this.frame1.style['left'] = size + "px";
          window.setTimeout(function() { self.checksize(); }, 100);
        }
      }

      this.observer = new MutationObserver(function(mutations, server) { window.setTimeout( () => { self.checksize() }, 0); });
      this.observer.observe(this.container0, { attributes: true, childList: true, characterData: true, subtree : true });
    }
  }
}

MneVSlider.prototype.startmove = function(evt)
{
  this.slider.posx = this.slider.offsetLeft - evt.clientX;
  this.slider.startx = evt.clientX;

  MneElement.mkClass(this.slider, 'slideractive', true);

  MneDocEvents.addInterest('mousemove', this );
  MneDocEvents.addInterest('mouseup', this );
};

MneVSlider.prototype.starttouch = function(evt)
{
  this.slider.dist = false;
  var dist = evt.targetTouches[0].clientX - MneElement.getLeft(this.slider, document.body);
  
  if ( dist < -16 || dist > 16 )
    return;
  else
    this.slider.dist = true;

  evt.preventDefault();

  this.slider.posx = this.slider.offsetLeft - evt.targetTouches[0].clientX;
  this.slider.startx = evt.targetTouches[0].clientX;

  MneElement.mkClass(this.slider, 'slideractive', true);
  
  evt.targetTouches[0].target.addEventListener('touchmove', this.tmove, false);
  evt.targetTouches[0].target.addEventListener('touchend',  this.tend,  false);
};

MneVSlider.prototype.mousemove = function(evt)
{
  var val = evt.clientX  + this.slider.posx;

  if ( val < MneSlider.minVal ) val = MneSlider.minVal;
  if ( val > MneElement.getWidth(this.frame) - MneSlider.minVal ) val = MneElement.getWidth(this.frame) - MneSlider.minVal;
  
  this.frame0.style['width'] = val + "px";
  this.frame1.style['left'] = val + "px";
}

MneVSlider.prototype.touchmove = function(evt)
{
  if ( this.slider.dist )
  {
    evt.preventDefault();
    var val = evt.targetTouches[0].clientX  + this.slider.posx;

    if ( val < MneSlider.minVal ) val = MneSlider.minVal;
    if ( val > MneElement.getWidth(this.frame) - MneSlider.minVal ) val = MneElement.getWidth(this.frame) - MneSlider.minVal;

    this.frame0.style['width'] = val + "px";
    this.frame1.style['left'] = val + "px";
  }
}

MneVSlider.prototype.mouseup = function(evt)
{
  MneDocEvents.removeInterest('mousemove', this );
  MneDocEvents.removeInterest('mouseup', this );

  MneElement.mkClass(this.slider, 'slideractive', false);

  this.updatePosition();
  
  return true;
}

MneVSlider.prototype.touchend = function(evt)
{
  MneElement.mkClass(this.slider, 'slideractive', false);

  evt.targetTouches[0].target.removeEventListener('touchmove', this.move, false);
  evt.targetTouches[0].target.removeEventListener('touchend',  this.tend,  false);

  this.updatePosition();
  
  return true;
}

export class MneHSlider extends MneSlider
{
  constructor( frame, pos, typ )
  {
    super(frame, 'H', pos, typ);

    var self = this;
    this.frame0.style['height'] = ( pos == 'auto' ) ? '10px' : pos;
    this.frame1.style['top']    = ( pos == 'auto' ) ? '10px' : pos;

    if( pos == 'auto' )
    {
      this.checksize = function()
      {
        var size = ( this.container0['scrollHeight'] > this.container0['offsetHeight'] ) ?  this.container0['scrollHeight'] : this.container0['offsetHeight']
        if ( size != this.autosize )
        {
          this.autosize = size;
          size = size + this.frame0.offsetWidth - this.container0.parentNode.offsetWidth;
          this.frame0.style['height'] = size + "px";
          this.frame1.style['top'] = size + "px";
          window.setInterval(function() { self.checksize(); }, 500);
        }
      }

      this.observer = new MutationObserver(function(mutations, server) { window.setTimeout( () => { self.checksize() }, 0); });
      this.observer.observe(this.container0, { attributes: true, childList: true, characterData: true, subtree : true });
    }
  }
}

MneHSlider.prototype.startmove = function(evt)
{
  this.slider.posy = this.slider.offsetTop - evt.clientY;
  this.slider.starty = evt.clientY;

  MneElement.mkClass(this.slider, 'slideractive', true);

  MneDocEvents.addInterest('mousemove', this );
  MneDocEvents.addInterest('mouseup', this );
};

MneVSlider.prototype.starttouch = function(evt)
{
  this.slider.dist = false;
  var dist = evt.targetTouches[0].clientY - MneElement.getTop(this.slider, document.body);
  
  if ( dist < -16 || dist > 16 )
    return;
  else
    this.slider.dist = true;

  evt.preventDefault();

  this.slider.posy = this.slider.offsetTop - evt.targetTouches[0].clientY;
  this.slider.starty = evt.targetTouches[0].clientY;

  MneElement.mkClass(this.slider, 'slideractive', true);
  
  evt.targetTouches[0].target.addEventListener('touchmove', this.tmove, false);
  evt.targetTouches[0].target.addEventListener('touchend',  this.tend,  false);
};

MneHSlider.prototype.mousemove = function(evt)
{
  var val = evt.clientY  + this.slider.posy;

  if ( val < MneSlider.minVal ) val = MneSlider.minVal;
  if ( val > MneElement.getHeight(this.frame) - MneSlider.minVal ) val = MneElement.getHeight(this.frame) - MneSlider.minVal;
  
  this.frame0.style['height'] = val + "px";
  this.frame1.style['top'] = val + "px";
}

MneHSlider.prototype.touchmove = function(evt)
{
  if ( this.slider.dist )
  {
    evt.preventDefault();
    var val = evt.targetTouches[0].clientY  + this.slider.posy;

    if ( val < MneSlider.minVal ) val = MneSlider.minVal;
    if ( val > MneElement.getHeight(this.frame) - MneSlider.minVal ) val = MneElement.getHeight(this.frame) - MneSlider.minVal;

    this.frame0.style['height'] = val + "px";
    this.frame1.style['top'] = val + "px";
  }
}

MneHSlider.prototype.mouseup = function(evt)
{
  MneDocEvents.removeInterest('mousemove', this );
  MneDocEvents.removeInterest('mouseup', this );

  MneElement.mkClass(this.slider, 'slideractive', false);

  this.updatePosition();
  
  return true;
}

MneHSlider.prototype.touchend = function(evt)
{
  MneElement.mkClass(this.slider, 'slideractive', false);

  evt.targetTouches[0].target.removeEventListener('touchmove', this.move, false);
  evt.targetTouches[0].target.removeEventListener('touchend',  this.tend,  false);

  this.updatePosition();
  
  return true;
}

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/framebutton.mjs
//================================================================================
'use strict';

import MneTheme   from '/js/basic/theme.mjs'
import MneRequest from '/js/basic/request.mjs'

import MneElement from '/weblet/basic/element.mjs'
import MneWeblet  from '/weblet/basic/view.mjs'

class MneFrameButtonWeblet extends MneWeblet
{
  constructor(parent, frame, id, initpar, config  )
  {
    super(parent, frame, id, initpar, config  )
    this.num = MneFrameButtonWeblet.num++;
  }
  
  getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  async load()
  {
    var self = this;
    await super.load();
    
    this.obj.styles.push( MneTheme.createStyle());

    this.frame.innerHTML = '<div class="framebutton-button"> </div>'
    this.frame.firstChild.addEventListener('click', () => { self.openclose(); } );
    
    MneElement.mkClass(this.initpar.frame, 'framebutton-frame');
    
    this.obj.observer.menubutton = new MutationObserver((mut) => 
    {
      var width,left
      width = left = self.initpar.frame.firstChild.offsetWidth;

      self.deleteRules();
      self.insertRule("@keyframes framebuttonresizel" + self.num + ' { 0% { width : ' + width + 'px;} 100% { width: 0px; }}');
      self.insertRule("@keyframes framebuttonresizer" + self.num + ' { 0% { left : ' + left + 'px;}    100% { left: 0px;}}');

      self.insertRule(".framebuttonclose" + self.num + ' > div:first-child {  animation-name: framebuttonresizel' + self.num + ';  width: 0px; }');
      self.insertRule(".framebuttonclose" + self.num + ' > div:last-child  {  animation-name: framebuttonresizer' + self.num + ';  left:  0px; }');


      self.insertRule(".framebuttonshow" + self.num + ' > div:first-child {  animation-direction: reverse; animation-name: framebuttonresizel' + self.num + ';  width: ' + width + 'px;}');
      self.insertRule(".framebuttonshow" + self.num + ' > div:last-child  {  animation-direction: reverse; animation-name: framebuttonresizer' + self.num + ';  left: '  + left + 'px; }');

    });
    this.obj.observer.menubutton.observe(this.initpar.frame.firstChild, { attributes : true, aattributeFilter: [ 'style' ] } );
    
    this.initpar.frame.firstChild.addEventListener("animationend",   (evt) => { self.animationend(evt) },   false);
    


  }
  
  insertRule(str, pos)
  {
    MneTheme.insertRule(this.obj.styles[0], str, pos)
  }

  deleteRule(pos)
  {
    MneTheme.deleteRule(this.obj.styles[0], pos)
  }

  deleteRules()
  {
    MneTheme.deleteRules(this.obj.styles[0])
  }
  
  animationend(evt)
  {
    if ( MneElement.hasClass(this.initpar.frame, 'framebuttonclose' + this.num) )
      MneElement.mkClass(this.initpar.frame, 'framebuttonhide', true, 'framebuttonclose' + this.num);
    else
       MneElement.mkClass(this.initpar.frame, 'framebuttonshow' + this.num, false, 'framebuttonclose' + this.num );
  }

  async openclose()
  {
    if ( MneElement.hasClass(this.initpar.frame, 'framebuttonhide' ) )
      MneElement.mkClass(this.initpar.frame, 'framebuttonshow' + this.num, true, 'framebuttonhide' );
    else
      MneElement.mkClass(this.initpar.frame, 'framebuttonclose' + this.num, true, 'framebuttonshow' + this.num );
  }
}
MneFrameButtonWeblet.num = 0;

export default MneFrameButtonWeblet

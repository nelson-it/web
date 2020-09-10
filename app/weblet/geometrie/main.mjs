//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/geometrie/main.mjs
//================================================================================
'use strict';
import { MneVSlider, MneHSlider }  from '/js/geometrie/slider.mjs'
import MneElement from '/weblet/basic/element.mjs'

class MneTemplateMain
{
  static mkTemplate( weblet )
  {
    weblet.obj.container = {};
    weblet.obj.slider = {};
    
    var s0 = weblet.obj.slider.s0 = new MneHSlider(weblet.frame, 'auto', "fix");
    var s1 = weblet.obj.slider.s1 = new MneVSlider( s0.container1, 'auto', "fix");
    
    s0.container0.innerHTML = '<div id="mainrow"><div id="mainleft"></div><div id="mainright"></div></div>'
    MneElement.mkClass(s0.container0, 'maintop');

    weblet.obj.container['count']      = s0.container0.querySelector('#mainright');
    weblet.obj.container['menubutton'] = s0.container0.querySelector('#mainleft');
    weblet.obj.container['menumain']   = s1.container0
    weblet.obj.container['detail']     = s1.container1
  }
}

export default MneTemplateMain

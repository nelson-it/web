//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/geometrie/hh_hh.mjs
//================================================================================
'use strict';
import { MneVSlider, MneHSlider }  from '/js/geometrie/slider.mjs'
import MneElement from '/weblet/basic/element.mjs'

class MneTemplateHH_HH
{
  static mkTemplate( weblet, slider )
  {
    weblet.obj.container = {};
    weblet.obj.slider = {};

    var s0 = weblet.obj.slider.s0 = new MneHSlider(weblet.frame, (slider['s0'] ) ? slider['s0'] : '50%', 'move');
    var s1 = weblet.obj.slider.s1 = new MneVSlider(s0.container0, (slider['s1'] ) ? slider['s1'] : (( weblet.frame.offsetWidth > 1200 ) ? '300px' : '25%'), 'move');
    var s2 = weblet.obj.slider.s2 = new MneVSlider(s0.container1, (slider['s2'] ) ? slider['s2'] : (( weblet.frame.offsetWidth > 1200 ) ? '300px' : '25%'), 'move');

    weblet.obj.container['selection1']  = s1.container0
    weblet.obj.container['detail1']     = s1.container1
    weblet.obj.container['selection2']  = s2.container0
    weblet.obj.container['detail2']     = s2.container1
  }
}

export default MneTemplateHH_HH

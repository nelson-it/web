//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/geometrie/h_hhh.mjs
//================================================================================
'use strict';
import { MneVSlider, MneHSlider }  from '/js/geometrie/slider.mjs'
import MneElement from '/weblet/basic/element.mjs'

class MneTemplateT_HHH
{
  static mkTemplate( weblet, slider )
  {
    weblet.obj.container = {};
    weblet.obj.slider = {};

    var s0 = weblet.obj.slider.s0 = new MneVSlider(weblet.frame, (slider['s0'] ) ? slider['s0'] : (( weblet.frame.offsetWidth > 1200 ) ? '300px' : '25%'), 'move');
    var s1 = weblet.obj.slider.s1 = new MneHSlider(s0.container1, (slider['s1'] ) ? slider['s1'] : '33%', 'move');
    var s2 = weblet.obj.slider.s2 = new MneHSlider(s1.container1, (slider['s2'] ) ? slider['s2'] : '50%', 'move');

    weblet.obj.container['selection']      = s0.container0
    weblet.obj.container['detail']         = s1.container0
    weblet.obj.container['middle']         = s2.container0
    weblet.obj.container['bottom']         = s2.container1
  }
}

export default MneTemplateT_HHH

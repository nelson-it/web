//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/geometrie/t_hh.mjs
//================================================================================
'use strict';
import { MneVSlider, MneHSlider }  from '/js/geometrie/slider.mjs'
import MneElement from '/weblet/basic/element.mjs'

class MneTemplateT_HH
{
  static mkTemplate( weblet, slider )
  {
    weblet.obj.container = {};
    weblet.obj.slider = {};

    var s0 = weblet.obj.slider.s0 = new MneHSlider(weblet.frame, 'auto', 'fix');
    var s1 = weblet.obj.slider.s1 = new MneVSlider(s0.container1, (slider['s1'] ) ? slider['s1'] : (( weblet.frame.offsetWidth > 1200 ) ? '300px' : '25%'), 'move');
    var s2 = weblet.obj.slider.s2 = new MneHSlider(s1.container1, (slider['s2'] ) ? slider['s2'] : '50%', 'move');

    weblet.obj.container['selectionmenu']  = s0.container0
    weblet.obj.container['selection']      = s1.container0
    weblet.obj.container['detail']         = s2.container0
    weblet.obj.container['bottom']         = s2.container1
  }
}

export default MneTemplateT_HH

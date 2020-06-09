//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/template/h_hh.mjs
//================================================================================
'use strict';
import { MneVSlider, MneHSlider }  from '/js/geometrie/slider.mjs'
import MneElement                  from '/js/basic/element.mjs'

class MneTemplateT_HH
{
  static mkTemplate( weblet, slider )
  {
    weblet.obj.container = {};
    weblet.obj.slider = {};

    var s0 = weblet.obj.slider.s0 = new MneVSlider(weblet.frame, (slider['s0'] ) ? slider['s0'] : (( weblet.frame.offsetWidth > 1200 ) ? '300px' : '25%'), 'move');
    var s1 = weblet.obj.slider.s1 = new MneHSlider(s0.container1, (slider['s1'] ) ? slider['s1'] : '50%', 'move');

    weblet.obj.container['selection']      = s0.container0
    weblet.obj.container['detail']         = s1.container0
    weblet.obj.container['bottom']         = s1.container1
  }
}

export default MneTemplateT_HH

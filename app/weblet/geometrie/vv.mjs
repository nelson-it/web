//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/template/hh.mjs
//================================================================================
'use strict';
import { MneVSlider, MneHSlider }  from '/js/geometrie/slider.mjs'
import MneElement                  from '/js/basic/element.mjs'

class MneTemplateHH
{
  static mkTemplate( weblet, slider )
  {
    weblet.obj.container = {};
    weblet.obj.slider = {};

    var s0 = weblet.obj.slider.slider0 = new MneVSlider(weblet.frame, (slider['s0'] ) ? slider['s0'] : '50%', 'move');

    weblet.obj.container['selection']  = s0.container0
    weblet.obj.container['detail']  = s0.container1

  }
}

export default MneTemplateHH

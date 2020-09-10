//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/geometrie/join.mjs
//================================================================================
'use strict';
import { MneVSlider, MneHSlider }  from '/js/geometrie/slider.mjs'
import MneElement from '/weblet/basic/element.mjs'

class MneTemplateJoin
{
  static mkTemplate( weblet, slider )
  {
    weblet.obj.container = {};
    weblet.obj.slider = {};

    var s0 = weblet.obj.slider.s0 = new MneVSlider(weblet.frame,  (slider['s0'] ) ? slider['s0'] : '20%', 'move');
    var s1 = weblet.obj.slider.s1 = new MneHSlider(s0.container0, (slider['s1'] ) ? slider['s1'] : '50%', 'move');
    var s2 = weblet.obj.slider.s2 = new MneVSlider(s0.container1, (slider['s2'] ) ? slider['s2'] : '33%', 'move');
    var s3 = weblet.obj.slider.s3 = new MneHSlider(s2.container0, (slider['s3'] ) ? slider['s3'] : '50%', 'move');
    var s4 = weblet.obj.slider.s4 = new MneHSlider(s2.container1, (slider['s4'] ) ? slider['s4'] : '50%', 'move');

    weblet.obj.container['firstsel']  = s1.container0
    weblet.obj.container['secondsel'] = s1.container1
    weblet.obj.container['firsttab']  = s3.container0
    weblet.obj.container['secondtab'] = s3.container1
    weblet.obj.container['joins']     = s4.container0
    weblet.obj.container['detail']    = s4.container1
  }
}

export default MneTemplateJoin

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/geometrie/query.mjs
//================================================================================
'use strict';
import { MneVSlider, MneHSlider }  from '/js/geometrie/slider.mjs'
import MneElement from '/weblet/basic/element.mjs'

class MneTemplateQuery
{
  static mkTemplate( weblet, slider )
  {
    weblet.obj.container = {};
    weblet.obj.slider = {};

    var s0 = weblet.obj.slider.s0 = new MneHSlider(weblet.frame, 'auto', 'fix');
    var s1 = weblet.obj.slider.s1 = new MneVSlider(s0.container1, (slider['s1'] ) ? slider['s1'] : (( weblet.frame.offsetWidth > 1200 ) ? '300px' : '25%'), 'move');
    var s2 = weblet.obj.slider.s2 = new MneHSlider(s1.container1, (slider['s2'] ) ? slider['s2'] : '25%', 'move');
    var s3 = weblet.obj.slider.s3 = new MneHSlider(s2.container1, (slider['s3'] ) ? slider['s3'] : '50%', 'move');
    var s4 = weblet.obj.slider.s4 = new MneVSlider(s3.container0, (slider['s4'] ) ? slider['s4'] : '50%', 'move');

    weblet.obj.container['selectionmenu']  = s0.container0
    weblet.obj.container['selection']      = s1.container0
    weblet.obj.container['detail']         = s2.container0
    weblet.obj.container['join']           = s4.container0
    weblet.obj.container['collist']        = s4.container1
    weblet.obj.container['bottom']         = s3.container1
  }
}

export default MneTemplateQuery

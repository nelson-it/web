// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: templ/allg/ht.mjs
//================================================================================
'use strict';
import { MneVSlider, MneHSlider }  from '/js/geometrie/slider.mjs'
import MneElement                  from '/js/basic/element.mjs'
import MneViewWeblet               from '/weblet/basic/view.mjs'

class MneTemplateHT
{
  static mkTemplate( weblet )
  {
    weblet.obj.weblet = {};
    weblet.obj.slider = {};

    var s0 = weblet.obj.slider.slider0 = new MneHSlider(weblet.frame, '50%', 'move');

    weblet.obj.weblet['detail'] = new MneViewWeblet(weblet, s0.container0, 'detail')
    weblet.obj.weblet['bottom']  = new MneMenuWeblet(weblet, s0.container1, 'bottom');
  }
}

export default MneTemplateHT

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/geometrie/h.mjs
//================================================================================
'use strict';
import { MneVSlider, MneHSlider }  from '/js/geometrie/slider.mjs'
import MneElement from '/weblet/basic/element.mjs'

class MneTemplateH
{
  static mkTemplate( weblet )
  {
    weblet.obj.container = {};
    weblet.obj.slider = {};

    weblet.obj.container['detail']  = weblet.frame; 
  }
}

export default MneTemplateH

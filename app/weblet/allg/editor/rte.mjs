//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/editor/rte.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneView   from '/weblet/basic/view.mjs'

class MneEditorRte extends MneView
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        delbutton : ['add', 'del'],
        hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    //getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

    setValue(val)
    {
      this.obj.inputs.data.setValue(val);
    }
    
    getValue(plain)
    {
      return this.obj.inputs.data.getValue(plain)
    }
    
    getModify()
    {
      return this.obj.inputs.data.getModify()
    }
    
    async cancel()
    {
      return this.close();
    }
}

export default MneEditorRte;

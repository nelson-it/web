//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/query/joinedit.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbView   from '/weblet/db/view.mjs'

class MneTemplate extends MneDbView
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        delbutton : 'add,del',
        selectlists : { typ : 'jointype' },
        hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    
    async values()
    {
      console.log(this.config.dependweblet.obj.run.values)
      var i;
      
      for ( i in this.config.dependweblet.obj.run.values)
        if ( this.obj.inputs[i] != undefined ) this.obj.inputs[i].setValue(this.config.dependweblet.obj.run.values[i]);
    }
    
    async ok()
    {
      this.obj.inputs.joindefid.setValue('');
      this.config.dependweblet.newjoin()
      this.close();
    }
    
    async cancel()
    {
      this.close();
    }
    
}

export default MneTemplate;

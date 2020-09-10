//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/table/name.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'

import MneDbViewWeblet     from '/weblet/db/view.mjs'

class MneAdminTableNameWeblet extends MneDbViewWeblet
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        schema  : 'mne_application',
        query   : 'table_all', 
        showids : [ "schema", "table"],
        
        addurl  : "/db/admin/table/table/add.json",
        modurl  : "/db/admin/table/table/mod.json", 
        delurl  : "/db/admin/table/table/del.json",

        defvalues : { schema : '', table : '' },
        hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    
    async add(data)
    {
      if ( this.getModify() )
      {
        this.obj.defvalues["schema"] = this.obj.inputs.schema.getValue();
        this.obj.defvalues["table"] = this.obj.inputs.table.getValue();
      }
      else
      {
        this.obj.defvalues["schema"] = '';
        this.obj.defvalues["table"] = '';
      }
      return super.add(data);
    }

}

export default MneAdminTableNameWeblet;

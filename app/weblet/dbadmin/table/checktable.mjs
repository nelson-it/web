//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/table/checktable.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement from '/weblet/basic/element.mjs'

import MneDbTableViewWeblet from '/weblet/db/table/view.mjs'

class MneAdminTableCheckTableWeblet extends MneDbTableViewWeblet
{
  reset()
  {
    super.reset();
    
    this.getParamAdd = function(p)
    {
      var i;
      var cols = new Array();
      var i;
      var c;

      p = 
      {
          schemaInput : this.obj.run.values.schema,
          tableInput  : this.obj.run.values.table,
          sqlstart    : 1,
          sqlend      : 1
      };

      p = this.getParam(p);
      return p;
    }

    this.getParamMod = function(p)
    {
      p = this.getParamAdd(p);
      p['nameInput.old'] = this.obj.run.values.name;
      
      return p;
    }

    this.getParamDel = function(p)
    {
      p = 
      {
          'schemaInput.old' : this.obj.run.values.schema,
          'tableInput.old'  : this.obj.run.values.table,
          'nameInput.old'   : this.obj.run.values.name,
          sqlstart          : 1,
          sqlend            : 1
      };
      return p;
    }
  }
  
  async add(data)
  {
    this.obj.defvalues.name  = this.obj.defvalues.schema + "_" + this.obj.defvalues.table + '_check_' + (new Date()).getTime();
    return super.add(data);
  }
}

export default MneAdminTableCheckTableWeblet;

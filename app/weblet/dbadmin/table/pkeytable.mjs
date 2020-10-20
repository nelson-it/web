//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/table/pkeytable.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement from '/weblet/basic/element.mjs'

import MneDbTableViewWeblet from '/weblet/db/table/view.mjs'

class MneAdminTabletPkeyTableWeblet extends MneDbTableViewWeblet
{
  reset()
  {
    super.reset();
    
    this.delbutton('add,del');

    this.getParamAdd = function(p)
    {
      var i;
      var cols = new Array();
      var i;
      var c;

      p = 
      {
          schema   : this.obj.run.values.schema,
          table    : this.obj.run.values.table,
          sqlstart : 1,
          sqlend   : 1
      };

      for ( i=0; i<this.obj.tbody.rows.length; i++ )
      {
        var pos = this.obj.tbody.rows[i].cells[this.obj.run.result.rtabid['position']].valueField.getValue();
        if ( pos ) { cols[pos] = this.obj.tbody.rows[i].values[this.obj.run.result.rids['column']]; }
      }

      c= "";
      for ( i = 0; i<cols.length; i++ )
        if ( typeof cols[i] != 'undefined' ) c = c + cols[i] + ",";
      p.colsInput = c.substring(0, c.length - 1)

      return p;
    }

    this.getParamMod = function(p)
    {
      p = this.getParamAdd(p);
      p['nameInput.old'] = this.obj.pkey;
      
      return p;
    }

    this.getParamDel = function(p)
    {
      return this.getParamMod(p)
    }
  }
  
  async selectRow(data, row, evt)
  {
      await super.selectRow(data, row, evt)
      this.obj.run.okaction = ( this.obj.pkey ) ? 'mod' : 'add';
  }
  
  async values()
  {
    var i;
    
    await super.values();
    
    if ( this.obj.tbody.rows[0] )
    {
      for ( i = 0; i<this.obj.run.result.ids.length; ++i)
      this.obj.run.result.values[i] = this.obj.tbody.rows[0].values[i];

      this.obj.pkey = this.obj.run.result.values[this.obj.run.result.rids['name']];
      this.title =  ( this.obj.pkey ) ? this.obj.run.title.mod : this.obj.run.title.add;
      this.obj.run.okaction = ( this.obj.pkey ) ? 'mod' : 'add';
    }
  }
}

export default MneAdminTabletPkeyTableWeblet;

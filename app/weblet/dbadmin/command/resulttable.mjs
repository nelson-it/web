//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/command/resulttable.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement from '/weblet/basic/element.mjs'

import MneDbTableBasic from '/weblet/db/table/basic.mjs'

class MneDbAdminCommandResultTable extends MneDbTableBasic
{
  reset()
  {
    super.reset();
    this.obj.mkbuttons = [];
  }
  
  async headclick(data, row, evt)
  {
  }
  
  getParamShow(p, showids)
  {
    p = { command : this.config.dependweblet.obj.run.values.command, sqlend : 1};
    return p;
  }
  
  async values(param)
  {
    if ( this.config.dependweblet.obj.run.values.command == '' ) return;
    super.values(param);
  }
  
}

export default MneDbAdminCommandResultTable;

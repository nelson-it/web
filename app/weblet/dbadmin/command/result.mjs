//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/command/result.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement   from '/js/basic/element.mjs'

import MneFixTableWeblet from '/weblet/allg/table/fix.mjs'

class MneDbAdminCommandResult extends MneFixTableWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      url : "/db/utils/connect/sql/execute.json",
      tableweblet  : 'dbadmin/command/resulttable',
    };
    
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  async values()
  {
    this.obj.run.values.command = this.config.dependweblet.obj.inputs.command.getValue();
  }
}

export default MneDbAdminCommandResult;

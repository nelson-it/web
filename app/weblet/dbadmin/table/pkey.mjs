//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/table/pkey.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement   from '/js/basic/element.mjs'

import MneFixTableWeblet from '/weblet/allg/table/fix.mjs'

class MneAdminTabletPkeyWeblet extends MneFixTableWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      tableweblet  : 'dbadmin/table/pkeytable',
        
      schema : 'mne_catalog',
      table  : 'pkey',
      cols: 'schema,table,name,column,position',

      tablehidecols  : ['schema', 'table', 'name'],
      tablecoltype   : { position : 'text' },
     
      showids        : [  'schema',  'table' ],
      delconfirmids  : [  'schema',  'table', 'name' ],
            
      addurl : "/db/admin/table/pkey/add.json",
      modurl : "/db/admin/table/pkey/mod.json",
      delurl : "/db/admin/table/pkey/del.json",
    };
    
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  reset()
  {
    super.reset();
  }
}

export default MneAdminTabletPkeyWeblet;

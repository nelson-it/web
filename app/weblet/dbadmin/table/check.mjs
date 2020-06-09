//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/table/check.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement   from '/js/basic/element.mjs'

import MneFixTableWeblet from '/weblet/allg/table/fix.mjs'

class MneAdminTableCheckWeblet extends MneFixTableWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      tableweblet  : 'dbadmin/table/checktable',
        
      schema : 'mne_application', 
      query  : 'table_checks',
      cols   : 'schema,table,name,check,text_de,text_en,custom',
      scols  : 'name',

      tablehidecols : [ 'schema', 'table' ], 
      tablecoltype  : { name : 'text', check : 'text', text_de : 'text', text_en : 'text', custom : 'bool' },

      showids       : [ 'schema',  'table' ],
      delconfirmids : [  'schema',  'table', 'name' ],

      addurl : "/db/admin/table/check/add.json",
      modurl : "/db/admin/table/check/mod.json",
      delurl : "/db/admin/table/check/del.json",
    };
    
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
}

export default MneAdminTableCheckWeblet;

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/selectlist/detail.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement from '/weblet/basic/element.mjs'

import MneFixTableWeblet from '/weblet/allg/table/fix.mjs'

class MneAdminSelectlistDetail extends MneFixTableWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      tableweblet  : 'dbadmin/selectlist/detailtable',
        
      schema : 'mne_application',
      table : 'selectlist',

      cols : 'name,num,value,text_de,text_en,custom',
      scols : 'num,value',

      tablecoltype : { name : 'text', num : 'text', value : 'text', text_de : 'text', text_en : 'text', custom : 'bool' },

      showids : ['name'],
        okids : [ 'name', 'value'],
       delids : [ 'name', 'value'],

      delconfirmids : ['name', 'value' ],
      
      defvalues : { value : ''}
    };
    
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
}

export default MneAdminSelectlistDetail;

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/table/content.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement   from '/js/basic/element.mjs'

import MneTableWeblet from '/weblet/allg/table/fix.mjs'

class MneAdminTabletContentWeblet extends MneTableWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      schema : 'unbekannt',
      table  : 'unbekannt',
      
      whereweblet : 'single',
      tableweblet  : 'dbadmin/table/contenttable',
    };
    
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  reset()
  {
    super.reset();
  }
}

export default MneAdminTabletContentWeblet;

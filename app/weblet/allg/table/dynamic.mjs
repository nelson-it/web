//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/table/dynamic.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement from '/weblet/basic/element.mjs'

import MneTable     from './fix.mjs'

class MneTableDynamic extends MneTable
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      selectsingle : true,
      tableweblet  : 'db/table/dynamic',
      datastart    : 3,
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
}

export default MneTableDynamic

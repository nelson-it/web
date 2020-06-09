//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/table/select.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement   from '/js/basic/element.mjs'

import MneTableWeblet     from './fix.mjs'

class MneTableFrameWeblet extends MneTableWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        nohead : true
    };
    
    var ifix =
    {
        nowebletframe : true,
        nofocus : true,
        tableweblet : 'db/table/frame',
        whereweblet : undefined
    }

    super(parent, frame, id, Object.assign(Object.assign(ivalues, initpar),ifix), config );
  }
}

export default MneTableFrameWeblet

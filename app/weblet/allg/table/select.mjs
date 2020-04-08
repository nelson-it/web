//================================================================================

//Copyright: M.Nelson - technische Informatik
//Die Software darf unter den Bedingungen 
//der APGL ( Affero Gnu Public Licence ) genutzt werden

//datei: weblet/allg/table/select.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement   from '/js/basic/element.mjs'

import MneTableWeblet     from './table.mjs'

class MneSelectTableWeblet extends MneTableWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      selectsingle : true,
      whereweblet  : 'select'
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  async ok(data)
  {
    await this.initpar.ok(this.select);
    this.close();
  }
  
}

export default MneSelectTableWeblet;

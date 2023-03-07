//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/select.mjs
//================================================================================
'use strict';

import MneConfig   from '/js/basic/config.mjs'
import MneText     from '/js/basic/text.mjs'
import MneInput    from '/js/basic/input.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneElement from '/weblet/basic/element.mjs'
import MneFixMenu from '/weblet/allg/menu/fix.mjs'

class MneRepositorySelect extends MneFixMenu
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  reset()
  {
    super.reset();
    this.obj.readparam["rootInput.old"] = 'repository';
  }
}

export default MneRepositorySelect;

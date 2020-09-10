//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/subweblet.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneGeometrie   from './geometrie.mjs'

class MneSubweblet extends MneGeometrie
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        subinit   : {},
        subdepend : {}
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  reset()
  {
    super.reset();
    this.obj.name = this.initpar.name;  
  }

  async load()
  {
    this.obj.run.initpar = this.initpar.subinit;
    this.obj.run.depend  = this.initpar.subdepend;
    return super.load();
  }
  
  async mkDepend()
  {
    var i;
    
    await super.mkDepend();
    for ( i in this.obj.weblets )
    {
      if ( ! this.obj.weblets[i].config.dependweblet ) 
      {
        this.obj.weblets[i].config.dependweblet = this;
        this.config.depend.push(this.obj.weblets[i]);
      }
    }
  }
  
  async values(param)
  {
    this.obj.run.values = {};
    Object.assign(this.obj.run.values, this.config.dependweblet.obj.run.values);
    if ( this.initpar.values ) this.initpar.values();
  }
}

export default MneSubweblet;

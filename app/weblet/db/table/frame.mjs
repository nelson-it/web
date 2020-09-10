//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/db/table/frame.mjs
//================================================================================
'use strict';

import MneConfig     from '/js/basic/config.mjs'
import MneText       from '/js/basic/text.mjs'
import MneLog        from '/js/basic/log.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneRequest    from '/js/basic/request.mjs'

import MneDbTableBasicWeblet from './basic.mjs'

class MneDbTableViewWeblet extends MneDbTableBasicWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
    };

    var cols = ( initpar.cols != '' ) ? initpar.cols.split(',') : [];
    var showcols = ( initpar.showcols != 'undefined' && initpar.showcols != '' ) ? initpar.showcols.split(',') : [];
    var hide = [];
    
    showcols.forEach((item, index) =>
    {
      if ( cols.indexOf(item) == -1 )
      {
        cols.push(item);
        hide.push(item);      
      }
    });
    
    initpar.cols = cols.join(',');
    initpar.tablehidecols = hide;

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  async check_values()
  {
    var mustcheck = false;
    var p = [];
    var self = this;
    

    this.config.depend.forEach( (item) =>
    {
      if ( item.newvalues && item.obj.run.dependweblet == item )
             mustcheck = true;
    });

    if ( mustcheck )
      p.push (this.refresh());

    p.push(super.check_values());

    return Promise.all(p);
  }
  
  async rowclick(data, row, evt)
  {
    await super.rowclick(data, row, evt);

    if ( this.initpar.selectok)
      await this.initpar.selectok(this.select);

    return this.parent.close();
  }
}

export default MneDbTableViewWeblet

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/db/table/select.mjs
//================================================================================
'use strict';

import MneConfig     from '/js/basic/config.mjs'
import MneText       from '/js/basic/text.mjs'
import MneLog        from '/js/basic/log.mjs'
import MneElement    from '/js/basic/element.mjs'
import MneRequest    from '/js/basic/request.mjs'

import MneDbTableBasic from './basic.mjs'

class MneDbTableSelect extends MneDbTableBasic
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        lastquery : 0
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

  async ok()
  {
    if ( this.initpar.selectok)
      await this.initpar.selectok(this.select);
    return this.cancel();
  }
  
  async cancel()
  {
    await this.parent.close();
  }
  
  async detail()
  {
    await this.openpopup(this.initpar.detailweblet);
  }
  
  async dblclick(data, obj, evt)
  {
    return this.ok();
  }
}

export default MneDbTableSelect

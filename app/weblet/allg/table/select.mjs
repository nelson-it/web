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
import MneElement from '/weblet/basic/element.mjs'

import MneTableWeblet     from './fix.mjs'

class MneTableSelectWeblet extends MneTableWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      selectsingle : true,
      whereweblet  : 'single',
      tableweblet  : 'db/table/select',
      modurl       : 'select',
      
      okids : [],
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  async load()
  {
    await super.load();

    if ( this.obj.weblets.where )
    {

      var p = Object.assign(
      {
        cols     : this.initpar.cols,
        no_vals  : true,
        sqlstart   : 1,
        sqlend   : 1
      }, this.obj.weblets.table.obj.run.readpar);

      var res = await MneRequest.fetch(this.obj.weblets.table.obj.run.btnrequest.read, p);
      var ids = [];
      var labels = [];
      var typs = [];
      var i;

      for ( i =0; i < res.ids.length; ++i)
      {
        if ( ! this.obj.weblets.table.obj.colhide[i] )
        {
          ids.push(res.ids[i]);
          labels.push(res.labels[i]);
          typs.push(res.typs[i]);
        }
      }

      this.obj.weblets.where.viewpar = { ids : ids, typs : typs, labels : labels };
    }
  }
}

export default MneTableSelectWeblet

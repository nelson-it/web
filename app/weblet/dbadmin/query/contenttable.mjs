//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/query/contenttable.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneInput     from '/js/basic/input.mjs'

import MneDbTableView from '/weblet/db/table/view.mjs'

class MneAdminTabletContentTable extends MneDbTableView
{
  reset()
  {
    super.reset();
  }

  async values()
  {
    var i;
    if ( ! this.config.dependweblet.obj.run.values.schema || ! this.config.dependweblet.obj.run.values.query  || ! this.config.dependweblet.obj.run.values  )
    {
      this.clear();
      return;
    }

    if ( this.obj.run.readpar.schema != this.config.dependweblet.obj.run.values.schema || this.obj.run.readpar.query  != this.config.dependweblet.obj.run.values.query  || this.obj.run.readpar.unionnum  != this.config.dependweblet.obj.run.values.unionnum )
    {
      this.obj.run.readpar.schema = this.config.dependweblet.obj.run.values.schema;
      this.obj.run.readpar.query  = this.config.dependweblet.obj.run.values.query;
      this.obj.run.readpar.unionnum  = this.config.dependweblet.obj.run.values.unionnum;
      
      
      var p = Object.assign(
          {
            no_vals   : true,
            sqlend   : 1
          }, this.obj.run.readpar);

      var res = await MneRequest.fetch(this.obj.run.btnrequest.read, p);
      var ids = [];
      var labels = [];
      var typs = [];
      var i;

      for ( i =0; i < res.ids.length; ++i)
      {
          ids.push(res.ids[i]);
          labels.push(res.labels[i]);
          typs.push(res.typs[i]);
      }

      this.obj.where.viewpar = { ids : ids, typs : typs, labels : labels };

    }

    await super.values();
  }
}

export default MneAdminTabletContentTable;

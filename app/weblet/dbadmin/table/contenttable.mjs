//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/table/contenttable.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement   from '/js/basic/element.mjs'
import MneInput     from '/js/basic/input.mjs'

import MneDbTableViewWeblet from '/weblet/db/table/view.mjs'

class MneAdminTabletContentTableWeblet extends MneDbTableViewWeblet
{
  reset()
  {
    super.reset();
  }

  async readvalues(request, p)
  {
    var res = await MneRequest.fetch(request, p);
    
    this.obj.cols = res.ids;
    res.typs.forEach( (item,index) => 
    {
      var t;
      switch(MneInput.getTyp(res.typs[index]))
      {
        case 'bool' : 
          t = 'bool';
          break;
        default:
          t = 'text';
      }
      this.obj.coltyp[index] = ( res.ids[index] != 'createdate' && res.ids[index] != 'createuser' && res.ids[index] != 'modifydate' && res.ids[index] != 'modifyuser' ) ? t : '';
    });
    
    this.obj.colhide = new Array(this.obj.cols.length).fill(false);
    
    return res;
  }

  async values()
  {
    var i;
    
    if ( this.obj.run.readpar.schema != this.config.dependweblet.obj.run.values.schema || this.obj.run.readpar.table  != this.config.dependweblet.obj.run.values.table )
    {
      this.obj.run.readpar.schema = this.config.dependweblet.obj.run.values.schema;
      this.obj.run.readpar.table  = this.config.dependweblet.obj.run.values.table;

      this.obj.run.addpar.schema = this.config.dependweblet.obj.run.values.schema;
      this.obj.run.addpar.table  = this.config.dependweblet.obj.run.values.table;

      this.obj.run.modpar.schema = this.config.dependweblet.obj.run.values.schema;
      this.obj.run.modpar.table  = this.config.dependweblet.obj.run.values.table;

      this.obj.run.delpar.schema = this.config.dependweblet.obj.run.values.schema;
      this.obj.run.delpar.table  = this.config.dependweblet.obj.run.values.table;
      
      var modids = [];
      var p =
      {
          schema : 'mne_catalog',
          table  : 'pkey',
          cols   : 'column,position',
          scols  : 'position',

          wcol : 'schema,table,position',
          wop  : '=,=,>',
          wval : this.obj.run.readpar.schema + ',' + this.obj.run.readpar.table + ',0',
      }

      var res = await MneRequest.fetch('/db/utils/table/data.json', p);
      res.values.forEach((item, index) => { modids.push(item[res.rids['column']]); });
      this.initpar.modids = modids;
      
      p = Object.assign(
          {
            cols     : this.initpar.cols,
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
        if ( ! this.obj.colhide[i] )
        {
          ids.push(res.ids[i]);
          labels.push(res.labels[i]);
          typs.push(res.typs[i]);
        }
      }

      this.obj.where.viewpar = { ids : ids, typs : typs, labels : labels };

    }

    await super.values();
  }
}

export default MneAdminTabletContentTableWeblet;

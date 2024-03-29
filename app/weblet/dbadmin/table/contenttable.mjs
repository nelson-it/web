//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/table/contenttable.mjs
//================================================================================
'use strict';

import MneRequest   from '/js/basic/request.mjs'
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
    
    this.initpar.addcols = this.obj.cols = res.ids;
    this.initpar.modcols = [];
    this.obj.cols.forEach((item, index) => { if (MneInput.getTyp(res.typs[index]) != 'binary' ) this.initpar.modcols.push(item)} );
    
    res.typs.forEach( (_item,index) => 
    {
      var t;
      switch(MneInput.getTyp(res.typs[index]))
      {
        case 'bool' : 
          t = 'bool';
          break;
        default:
          t = 'mtext';
      }
      this.obj.coltyp[index] = ( res.ids[index] != 'createdate' && res.ids[index] != 'createuser' && res.ids[index] != 'modifydate' && res.ids[index] != 'modifyuser' ) ? t : '';
    });
    
    this.obj.colhide = new Array(this.obj.cols.length).fill(false);
    
    return res;
  }

  async values()
  {
    var i;
    var depend = this.parent.config.dependweblet;
    
    if ( this.obj.run.readpar.schema != depend.obj.run.values.schema || this.obj.run.readpar.table  != depend.obj.run.values.table )
    {
      this.obj.run.readpar.schema = depend.obj.run.values.schema;
      this.obj.run.readpar.table  = depend.obj.run.values.table;

      this.obj.run.addpar.schema = depend.obj.run.values.schema;
      this.obj.run.addpar.table  = depend.obj.run.values.table;

      this.obj.run.modpar.schema = depend.obj.run.values.schema;
      this.obj.run.modpar.table  = depend.obj.run.values.table;

      this.obj.run.delpar.schema = depend.obj.run.values.schema;
      this.obj.run.delpar.table  = depend.obj.run.values.table;
      
      var okids = [];
      var p =
      {
          schema : 'mne_catalog',
          table  : 'pkey',
          cols   : 'column,position',
          scols  : 'position',

          wcol : 'schema,table,position',
          wop  : '=,=,>',
          wval : this.obj.run.readpar.schema + ',' + this.obj.run.readpar.table + ',0',
          
          sqlstart : 1,
          sqlend : 1
      }

      var res = await MneRequest.fetch('db/utils/table/data.json', p);
      res.values.forEach( item  => { okids.push(item[res.rids['column']]); });

      this.initpar.okids = okids;
      this.initpar.delids = okids;
      this.initpar.primarykey = okids;
      
      p = Object.assign(
          {
            cols     : this.initpar.cols,
            no_vals   : true,
            sqlstart : 1,
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
      this.obj.run.readpar.scols = '';

    }

    await super.values();
  }
}

export default MneAdminTabletContentTableWeblet;

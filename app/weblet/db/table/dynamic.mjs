//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/db/table/dynamic.mjs
//================================================================================
'use strict';

import MneConfig     from '/js/basic/config.mjs'
import MneText       from '/js/basic/text.mjs'
import MneLog        from '/js/basic/log.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneRequest    from '/js/basic/request.mjs'

import MneDbTableView from './view.mjs'

class MneDbTableDynView extends MneDbTableView
{
  async readvalues(request, p)
  {
    var res = await super.readvalues(request, p);
    
    var r = { ids : [], rids : {}, labels : [], typs : [], formats : [], regexps : [], values : []};
    if ( ! res.values || res.values.length == 0 ) return r;
    
    var i,j,k;
    var start =  this.initpar.datastart;
    var dataid = res.rids[this.initpar.dataid] ?? 1;
    
    var colhide;
    colhide = ( this.initpar.tablehidecols ) ?  this.initpar.tablehidecols : [] ;
 
    this.obj.colstyle = Object.assign({}, this.initpar.tablecolstyle ?? {} );
    var rcolstyle = {};
    
    for ( i in this.obj.colstyle )
         rcolstyle[this.obj.colstyle[i]] = i;
    
    r.ids[0] = res.ids[0];
    r.rids[res.ids[0]] = 0;
    r.labels[0] = res.labels[0];
    r.typs[0] = res.typs[0];
    r.formats[0] = res.formats[0];
    r.regexps[0] = res.regexps[0];

    for ( i = start; i<res.ids.length; i++)
    {
      r.ids.push( res.ids[i]);
      r.rids[res.ids[i]] = r.ids.length - 1;
      r.labels.push(res.labels[i] );
      r.typs.push( res.typs[i] );
      r.formats.push( res.formats[i] );
      r.regexps.push( res.regexps[i] );
    }
    
    for ( i=0; i < res.values.length && res.values[i][0] == res.values[0][0]; i++ )
    {
      r.ids.push(res.values[i][dataid]);
      r.labels.push(res.values[i][1]);
      r.typs.push(res.typs[2]);
      r.formats.push(res.formats[2]);
      r.regexps.push(res.regexps[2]);
      
      r.rids[res.values[i][dataid]] = r.ids.length - 1;

      for ( j = 3; j < start; j++)
      {
        r.ids.push(res.values[i][dataid] + res.ids[j]);
        r.labels.push(res.values[i][1] + " " + res.labels[j]);
        r.typs.push(res.typs[j]);
        r.formats.push(res.formats[j]);
        r.regexps.push(res.regexps[j]);

        r.rids[res.values[i][dataid] + res.ids[j]] = r.ids.length - 1;
        
        if ( colhide.includes(res.ids[j]) ) colhide.push(res.values[i][dataid] + res.ids[j]);
        
        if ( rcolstyle[res.ids[j]] )
        {
          if ( res.rids[rcolstyle[res.ids[j]]] == 2 )
            this.obj.colstyle[res.values[i][dataid]] = res.values[i][dataid] + res.ids[j];
          else if ( res.rids[rcolstyle[res.ids[j]]] < start )
            this.obj.colstyle[res.values[i][dataid] + rcolstyle[res.ids[j]]] = res.values[i][dataid] + res.ids[j];
        }
      }
    }
    
    r.values.push([]);
    r.values[0].push(res.values[0][0]);
    for ( k = start; k<res.ids.length; k++)
      r.values[0].push( res.values[0][k]);
    
    for ( i = 0, j=0; i<res.values.length; i++)
    {
      if ( r.values[j][0] != res.values[i][0] )
      {
        r.values.push([]);
        j++;
        r.values[j].push(res.values[i][0]);

        for ( k = start; k<res.ids.length; k++)
          r.values[j].push( res.values[i][k]);
      }
      
      for ( k = 2; k < start; k++ ) r.values[j].push(res.values[i][k]);
    }

    var coltyp;
    coltyp = ( this.initpar.tablecoltype ) ?  this.initpar.tablecoltype : {};

    this.obj.colhide = new Array(this.obj.cols.length).fill(false);
    this.obj.coltyp = {};
    
    r.ids.forEach((item,index) =>
    {
      if ( colhide.indexOf(item) != -1 ) this.obj.colhide[index] = true;
      if ( coltyp[item] != undefined ) this.obj.coltyp[index] = coltyp[item];
    });

    return r;
  }
}

export default MneDbTableDynView

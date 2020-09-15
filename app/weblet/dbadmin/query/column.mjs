//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/query/column.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneTable from '/weblet/allg/table/fix.mjs'

class MneAdminQueryColumn extends MneTable
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
          tableweblet  : 'dbadmin/query/columntable',
          
          schema : 'mne_application',
          query : 'query_cols',
          cols : 'tabnum,schema,table,field,columnid,lang,groupby,musthaving,typ,format,text_de,text_en',

          tablecoltype : { tabnum : 'text', schema : 'text', table : 'text', field : 'mtext', columnid : 'text', lang : 'bool', groupby : 'bool', musthaving : 'bool', typ : 'selection', format : 'text', text_de : 'text', text_en : 'text' },
          showids : ['queryid', 'unionnum'],
          
          tablerowstyle : ['querytab'],
          tablerowstylecol : ['tabnum'],
          
          selectlists: { typ :  'tabledpytype' },
          
          drop : true,
          dropwait : [ 'collist' ],
          
          mkrowdirect : true,
          
          hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

    getParam(p)
    {
      var res = this.obj.weblets.table.all;
      
      p.tcolumnlength = res.values.length;
      res.values.forEach((item, index) =>
      {
        item.forEach( (val, i) =>
        {
            p[res.ids[i] + "Input" + index] = val;
          
        });
      });
     return p;
    }
    
    async selectok(res)
    {
      var w = this.obj.weblets.table;
      var values = {};
      res.ids.forEach((item, index) =>
      {
          values[item] = res.values[0][res.rids[item]];  
      });
      return w.addcol(values)
    }
}

export default MneAdminQueryColumn;

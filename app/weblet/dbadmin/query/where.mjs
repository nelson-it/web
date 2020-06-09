//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/query/where.mjs
//================================================================================
'use strict';

import MneElement  from '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneTable from '/weblet/allg/table/fix.mjs'

class MneAdminQueryWhere extends MneTable
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
          tableweblet  : 'dbadmin/query/wheretable',

          schema : 'mne_application',
          table : 'querywheres',
          cols : 'notoperator,leftbrace,lefttab,leftvalue,operator,righttab,rightvalue,rightbrace,booloperator',
          scols : 'wherecol',
            
          tablecoltype :
          {
            notoperator  : 'bool',
            leftbrace    : 'selection',
            lefttab      : 'text',
            leftvalue    : 'text',
            operator     : 'selection',
            righttab     : 'text',
            rightvalue   : 'text',
            rightbrace   : 'selection',
            booloperator : 'text'
          },
          showids : ['queryid', 'unionnum'],

          defvalues : { operator : '=' },
          selectlists: { typ :  'tabledpytype' },
          
          drop : true,
          dropwait : [ 'collist' ],
          
          mkrowdirect : true,
          
          hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getParam(p)
    {
      var res = this.obj.weblets.table.all;
      
      var checkval = (val) => { return ( val == 'session_user' || val == 'current_user' || val == 'current_database()' ) ? '\'' + val + '\'' : val; }

      p.twherelength = res.values.length;
      res.values.forEach((item, index) =>
      {
        item.forEach( (val, i) =>
        {
            if ( res.ids[i] == 'leftvalue' || res.ids[i] ==  'rightvalue' )
              val = checkval(val);
            
            p['w' + res.ids[i] + "Input" + index] = val;
          
        });
      });
      return p;
    }
    
    async selectok(res)
    {
      var w = this.obj.weblets.table;

      await w.add();
      w.obj.run.act_row.obj.inputs.lefttab.modValue(res.values[0][res.rids['tabnum']]);
      w.obj.run.act_row.obj.inputs.leftvalue.modValue(res.values[0][res.rids['column']]);
    }
    
    async ok()
    {
    }

}

export default MneAdminQueryWhere;

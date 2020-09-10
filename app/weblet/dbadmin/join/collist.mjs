//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/join/collist.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneTable from '/weblet/allg/table/fix.mjs'

class MneAdminJoinCollist extends MneTable
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
          tableweblet  : 'dbadmin/query/collisttable',
          
          schema : 'mne_application',
          query : 'table_cols',
           cols : 'column,text_de,text_en',
          scols : 'column',
          
          showids : ['schema', 'table'],
          selectsingle : true,
          
          selectok  : [ 'detail' ],
          
          hinput : false,
          notitle : true
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    async load()
    {
      await super.load();
      this.obj.tabletitle = this.frame.querySelector('#tabletitle');
    }
    
    async values()
    {
      await super.values();
      this.obj.title = ( this.obj.run.values.schema ) ? this.obj.run.values['tabnum'] + ' ' + this.obj.run.values['schema'] + '.' + this.obj.run.values['table'] : this.config.label;
    }
}

export default MneAdminJoinCollist;

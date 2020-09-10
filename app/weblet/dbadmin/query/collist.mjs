//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/query/collist.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneTable from '/weblet/allg/table/fix.mjs'

class MneAdminQueryCollist extends MneTable
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
          
          selectok  : [ 'column', 'where' ],
          selectpar : ['schema', 'table', 'tabnum'],
          
          hinput : false,
          notitle : true
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url); }
    getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

    async load()
    {
      await super.load();
      this.obj.tabletitle = this.frame.querySelector('#tabletitle');
    }
    
    async values()
    {
      await super.values();
      this.obj.tabletitle.innerText = ( this.obj.run.values.schema ) ? this.obj.run.values['tabnum'] + ' ' + this.obj.run.values['schema'] + '.' + this.obj.run.values['table'] : this.config.label;
    }
}

export default MneAdminQueryCollist;

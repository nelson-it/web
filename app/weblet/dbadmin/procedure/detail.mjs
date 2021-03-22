//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/procedure/detail.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbView   from '/weblet/db/view.mjs'

class MneDbAdminProcedure extends MneDbView
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        schema  : 'mne_application',
        query   : 'procedure',
        table   : '',
        showids : ['schema', 'fullname'],
        
        defvalues : { schema : '', fullname : '', ownername : 'admindb', provolatile : 'v' },
        
        okschema    : 'mne_catalog',
        okfunction  : 'pgplsql_proc_create',
        okcols  : ['schema', 'fullname', 'rettype', 'text', 'asowner', 'provolatile', 'ownername' ],
        oktyps  : { 'asowner' : 'bool' },
        
        delfunction : 'pgplsql_proc_del',
        delcols : [ 'schema', 'fullname' ],
        
        hinput : false 
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    
    async load()
    {
      await super.load();
      
      await MneRequest.loadscript('js/ace/ace.js');

      this.obj.editor = ace.edit("textEdit");
      this.obj.editor.getSession().setMode("ace/mode/sql");
      this.obj.editor.getSession().setTabSize(2)
      
      this.frame.querySelector('textarea').setAttribute('aria-multiline', true);
    }
    
    async ok()
    {
      this.obj.inputs.text.setValue(await this.obj.editor.getValue());
      this.obj.run.values.schema = this.obj.inputs.schema.getValue();
      this.obj.run.values.fullname = this.obj.inputs.fullname.getValue();

      return super.ok();
    }

    async values()
    {
      await super.values();
      this.obj.editor.setValue(this.obj.inputs.text.getValue());
    }
    
}

export default MneDbAdminProcedure;

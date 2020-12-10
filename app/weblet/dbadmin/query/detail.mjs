//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/query/detail.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbView     from '/weblet/db/view.mjs'

class MneAdminQueryDetail extends MneDbView
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        schema  : 'mne_application',
        table   : 'queryname',

        modurl : '/db/admin/query/ok.json',
        delurl : '/db/admin/query/del.json',
        
        showids : [ 'queryid'],
        okids   : [ 'queryid', 'schema', 'query', 'unionnum'],
        delids  : [ 'queryid'],

        defvalues : { schema : '', query : '', unionnum : 1 },
        
        hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    
    reset()
    {
      super.reset();
      
      this.obj.mkbuttons.push({ id : 'copy',  value : MneText.getText("#mne_lang#Kopieren"), before: 'del', space : 'behind'  })
      
      this.getParamMod = function(p)
      {
        var p = this.getParam({});
        p = this.getIdparam(p);
        p = this.config.composeparent.obj.weblets.join.getParam(p);
        if ( this.config.composeparent.obj.weblets.column)
          p = this.config.composeparent.obj.weblets.column.getParam(p);
        if ( this.config.composeparent.obj.weblets.where)
          p = this.config.composeparent.obj.weblets.where.getParam(p);

        p.sqlstart = 1;
        p.sqlend = 1;
        return p;
      }
      
      this.obj.enablebuttons.buttons = [];
    }

    async copy()
    {
      this.obj.inputs.queryid.modValue('################');
      this.obj.inputs.query.modValue(this.obj.run.values.query + 'Copy');
      return this.ok();
    }
    
    async ok()
    {
      this.obj.run.okaction = 'mod';
      return super.ok();
    }
    
    async values()
    {
      this.getParamShow({}, ['schema'] );

      this.obj.defvalues.schema =  ( this.config.dependweblet.obj.run.values.schema ) ? this.config.dependweblet.obj.run.values.schema : '';
      this.obj.defvalues.query  =  ( this.config.dependweblet.obj.run.values.table  ) ? this.config.dependweblet.obj.run.values.table : '';
      
      await super.values();
      
      if ( this.obj.run.values.queryid == '################')
        Object.assign(this.obj.run.values, this.config.dependweblet.obj.run.values);
    }
}

export default MneAdminQueryDetail;

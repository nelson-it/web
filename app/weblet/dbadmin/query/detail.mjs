//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/detail.mjs
//================================================================================
'use strict';

import MneElement  from '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbViewWeblet     from '/weblet/db/view.mjs'

class MneAdminQueryDetail extends MneDbViewWeblet
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
        modids  : [ 'queryid', 'schema', 'query', 'unionnum'],
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

        p.sqlend = 1;
        return p;
      }
    }

    async ok()
    {
      this.obj.run.okaction = 'mod';
      return super.ok();
    }
    
    async values()
    {
      this.getParamShow({}, ['schema'] );
      this.obj.defvalues.schema =  ( this.obj.run.showvals.schema ) ? this.obj.run.showvals.schema : '';
      return super.values();
    }
}

export default MneAdminQueryDetail;

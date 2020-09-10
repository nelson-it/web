//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/menu/detail.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbView   from '/weblet/db/view.mjs'

class MneDbadminMenuDetail extends MneDbView
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        schema    : 'mne_application',
        query     : 'menu_edit',
        table     : 'menu',
        showids : ['menuid'],
        delconfirmids : ['itemname'],
        
        hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }

    async values()
    {
      await super.values();
      
      this.obj.defvalues.menuname = this.obj.run.values.menuname;
      this.obj.defvalues.parentid = this.obj.run.values.parentid;
      this.obj.defvalues.parentname = this.obj.run.values.parentname;
    }
}

export default MneDbadminMenuDetail;

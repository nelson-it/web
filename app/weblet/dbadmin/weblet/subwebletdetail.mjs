//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/subwebletdetail.mjs
//================================================================================
'use strict';

import MneElement  from '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbViewWeblet     from '/weblet/db/view.mjs'

class MneDbAdminSubwebletDetail extends MneDbViewWeblet
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        schema  : 'mne_application',
        query   : 'weblet_detail',
        showids : ['htmlcomposetabid'],
        
        okschema    : 'mne_catalog',
        okfunction  : 'subweblet_ok',
        okcols  : ['htmlcomposeid', 'htmlcomposetabid', 'id', 'position', 'subposition', 'loadpos', 'path', 'initpar', 'depend', 'ugroup', 'custom', 'label_de', 'label_en', 'namecustom' ],
        oktyps  : { custom : 'bool', namecustom : 'bool', loadpos : 'long', subposition : 'long' },
        
        delfunction : 'subweblet_del',
        delcols : [ 'htmlcomposetabid' ],
        
        hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    
    async values()
    {
      this.obj.defvalues['htmlcomposeid'] = this.config.dependweblet.obj.run.values.htmlcomposeid;
      return super.values();
    }
    
}

export default MneDbAdminSubwebletDetail;

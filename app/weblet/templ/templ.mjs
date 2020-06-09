//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/templ/templ.mjs
//================================================================================
'use strict';

import MneElement  from '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbView   from '/weblet/db/view.mjs'

class MneTemplate extends MneDbView
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        readurl : '',
        schema  : '',
        query   : '',
        table   : '',
        showids : [''],
        //modids  : [''],
        
        //okschema    : '',
        //oktable     : '',

        //addschema   : '',
        //addtable    : '',

        //modschema   : '',
        //modtable    : '',

        //delschema   : '',
        //deltable    : '',

        //okfunction  : '',
        //okcols  : [''],
        //oktyps  : { '' : '' },
        
        //addfunction : '',
        //addcols : [''],
        //addtyps : { '' : '' },

        //modfunction : '',
        //modcols : [''],
        //modtyps : { '' : '' },

        //delfunction : '',
        //delcols : [ '' ],
        //deltyps : [],
        
        hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    //getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

}

export default MneTemplate;

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/popup.mjs
//================================================================================
'use strict';

import MneRequest    from '/js/basic/request.mjs'
import MnePopupFrame from '/js/geometrie/popup.mjs'

class MnePopupWeblet
{
    constructor( id, initpar = {}, config = {} )
    {
      this.id = id;
      this.initpar = initpar;
      this.config = config;
    }
    
    async create( parent )
    {
      
      if ( parent.obj.weblets[this.id] == undefined || document.body.contains(parent.obj.weblets[this.id].obj.popup.frame) == false )
      {
        var container;
        var popup = new MnePopupFrame((container = document.createElement('div')), '', this.config.nointeractive, this.config.parentframe )

        let { default: Weblet } =  await MneRequest.import(this.config.path + '.mjs');
        
        parent.obj.weblets[this.id] = new Weblet(parent, container, this.id, Object.assign({ popup : popup }, this.initpar ), this.config )
      }
        
    }
 }

export default MnePopupWeblet;

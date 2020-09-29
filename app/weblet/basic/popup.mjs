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
    
    async getWeblet(path)
    {
      let { default: Weblet } = await MneRequest.import(path);
      return Weblet;
    }
    
    async create( parent, config = {}, initpar = {} )
    {
      
      if ( parent.obj.weblets[this.id] == undefined || document.body.contains(parent.obj.weblets[this.id].obj.popup.frame) == false )
      {
        var container;
        var popup = new MnePopupFrame((container = document.createElement('div')), '', this.config.nointeractive, this.config.parentframe )
        var weblet =  await this.getWeblet(this.config.path + '.mjs');
        parent.obj.weblets[this.id] = new weblet(parent, container, this.id, Object.assign(Object.assign({ popup : popup }, this.initpar), initpar ), Object.assign(Object.assign({}, this.config), config) )
      }
        
    }
 }

export default MnePopupWeblet;

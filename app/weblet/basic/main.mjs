// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: weblet/allg/main.mjs
//================================================================================
'use strict';

import MneText   from '/js/basic/text.mjs'
import MneLog    from '/js/basic/log.mjs'
import MneTheme  from '/js/basic/theme.mjs'
import MneConfig from '/js/basic/config.mjs'

import MneDbConfig from '/js/db/config.mjs'

import MneGeometrieWeblet   from './geometrie.mjs'

MneTheme.loadCss('allg.css')

class MneMainWeblet extends MneGeometrieWeblet
{
    constructor(frame, appl = 'main' )
    {
      super(null, frame, 'main', {}, { path : (( new URL(import.meta.url)).pathname.substring(8).replace(/\.mjs$/, '')) } );
      this.appl = appl;
    }
    
    getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

    async show( name = 'main')
    {
      await MneDbConfig.read();
      MneTheme.setTheme(MneConfig.stylename)
      super.show(name);
    }
    
    async check_values() {}
    
    async values()
    {
      await super.values();
      await this.obj.weblets.message.load();
      
      var startweblet = window.localStorage.getItem('startweblet');
      if ( startweblet ) this.obj.weblets['detail'].show(JSON.parse(startweblet));
      else if ( MneConfig.startweblet ) this.obj.weblets['detail'].show([ MneConfig.startweblet] );

    }
}

export default MneMainWeblet;

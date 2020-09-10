//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/main.mjs
//================================================================================
'use strict';

import MneText   from '/js/basic/text.mjs'
import MneLog    from '/js/basic/log.mjs'
import MneTheme  from '/js/basic/theme.mjs'
import MneConfig from '/js/basic/config.mjs'

import MneDbConfig from '/js/db/config.mjs'

import MneGeometrie from './geometrie.mjs'

MneTheme.loadCss('variable.css');
MneTheme.loadCss('tag.css');
MneTheme.loadCss('class.css');

class MneMain extends MneGeometrie
{
    constructor(frame, appl = 'main', startweblet = false )
    {
      super(null, frame, 'main', {}, { path : (( new URL(import.meta.url)).pathname.substring(8).replace(/\.mjs$/, '')) } );
      this.appl = appl;
      this.startweblet = startweblet;
      
      window.main_weblet = this;
    }
    
    getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

    async show( name = 'main')
    {
      await MneDbConfig.read();
      MneTheme.setTheme(MneConfig.stylename)
      await super.show(name);

      window.main_weblet = this.obj.weblets.detail;
      this.obj.newvalues = true;
      await this.check_values();
    }
    
    async load()
    {
      await super.load();
      await this.obj.popups.message.create(this);
      await this.obj.weblets.message.load();

      var startweblet = window.sessionStorage.getItem(window.mne_application + ':startweblet');
      try { startweblet = JSON.parse(startweblet); } catch(e) { console.log(e); console.log(startweblet), startweblet = undefined; }

      if ( startweblet )
        await this.obj.weblets['detail'].show( startweblet).catch( (e) => { MneLog.exception('Main Startweblet', e); });
      else if ( this.startweblet && MneConfig.startweblet )
        await this.obj.weblets['detail'].show([ MneConfig.startweblet] ).catch( (e) => { MneLog.exception('Main Startweblet', e) });
        
      this.obj.weblets['detail'].newvalues = true;
      
      this.frame.addEventListener('dragover', async (evt) => { if ( evt.dataTransfer.types.includes('Files')) evt.preventDefault(); })
      this.frame.addEventListener('drop', async (evt) => { if ( evt.dataTransfer.types.includes('Files')) evt.preventDefault(); })

    }
}

export default MneMain;

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/main.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneTheme   from '/js/basic/theme.mjs'
import MneConfig  from '/js/basic/config.mjs'
import MneMutex   from '/js/basic/mutex.mjs'
import MneElement from '/js/basic/element.mjs'

import MneDbConfig from '/js/db/config.mjs'

import MneGeometrie from '/weblet/basic/geometrie.mjs'
import MneWeblet    from '/weblet/basic/weblet.mjs'

MneTheme.loadCss('variable.css');
MneTheme.loadCss('tag.css');
MneTheme.loadCss('class.css');
MneTheme.loadCss('db/table/month.css', MneWeblet.stylePath);

class MneMain extends MneGeometrie
{
    constructor(frame, appl = 'main' )
    {
      super(null, frame, 'main', {}, { path : (( new URL(import.meta.url)).pathname.substring(8).replace(/\.mjs$/, '')) } );
      this.appl = appl;
      
      window.main_weblet = this;
      window.history.replaceState(null, document.title, location.origin + '/' + appl );
    }
    
    getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

    async check_values()
    {
      var observer = new MutationObserver( async (mut) =>
      {
        observer.disconnect();
        var startweblet = window.sessionStorage.getItem(window.mne_application + ':startweblet');
        try { startweblet = JSON.parse(startweblet); } catch(e) { console.log(e); console.log(startweblet), startweblet = undefined; }

        if ( startweblet )
        {
          var timeout = window.setTimeout(() => { MneElement.mkClass(MneWeblet.waitframe, 'show') }, 500);
          this.obj.weblets.detail.show( startweblet)
            .then( () => { window.clearTimeout(timeout); MneElement.mkClass(MneWeblet.waitframe, 'show', false)})
            .catch( (e) => { window.clearTimeout(timeout); MneElement.mkClass(MneWeblet.waitframe, 'show', false); MneLog.exception('Main Startweblet', e); });
        }
      });
      
      observer.observe(this.obj.weblets.menu.frame, { attributes : true, attributeFilter : ['menuready']} );
      return super.check_values();
    }
    
    async show( name = 'main')
    {
      await MneDbConfig.read();
      MneTheme.setTheme(MneConfig.stylename)
      await super.show(name);

      window.main_weblet = this.obj.weblets.detail;
      window.menu_weblet = this.obj.weblets.menu;
    }
    
    async load()
    {
      await super.load();
      await this.obj.popups.message.create(this);
      await this.obj.weblets.message.load();

      window.addEventListener('popstate', async (evt) => 
      {
        let unlock = await MneMain.history_mutex.lock();
        if ( history.state == null )
        {
          window.history.forward();
          console.log('End of history')
        }
        else
        {
          window.inpopstate = true;
          window.sessionStorage.setItem(window.mne_application + ':' + history.state.name[0], JSON.stringify(history.state.values)); 
          window.menu_weblet.action_menu({ res : { rids : { action : 0 } }, values : [ { parameter : [history.state.menu] } ] });
          await this.obj.weblets.detail.show( history.state.name ).catch( (e) => { window.inpopstate = false; unlock(); MneLog.exception('Main History', e) });
          window.inpopstate = false;
        }
        unlock()
      });
      
      this.frame.addEventListener('dragover', async (evt) => { if ( evt.dataTransfer.types.includes('Files')) evt.preventDefault(); })
      this.frame.addEventListener('drop', async (evt) => { if ( evt.dataTransfer.types.includes('Files')) evt.preventDefault(); })

      document.addEventListener('keyup', (evt) => { if ( evt.key == 'Escape') { this.obj.weblets.message.clear(); this.obj.popups.message.popup.close();} });
      this.obj.observer.hide = ( new MutationObserver( (mut) => { if ( ! this.obj.weblets.message.visible ) this.obj.weblets.message.clear(); })).observe(this.obj.popups.message.popup.frame, { childList: false, subtree: false, attributes : true, attributeFilter: [ 'style' ] });


    }
}
MneMain.history_mutex = new MneMutex();
export default MneMain;

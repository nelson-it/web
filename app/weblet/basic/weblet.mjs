// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: weblet/basic/weblet.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'
import MneTheme   from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'
import MneConfig  from '/js/basic/config.mjs'

MneTheme.loadCss('basic/weblet.css', '/styles/weblet');
class MneWeblet
{
    constructor( parent, frame, id, initpar = {}, config = {} )
    {
      if ( parent != null &&  ! ( parent instanceof MneWeblet ) ) throw new Error(MneText.getText("#mne_lang#Elternelement ist kein Weblet"));
      if ( ! ( frame.tagName ) ) throw new Error(MneText.getText("#mne_lang#Container ist kein HTML Element"));

      this.parent = parent,
      this.frame = frame;
      this.id = id;
      this.initorig = initpar;
      this.configorig = config;
      
      this.reset();
    }
    
    reset()
    {
      if ( this.obj )
      {
        var i;
        
        for ( i in this.obj.popups )
          document.body.removeChild(this.obj.popups[i].frame);
        
        for ( i in this.obj.weblets )
          this.obj.weblets[i].reset();

        for ( i in this.obj.slider )
          this.obj.slider[i].reset();
        
      }

      this.obj  = { loaded : false, run : {}, container : {}, weblets : {}, popups : {}, slider : {} }
      this.config = Object.assign({}, this.configorig )
      this.initpar = Object.assign({}, this.initorig )
      
      MneElement.mkClass(this.frame, 'weblet');
      
    }
    
    getPath(url) { return (new URL(url)).pathname.replace(/\/[^\/]+\.mjs$/, ''); }
    getCss(url)  { return (new URL(url)).pathname.substring(8).replace(/\.mjs$/, '.css'); }
    getView(url) { return (new URL(url)).pathname.substring(8).replace(/\.mjs$/, '.html'); }

    getCssPath() { return "" };
    
    set newvalues(val)
    {
      var i;
      if ( val )
      {
        this.obj.run.newvalues = true;
        for ( i=0;  i<this.config.depend.length; i++ )
          this.config.depend[i].newvalues = true;
      }
    }
    
    async reloadWeblet ( id )
    {
      var oldweblet = this.obj.weblets[id];
      if ( ! oldweblet ) throw new Error(MneText.sprintf(MneText.getText('#mne_langWeblet <$1> nicht gefunden'), id));
      
      let { default: Weblet } =  await MneRequest.import(oldweblet.config.path + '.mjs?date=' + Date.now());
      this.obj.weblets[id] = new Weblet(this, oldweblet.frame, id,  oldweblet.initorig );
      this.obj.weblets[id].config = oldweblet.config;

      await this.obj.weblets[id].load();
      await this.obj.weblets[id].values(this.obj.run.valuepar);
      await oldweblet.reset();
    }

    async load()
    {
      if ( this.obj.loaded ) throw Error('Weblet <' + this.id + '> ist schon geladen');

      var i;
      var css = this.getCssPath().split(',');

      this.obj.loaded = true;

      for ( i = 0; i < css.length; i++ )
        MneTheme.loadCss(css[i], MneWeblet.stylePath);
    }
    
    async show()
    {
      if ( this.obj.loaded == false )
        await this.load();
      
      if ( this.initpar.popup != undefined )
      {
        var self = this;
        this.initpar.popup.show();
        if ( this.reload ) 
          this.initpar.popup.reload = async function() { await self.reload() };
      }
    }
    
    async btnClick (clickid, data = {}, obj, evt )
    {
      try
      {
        await this[clickid](data, obj, evt)
        if ( this.parent != null ) await this.parent.check_values();
        console.log(clickid + " ready");
      }
      catch(e)
      {
        if ( e.message) e.message += '\nclickid: ' + clickid; MneLog.exception(e);
        throw new Error('')
      }
    }
   
    async close()
    {
      if ( this.initpar.popup != undefined )
      {
        this.initpar.popup.close();
      }
    }
    
    async check_values()
    {
    }

    async values()
    {
    }
 }

MneWeblet.stylePath = '/styles/weblet';
 
export default MneWeblet;

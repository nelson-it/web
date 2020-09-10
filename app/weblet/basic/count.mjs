//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/count.mjs
//================================================================================
'use strict';

import MneConfig     from '/js/basic/config.mjs'
import MneText       from '/js/basic/text.mjs'
import MneLog        from '/js/basic/log.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneRequest    from '/js/basic/request.mjs'
import MneViewWeblet from './view.mjs'

class MneCountWeblet extends MneViewWeblet
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      super(parent, frame, id, Object.assign(initpar, { notitle : true, nowebletframe : true }), config )
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }
    
    reset()
    {
      super.reset();
      
      this.config.label = MneText.getText("#mne_lang#Uhr");
      this.obj.mkbuttons = [];
      this.obj.count = 0;
    }

    async showTime()
    {
       var d = new Date;
       var self = this;
       
       if ( ++this.obj.count == 5 )
       {
         MneRequest.fetch('/utils/time.html').then((res) => { console.log('server ping: ' + res)});
         this.obj.count = 0;
       }

       this.obj.container.count.innerText = MneText.addNull(d.getHours(),2) + ":" + MneText.addNull(d.getMinutes(),2) + " " + ( MneConfig.fullname ?? MneConfig.username ?? '' );
       window.setTimeout(() => { self.showTime() }, 60100 - ( d.getSeconds() * 1000 ));
    }
    
    async showVersion()
    {
      var self = this;
      var version = await MneRequest.fetch('https://' + MneConfig.updatehost + '/version.php', { version : MneConfig.version, x : (parseInt(parseInt(document.body.clientWidth) / 100 ) * 100), y : (parseInt(parseInt(document.body.clientHeight) / 100 ) * 100), uuid : MneConfig.uuid });
      this.obj.container.version.innerHTML = MneText.getText('#mne_lang#Neue Version# ') + version;
      this.obj.container.version.addEventListener('animationend', function() { MneElement.mkClass(this, 'versionhide', true, 'version')} );

      MneElement.mkClass(this.obj.container.version, 'versionshow');
      window.setTimeout( () =>
      {
        MneElement.mkClass(self.obj.container.version, 'versionhide');
      }, 5000 )
    }
    
    async load()
    {
      await super.load();
      this.showTime();
      this.showVersion();
    }
    
    async values()
    {
      
    }
 }

export default MneCountWeblet;

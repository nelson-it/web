//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/register.mjs
//================================================================================
'use strict';

import MneText        from '/js/basic/text.mjs'
import MneLog         from '/js/basic/log.mjs'
import MneRequest     from '/js/basic/request.mjs'
import MneTheme       from '/js/basic/theme.mjs'
import MneElement     from '/js/basic/element.mjs'
import { MneHSlider } from '/js/geometrie/slider.mjs'

import MneWeblet           from './weblet.mjs'

export class MneRegister extends MneWeblet
{
    constructor(parent, frame, id, initpar = {}, config = {})
    {
      super(parent, frame, id, initpar, config)
    }
    
    reset()
    {
      super.reset();
      this.obj  = Object.assign(this.obj, { webletdata : {}, container : {} } );
    }
    
    getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

    set newvalues(val)
    {
      MneLog.warning("Geometrieweblet set newvalue");
      super.newvalues = val;
    }

    async check_values()
    {
      if ( this.newvalues ) MneLog.warning("Geometrieweblet hat newvalue");
    }
    
    async load()
    {
      var i;
      var bf;
      var self = this;

      await super.load();

      if ( ! this.initpar.menuframe )
      {
        this.obj.slider.s0 = new MneHSlider(this.frame, 'auto', 'fix');
        this.obj.container.menu  = this.obj.slider.s0.container0;
        this.obj.container.frame = this.obj.slider.s0.container1;
      }
      else
      {
        this.obj.container.menu  = this.initpar.menuframe;
        this.obj.container.frame = this.frame
      }

      bf = this.obj.container.menu
      bf.className = 'registermain';

      for ( i = 0; i<this.config.register.length; i++)
      {
        this.obj.webletdata[this.config.register[i]['id']] = this.config.register[i];

        if ( this.config.register[i].initpar.loaddirect )
        {
          if ( this.obj.loaddirect ) MneLog.warning('zweiten loaddirect gefunden ' + this.config.register[i].id  + ':' + this.obj.loaddirect );
          this.obj.loaddirect = this.config.register[i].id
        }

        bf.appendChild(document.createElement('div'));
        bf.lastChild.className = 'register registerlink'
          bf.lastChild.innerText = this.config.register[i]['label'];
        bf.lastChild.id = this.config.register[i]['id'];

        bf.lastChild.addEventListener('click', async function(evt) { await self.btnClick('register', this.id); })
      }

      var mwidth = 10;
      for ( i = 0; i<bf.children.length; ++i)
        mwidth = ( bf.children[i].offsetWidth > mwidth ) ? bf.children[i].offsetWidth : mwidth;

        for ( i = 0; i<bf.children.length; ++i)
          bf.children[i].style.minWidth = mwidth + "px";

    }

    async register( id )
    {
      if ( this.config.composeparent.obj.weblets[id] == undefined )
      {
          var data = this.obj.webletdata[id];
          var composeparent = this.config.composeparent;
          var self = this;

          var weblet;
          var config;
          
          config = Object.assign({ dependweblet : this.config.dependweblet }, data);
          config.depend.forEach((item, index) => { config.depend[index] = composeparent.obj.weblets[item]; });
          
          let { default: Weblet } =  await MneRequest.import(data['path'] + '.mjs');
          weblet = this.config.composeparent.obj.weblets[id] = new Weblet(this.config.composeparent, document.createElement('div'), id, data['initpar'], config );
          
          config.depend.forEach((item,index) => { item.config.dependweblet = weblet; });
          if ( this.config.dependweblet ) this.config.dependweblet.config.depend.push(weblet);
          
          await weblet.load();
          weblet.newvalues = true;
      }

      Array.from(this.obj.container.menu.children).forEach((item) => { MneElement.mkClass(item, 'registeractive', item.id == id )})
      
      var weblet = this.config.composeparent.obj.weblets[id];
      weblet.config.depend.forEach((item) => { item.config.dependweblet = weblet; })
      
      if ( this.obj.container.frame.firstChild ) this.obj.container.frame.removeChild(this.obj.container.frame.firstChild);
      this.obj.container.frame.appendChild(this.config.composeparent.obj.weblets[id].frame);

    }

    async show()
    {
      if ( this.obj.loaddirect )
        return this.register(this.obj.loaddirect)
    }

    async values( )
    {
    }
 }
 
export default MneRegister;

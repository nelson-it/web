// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: weblet/weblet/register.mjs
//================================================================================
'use strict';

import MneText        from '/js/basic/text.mjs'
import MneLog         from '/js/basic/log.mjs'
import MneRequest     from '/js/basic/request.mjs'
import MneTheme       from '/js/basic/theme.mjs'
import MneElement     from '/js/basic/element.mjs'
import { MneHSlider } from '/js/geometrie/slider.mjs'

import MneWeblet           from './weblet.mjs'

export class MneRegisterWeblet extends MneWeblet
{
    constructor(parent, frame, id, initpar = {}, config = {})
    {
      super(parent, frame, id, initpar, config)
    }
    
    reset()
    {
      super.reset();
      this.obj  = Object.assign(this.obj, { webletdata : {} } );
    }
    
    getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

    async loadview(data)
    {
      var i;
      var bf;
      var self = this;
      
      this.obj.slider.s0 = new MneHSlider(this.frame, 'auto', 'fix');
      bf = this.obj.slider.s0.container0;
      bf.className = 'registermain';
      
      for ( i = 0; i<data.length; i++)
      {
        this.obj.webletdata[data[i]['id']] = data[i];
        
        bf.appendChild(document.createElement('div'));
        bf.lastChild.className = 'register registerlink'
        bf.lastChild.innerText = data[i]['label'];
        bf.lastChild.id = data[i]['id'];
        
        bf.lastChild.addEventListener('click', async function(evt) { await self.btnClick('register', this.id); })
      }
      
      this.obj.container.frame = this.obj.slider.s0.container1
    }

    async register( id )
    {
      if ( this.obj.weblets[id] == undefined )
      {
          var data = this.obj.webletdata[id];
          var frame = document.createElement('div');
          
          var config = Object.assign({}, data);
          config.depend = (config.depend ) ? config.depend.split(',') : [];
          config.depend.push(this);
          config.dependweblet = this.config.dependweblet;

          console.log(config)
           let { default: Weblet } =  await MneRequest.import(data['path'] + '.mjs');
          this.obj.weblets[id] = new Weblet(this, frame, id, data['initpar'], config )
          this.obj.weblets[id].obj.run.newvalues = true;
      }

      if ( this.obj.container.frame.firstChild ) this.obj.container.frame.removeChild(this.obj.container.frame.firstChild);
      this.obj.container.frame.appendChild(this.obj.weblets[id].frame);
      await this.show();
      
    }
    
    async load( data )
    {
      await super.load();
      await this.loadview(data);
    }
    
    async show( )
    {
      var i;
      for ( i in this.obj.weblets )
      {
        if ( this.obj.weblets[i].frame && this.obj.weblets[i].frame.parentNode != null )
        {
          await this.obj.weblets[i].show()
          await this.obj.weblets[i].values()
        }
      }
    }
    
    async check_values()
    {
      this.parent.check_values();
    }

    async values( )
    {
      var i;
      for ( i in this.obj.weblets )
      {
        if ( this.obj.weblets[i].frame && this.obj.weblets[i].frame.parentNode != null && this.obj.weblets[i].obj.run.newvalues )
          await this.obj.weblets[i].values()
      }
    }
 }
 
export default MneRegisterWeblet;

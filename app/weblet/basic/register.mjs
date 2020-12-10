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
import MneElement from '/weblet/basic/element.mjs'
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
      MneLog.warning("Registerweblet set newvalue");
      super.newvalues = val;
    }

    async check_values()
    {
      if ( this.newvalues ) MneLog.warning("Registerweblet hat newvalue");
    }
    
    async load()
    {
      var i;
      var bf;
      var ele;
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
      MneElement.mkClass(bf, 'registermain');

      var str = '';
      for ( i = 0; i<this.config.register.length; i++)
      {
        this.obj.webletdata[this.config.register[i]['id']] = this.config.register[i];

        if ( this.config.register[i].initpar.loaddirect )
        {
          if ( this.obj.loaddirect ) MneLog.warning('zweiten loaddirect gefunden ' + this.config.register[i].id  + ':' + this.obj.loaddirect );
          this.obj.loaddirect = this.config.register[i].id
        }

        str += '<div id="' + this.config.register[i]['id'] + '" class="register registerlink">'  + this.config.register[i]['label'] + '</div>';
      }
      
      this.obj.container.menu.innerHTML = str;
      this.obj.container.menu.querySelectorAll('.registerlink').forEach( ( item ) => { item.addEventListener('click', function(evt) { self.btnClick('register', this.id); }); });
    }

    async register( id )
    {
      var data = this.obj.webletdata[id];
      var depend = [...data.depend];

      if ( this.config.composeparent.obj.weblets[id] == undefined )
      {
          var composeparent = this.config.composeparent;
          var self = this;

          var weblet;
          var config;
          
          config = Object.assign( (data.initpar.notdepend ) ? { dependid : [] } : { dependweblet : this.config.dependweblet, dependid : [] }, data);
          config.depend.forEach((item, index) => { config.dependid[index] = item; config.depend[index] = ( composeparent.obj.weblets[( item[0] != '#') ? item : item.substring(1)] ) ?? { composeparent : composeparent, depend : ( item[0] != '#') ? item : item.substring(1) } });
          if ( composeparent.obj.run.depend && composeparent.obj.run.depend[id] ) composeparent.obj.run.depend[id].split(',').forEach( ( item ) => { config.depend.push( { composeparent : composeparent.config.composeparent, depend : ( item[0] != '#') ? item : item.substring(1) }) });

          let { default: Weblet } =  await MneRequest.import(data['path'] + '.mjs');
          weblet = this.config.composeparent.obj.weblets[id] = new Weblet(this.config.composeparent, document.createElement('div'), id, data['initpar'], config );
          
          if ( this.config.dependweblet && ! data.initpar.notdepend ) this.config.dependweblet.config.depend.push(weblet);
          
          await weblet.load();
          weblet.obj.run.newvalues = true;
      }

      Array.from(this.obj.container.menu.children).forEach((item) => { MneElement.mkClass(item, 'registeractive', item.id == id )})
      
      var weblet = this.config.composeparent.obj.weblets[id];
      weblet.config.depend.forEach((item, index) => { if ( item instanceof MneWeblet && weblet.config.dependid[index] && weblet.config.dependid[index][0] != '#' ) item.config.dependweblet = weblet; })
      
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

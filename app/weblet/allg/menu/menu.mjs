//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/menu/menu.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneRequest from '/js/basic/request.mjs'

import MneView    from '/weblet/basic/view.mjs'
import MneWeblet  from '/weblet/basic/weblet.mjs'

class MneMenu extends MneView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = { notitle : 1, nobuttonframe : 1, classname : 'tree',  };
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  reset()
  {
    super.reset();
  }
  
  getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  async check_values()
  {
    var mustcheck = false;
    var self = this;
    
    this.config.depend.forEach( (item) => { if ( item instanceof MneWeblet ) mustcheck = (item.obj.run.checkdepend === true ) });

    if ( mustcheck && this.obj.act_openmenu != undefined )
      await this.action_submenu(Object.assign({ refresh : true }, this.obj.act_openmenu));

    return super.check_values();
  }
  
  async reload()
  {
    var val = this.obj.run.values;
    await super.reload();
    this.parent.obj.weblets[this.id].obj.run.values = val;
    return false;
  }

  async action_submenu( data, dblclick )
  {
    var i;
    var res;
    var container = data.frame;
    var open = ( ! data.menu ) ? false : (! data.refresh ) && MneElement.hasClass(data.menu, 'menuopen');
    
    if ( dblclick ) return;
    if ( data.menu ) MneElement.mkClass(data.menu, 'menuopen', !open);
    
    this.obj.act_openmenu = undefined;
    
    if ( open ) return;
    
    container.className = this.initpar.classname + 'main';
    container.innerHTML = '';
    
    res = await MneRequest.fetch(this.obj.readurl, this.getReadParam(data));

    await this.mk_submenu( container, res, data);
    this.obj.act_openmenu = data;
    
    return false;
  }

  async action(data, obj, evt )
  {
    try { return await this['action_' + data.values[data.res.rids.action].action](data, evt.detail == 2 ) } catch(e) { console.error(data); e.message += "\nMenu::action: " +  data.values[0].action; throw e }
  }
  
  async query()
  {
    this.obj.lastquery = ! this.obj.lastquery;
    MneElement.mkClass(this.obj.buttons.query, 'active', this.obj.lastquery );
  }
  
}

export default MneMenu

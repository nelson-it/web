//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/menu/menu.mjs
//================================================================================
'use strict';

import MneElement from '/js/basic/element.mjs'
import MneRequest from '/js/basic/request.mjs'

import MneView    from '/weblet/basic/view.mjs'

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
    var p = [];
    var self = this;
    

    this.config.depend.forEach( (item) =>
    {
      if ( item.newvalues && item.obj.run.dependweblet )
      {
        var index;
        var val;
        
        for (index in self.obj.run.values )
        {
          if ( ! mustcheck )
          {
            if ( item.obj.inputs && item.obj.inputs[index] != undefined && ( val = item.obj.inputs[index].getValue(false) != self.obj.run.values[index] ) )
            {
              self.obj.run.values[index] = val;
              mustcheck = true;
            }
            else if ( item.obj.run.values != self.obj.run.values )
            {
              var i;
              for ( i in item.obj.run.values ) self.obj.run.values = item.obj.run.values;
              mustcheck = true;
            }
          }
        }
      }
    });

    if ( mustcheck && this.obj.act_data != undefined )
      p.push (this.action_submenu(Object.assign({ refresh : true }, this.obj.act_data)));

    p.push(super.check_values());

    return Promise.all(p);
  }

  async action_submenu( data, dblclick )
  {
    var i;
    var res;
    var container = data.frame;
    var open = ( ! data.menu ) ? false : (! data.refresh ) && MneElement.hasClass(data.menu, 'menuopen');
    
    if ( dblclick ) return;
    if ( data.menu ) MneElement.mkClass(data.menu, 'menuopen', !open);
    
    this.obj.act_data = undefined;
    
    if ( open ) return;
    
    container.className = this.initpar.classname + 'main';
    container.innerHTML = '';
    
    res = await MneRequest.fetch(this.obj.readurl, this.getReadParam(data));

    this.mk_submenu( container, res, data);
    this.obj.act_data = data;
  }

  async action(data, obj, evt )
  {
    try { await this['action_' + data.values[0].action](data, evt.detail == 2 ) } catch(e) { console.error(data); e.message += "\nMenu::action: " +  data.values[0].action; throw e }
  }
  
  async query()
  {
    this.obj.lastquery = ! this.obj.lastquery;
    MneElement.mkClass(this.obj.buttons.query, 'active', this.obj.lastquery );
  }
  
}

export default MneMenu

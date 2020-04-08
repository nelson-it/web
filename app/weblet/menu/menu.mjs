// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: /weblet/basic/menu.mjs
//================================================================================
'use strict';

import MneElement                  from '/js/basic/element.mjs'
import MneRequest                  from '/js/basic/request.mjs'

import MneViewWeblet               from '../basic/view.mjs'

class MneMenuWeblet extends MneViewWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    super(parent, frame, id, initpar, config )
  }
  
  reset()
  {
    super.reset();
    console.log(this.initpar.weblet)
    this.initpar.weblet = ( typeof this.initpar.weblet == 'string' ) ? this.parent.obj.weblets[this.initpar.weblet] : this.initpar.weblet;

  }
  
  getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  async action_submenu( data )
  {
    var i;
    var res;
    var container = data.frame;
    var open = ( ! data.menu ) ? false : MneElement.hasClass(data.menu, 'menuopen');
    
    if ( data.menu ) MneElement.mkClass(data.menu, 'menuopen', !open);
    
    if ( open ) return;
    
    container.className = this.initpar.classname + 'main';
    container.innerHTML = '';
    
    res = await MneRequest.fetch(this.getReadUrl(data), this.getReadParam(data));

    for ( i=0; i<res.values.length; i++)
    {
      var div = document.createElement('div');
      div.className = 'menu';
      div.innerHTML = '<div class="' + this.initpar.classname + 'link"></div><div class="' + this.initpar.classname + 'main"></div>'
      div.firstChild.innerHTML = res.values[i][1];
      try { res.values[i][2] = JSON.parse(res.values[i][2]) } catch(e) { console.log(res.values[i][2]); throw e }
      this.mkButton(res.values[i][0], div.firstChild, { menu : div, frame : div.lastChild, data : res.values[i] }, 'action');
      container.appendChild(div);
    }
  }
  
  async action(data)
  {
    try { await this['action_' + data.data[2].action](data) } catch(e) { console.error(data); e.message += "\nMenu::action: " +  data.data[2].action; throw e }
  }
  
  async action_show(data)
  {
    await this.initpar.weblet.show(...data.data[2].parameter);
  }
  
  async action_request(data)
  {
    await MneRequest.fetch(data.data[2].parameter[0]);
  }
}

export default MneMenuWeblet

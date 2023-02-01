//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/main/menu.mjs
//================================================================================
'use strict';

import MneConfig        from '/js/basic/config.mjs'
import MneRequest       from '/js/basic/request.mjs'
import MneRecursiveMenu from '/weblet/allg/menu/recursive.mjs'

export class MneMainMenu extends MneRecursiveMenu
{

  constructor(parent, frame, id = 'main', initpar = {}, config = {} )
  {
    var ivalues =
    {
        notitleframe : 1,
        classname : 'menu',
        name : window.mne_application ?? 'main',

    };

    super( parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  reset()
  {
    super.reset();

    this.obj.readurl = 'db/utils/query/data.json';
    this.obj.readparam =
    {
      schema : 'mne_application',
      query  : 'menu',
      cols   : "action,item,menuid,typ,pos",
      scols  : "pos",
      wcol   : 'mymenu,menuname,parentid',
      wop    : "=,=,=",
      distinct : 1,
      lastquery : "",
      sqlstart : 1,
      sqlend : 1
    }

    this.obj.weblet = ( typeof this.initpar.weblet == 'string' ) ? this.parent.obj.weblets[this.initpar.weblet] : this.initpar.weblet;
  }


  getReadParam(data)
  {
    var par = Object.assign({}, this.obj.readparam);
    par.wval = 'true,' + this.initpar.name + "," + data.values[data.res.rids.menuid];
    
    return par;
  }
  
  async values()
  {
    await this.action_submenu( { menu : null, values : ['','',''], res : { rids : { action : 0, menuid : 2 }}, frame : this.obj.container.content});
    this.frame.setAttribute('menuready', true);
  }
  
  async action_show(data)
  {
    var aid = data.res.rids.action;
    
    window.sessionStorage.setItem(window.mne_application + ':startweblet', JSON.stringify(data.values[aid].parameter[0]));
    await this.obj.weblet.show(data.values[aid].parameter[0]);
  }
  
  async action_request(data)
  {
    await MneRequest.fetch(data.values[data.res.rids.action].parameter[0]);
  }

  async action_location(data)
  {
    window.location = data.values[data.res.rids.action].parameter[0];
  }

  async action_menu(data)
  {
    if ( this.initpar.name == data.values[data.res.rids.action].parameter[0] )
      return;
    
    window.mne_application = this.initpar.name = data.values[data.res.rids.action].parameter[0];
    window.history.replaceState(null, document.title, location.origin + '/' + window.mne_application );

    var startweblet = window.sessionStorage.getItem(window.mne_application + ':startweblet');
    try { startweblet = JSON.parse(startweblet); } catch(e) { console.warn(e); console.warn(startweblet), startweblet = undefined; }

    await this.obj.weblet.show(startweblet);

    return this.values();
  }
}

export default MneMainMenu

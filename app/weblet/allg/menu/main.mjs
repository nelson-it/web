//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/menu/main.mjs
//================================================================================
'use strict';

import MneRequest       from '/js/basic/request.mjs'
import MneRecursiveMenu from './recursive.mjs'

export class MneMainMenu extends MneRecursiveMenu
{

  constructor(parent, frame, id = 'main', initpar = {}, config = {} )
  {
    var ivalues =
    {
        notitleframe : 1,
        classname : 'menu',
        name : 'main',

    };

    super( parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  reset()
  {
    super.reset();

    this.obj.readurl = '/db/utils/query/data.json';
    this.obj.readparam =
    {
      schema : 'mne_application',
      query  : 'menu',
      cols   : "action,item,menuid,typ,pos",
      scols  : "pos",
      wcol   : 'menuname,parentid',
      wop    : "=,=",
      wval   : this.name + ',',
      distinct : 1,
      lastquery : "",
      sqlend : 1
    }

    this.obj.weblet = ( typeof this.initpar.weblet == 'string' ) ? this.parent.obj.weblets[this.initpar.weblet] : this.initpar.weblet;
  }


  getReadParam(data)
  {
    var par = Object.assign({}, this.obj.readparam);
    par.wval = this.initpar.name + "," + data.values[2];
    
    return par;
  }
  
  async values()
  {
    this.action_submenu( { menu : null, values : ['','',''], frame : this.obj.container.content})
  }
  
  async action_show(data)
  {
    window.sessionStorage.setItem(window.mne_application + ':startweblet', JSON.stringify(data.values[0].parameter));
    await this.obj.weblet.show(...data.values[0].parameter);
  }
  
  async action_request(data)
  {
    await MneRequest.fetch(data.values[0].parameter[0]);
  }

  async action_location(data)
  {
    window.location = data.values[0].parameter[0];
  }

}

export default MneMainMenu

// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: weblet/basic/menu_main.mjs
//================================================================================
'use strict';
import MneMenuWeblet from './menu.mjs'

export class MneMainMenuWeblet extends MneMenuWeblet
{

  constructor(parent, frame, id = 'main', initpar = { name : 'main' }, config = {} )
  {
    initpar.nowebletframe = 1;
    initpar.classname = 'menu';
    
    super( parent, frame, id, initpar, config );

    this._readurl = '/db/utils/query/data.json';
    this._readparam =
    {
        schema : 'mne_application',
        query  : 'menu',
        cols   : "menuid,item,action,typ,pos",
        scols  : "pos",
        wcol   : 'menuname,parentid',
        wop    : "=,=",
        wval   : this.name + ',',
        distinct : 1,
        lastquery : "",
        sqlend : 1
    }
  }


  getReadParam(data)
  {
    var par = Object.assign({}, this._readparam);
    par.wval = this.initpar.name + "," + data.data[0];
    
    return par;
  }
  
  getReadUrl(data)
  {
    return this._readurl;
  }
  
  async action_show(data)
  {

    window.localStorage.setItem('startweblet', JSON.stringify(data.data[2].parameter));
    await super.action_show(data);
  }
  
  async values()
  {
    this.action_submenu( { menu : null, data : [''], frame : this.obj.container.content})
  }
}

export default MneMainMenuWeblet

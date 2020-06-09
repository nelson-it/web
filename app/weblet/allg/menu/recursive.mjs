//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/menu/recursive.mjs
//================================================================================
'use strict';

import MneElement from '/js/basic/element.mjs'
import MneRequest from '/js/basic/request.mjs'

import MneMenu from './menu.mjs'

class MneRecursiveMenu extends MneMenu
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    super(parent, frame, id, initpar, config );
  }
  
  reset ()
  {
    super.reset();

    this.obj.readurl = ( this.initpar.query ) ? '/db/utils/query/data.json' : '/db/utils/table/data.json'

      this.obj.readparam =
      {
        schema : this.initpar.schema,
        cols : this.initpar.cols,
        scols : this.initpar.scols,
        distinct : ( this.initpar.distinct ) ? '1' : '',
        sqlend : 1
      }

    if ( this.initpar.query ) this.obj.readparam.query = this.initpar.query;
    if ( this.initpar.table ) this.obj.readparam.table = this.initpar.table;

    this.obj.readparam.wcol = this.initpar.showids.join(',');
    this.obj.readparam.wop = (Array(this.initpar.showids.length).fill('=')).join(',')
  }
  
  getReadParam(data)
  {
    var par = Object.assign({sqlend : 1}, this.obj.readparam);
    if ( this.obj.lastquery ) par.lastquery = 1;
    par.wval += ',' + data.values[2];
    console.log(par)
    return par;
  }
  
  mk_submenu( container, res )
  {
    var i;
    
    for ( i=0; i<res.values.length; i++)
    {
      var div = document.createElement('div');
      try { res.values[i][0] = JSON.parse(res.values[i][0]) } catch(e) { console.log(res.values[i][0]); throw e }
      div.className = this.initpar.classname + (( res.values[i][0].action == 'submenu' || res.values[i][res.rids['typ']] != 'leaf' ) ? '' : 'leaf');
      div.innerHTML = '<div class="' + this.initpar.classname + 'link"></div><div class="' + this.initpar.classname + 'main"></div>'
      div.firstChild.innerHTML = res.values[i][1];
      this.mkButton(res.values[i][0], div.firstChild, { menu : div, frame : div.lastChild, values : res.values[i] }, 'action');
      container.appendChild(div);
    }
  }
  
  async values()
  {
    var i;
    console.log(this.config.dependweblet.obj.run.values)
    for( i =0; i<this.initpar.showids.length - 1; i++)
      this.obj.readparam.wval = this.config.dependweblet.obj.run.values[this.initpar.showids[i]];
    
    this.action_submenu( { menu : null, values : [{}, '', '', '', ''], frame : this.obj.container.content})
  }
  
  async action_show(data)
  {
    if ( data.values[4] != 'leaf' )
      await this.action_submenu(data);
    
    this.obj.run.values.menuid = data.values[0].parameter[0];
    this.obj.run.values.itemname = data.values[0].parameter[1];
    try { this.obj.run.values.action = JSON.parse(data.values[0].parameter[2]); } catch(e) { this.obj.run.values.action = data.values[0].parameter[2]; }
    
    this.newselect = true;
  }

}

export default MneRecursiveMenu

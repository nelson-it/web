//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/menu/recursive.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
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

    if ( ! this.initpar.url )
    {

      this.obj.readurl = ( this.initpar.query ) ? '/db/utils/query/data.json' : '/db/utils/table/data.json'

        this.obj.readparam =
        {
          schema : this.initpar.schema,
          cols : this.initpar.cols,
          scols : this.initpar.scols,
          distinct : ( this.initpar.distinct ) ? '1' : '',
              wval : '',
              sqlend : 1
        }

      if ( this.initpar.query ) this.obj.readparam.query = this.initpar.query;
      if ( this.initpar.table ) this.obj.readparam.table = this.initpar.table;

      this.obj.readparam.wcol = this.initpar.showids.join(',');
      this.obj.readparam.wop = (Array(this.initpar.showids.length).fill('=')).join(',')
    }
    else
    {
      this.obj.readurl = this.initpar.url;
      this.obj.readparam = Object.assign({ wcol : '', wop : '', wval : '' }, this.initpar.readparam );
    }
  }
  
  getReadParam(data)
  {
    var par = Object.assign({sqlend : 1}, this.obj.readparam);
    if ( this.obj.lastquery ) par.lastquery = 1;
    par.wval += (( par.wval == '' ) ? '' : ',' ) + data.values[data.res.rids.menuid];
    return par;
  }
  
  mk_submenu( container, res )
  {
    var i;
    var r = Object.assign({}, res);
    r.values = [];
    
    for ( i=0; i<res.values.length; i++)
    {
      var div = document.createElement('div');
      try { res.values[i][res.rids.action] = JSON.parse(res.values[i][res.rids.action]) } catch(e) { console.log(res.values[i][res.rids.action]); throw e }
      div.className = this.initpar.classname + (( res.values[i][res.rids.action].action == 'submenu' || res.values[i][res.rids['typ']] != 'leaf' ) ? '' : 'leaf');
      div.innerHTML = '<div class="' + this.initpar.classname + 'link"></div><div class="' + this.initpar.classname + 'main"></div>'
      div.firstChild.innerHTML = res.values[i][1];
      if ( res.rids.status && res.values[i][res.rids.status] ) MneElement.mkClass(div.firstChild, 'treelink' + res.values[i][res.rids.status] );
      this.mkButton(res.values[i][0], div.firstChild, { menu : div, frame : div.lastChild, values : res.values[i], res : r }, 'action');
      container.appendChild(div);
    }
  }
  
  async values()
  {
    var i;
    for( i =0; i<this.initpar.showids.length - 1; i++)
    {
      var val;
      var w = this.config.dependweblet;
      if ( this.initpar.showalias && this.initpar.showalias[i] )
        val = this.initpar.showalias[i]();
      else
        val = w.obj.run.values[showids[i]];
      this.obj.readparam.wval = val + ',';
    }
    this.obj.readparam.wval = this.obj.readparam.wval.substring(0, this.obj.readparam.wval.length - 1)
    
    await this.action_submenu( { menu : null, values : [{}, '', '', '', ''], res : { rids : { action : 0, menuid : 2 }}, frame : this.obj.container.content})
  }
  
  async action_show(data)
  {
    var rids = data.res.rids;
    var action = data.values[rids.action];
    
    if ( data.values[rids.typ] != 'leaf' )
      await this.action_submenu(data);
    
    this.obj.run.values.menuid = action.parameter[0];
    this.obj.run.values.itemname = action.parameter[1];
    for ( var i in action.parameter[2] )
      this.obj.run.values[i] = action.parameter[2][i];
    
    this.newselect = true;
  }

}

export default MneRecursiveMenu

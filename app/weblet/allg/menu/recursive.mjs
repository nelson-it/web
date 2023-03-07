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
import MneInput   from '/js/basic/input.mjs'

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

    this.obj.readurl = this.initpar.url ?? (( this.initpar.query ) ? 'db/utils/query/data.json' : 'db/utils/table/data.json');
    this.obj.readparam =
    {
      cols     : this.initpar.cols,
      scols    : this.initpar.scols,
      distinct : ( this.initpar.distinct ) ? '1' : '',
      sqlstart : 1,
      sqlend   : 1
    }

    this.obj.readparam.wcol = ( this.initpar.showids && this.initpar.showids.length ) ? this.initpar.showids.join(',') : ( this.initpar.wcol ?? '' );
    this.obj.readparam.wop  = ( this.initpar.showids && this.initpar.showids.length) ? (Array(this.initpar.showids.length).fill('=')).join(',') : ( this.initpar.wop ?? '' );
    this.obj.readparam.wval = ( this.initpar.showids && this.initpar.showids.length) ? (Array(this.initpar.showids.length).fill('')).join(',') : ( this.initpar.wval ?? '' );
    this.obj.readparam = Object.assign(this.obj.readparam, this.initpar.readparam );

    if ( ! this.initpar.url )
    {
      this.obj.readparam.schema = this.initpar.schema;
      if ( this.initpar.query ) this.obj.readparam.query = this.initpar.query;
      if ( this.initpar.table ) this.obj.readparam.table = this.initpar.table;
    }
    
    this.obj.run.values = [{ parameter : [ "", "", {} ] }, '', '', '', ''];

  }
  
  async load()
  {
    await super.load();
    this.obj.container.tree = this.obj.container.content;
  }
  
  getReadParam(data)
  {
    var par = Object.assign({sqlend : 1, sqlstart : 1 }, this.obj.readparam);
    if ( this.obj.lastquery ) par.lastquery = 1;
    par.wval += data.values[data.res.rids.menuid];
    return par;
  }
  
  mk_submenu( container, res, data )
  {
    var i;
    var r = Object.assign({}, res);
    var actioncol = res.rids.action ?? this.initpar.actioncol;
    
    r.values = [];
    
    for ( i=0; i<res.values.length; i++)
    {
      var div = document.createElement('div');
      try { res.values[i][actioncol] = JSON.parse(res.values[i][actioncol]) } catch(e) { console.log(res.values[i][actioncol]); throw e }
      div.className = this.initpar.classname + (( res.values[i][res.rids['typ']] != 'leaf' ) ? '' : 'leaf');
      div.innerHTML = '<div class="' + this.initpar.classname + 'link"></div><div class="' + this.initpar.classname + 'main"></div>'
      div.firstChild.innerHTML =  MneInput.format(res.values[i][1], res.typs[1], res.formats[1]);
      if ( res.rids.status && res.values[i][res.rids.status] ) MneElement.mkClass(div.firstChild, 'treelink' + res.values[i][res.rids.status] );
      this.mkButton('treelink', div.firstChild, { parent : data, menu : div, frame : div.lastChild, values : res.values[i], res : r }, 'action');
      container.appendChild(div);
    }
  }
  
  async action_show(data)
  {
    var rids = data.res.rids;
    var action = data.values[this.initpar.actioncol ?? rids.action]; 
    if ( data.values[rids.typ] != 'leaf' )
      await this.action_submenu(data);
    
    this.obj.run.values.menuid = action.parameter[0];
    this.obj.run.values.itemname = action.parameter[1];
    for ( var i in action.parameter[2] )
      this.obj.run.values[i] = action.parameter[2][i];
    
    this.newselect = true;
  }

  async values()
  {
    var i;
    var rids = { action : 0, menuid : 2 };
    var wval = '';
    
    for( i =0; i<this.initpar.showids.length - 1; i++)
    {
      var val;
      var w = this.config.dependweblet;
      if ( this.initpar.showalias && this.initpar.showalias[i] )
        val = this.initpar.showalias[i]();
      else
        val = w.obj.run.values[this.initpar.showids[i]];
      wval += (val + ',');
    }
    
    if ( this.initpar.showids && this.initpar.showids.length ) this.obj.readparam.wval = wval;
    
    await this.action_submenu( { menu : null, values : this.obj.run.values, res : { rids : rids }, frame : this.obj.container.tree});
  }
}

export default MneRecursiveMenu

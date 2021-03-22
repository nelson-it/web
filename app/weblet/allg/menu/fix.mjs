//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/menu/fix.mjs
//================================================================================
'use strict';
import MneElement from '/js/basic/element.mjs';
import MneInput   from '/js/basic/input.mjs';

import MneMenu from './menu.mjs'

export class MneFixMenu extends MneMenu
{

  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    super( parent, frame, id, initpar, config );

  }
  
  reset()
  {
    super.reset();

    this.obj.readparam =
    {
        schema : this.initpar.schema,
        wcol   : this.initpar.wcol,
        wop    : this.initpar.wop,
        wval   : this.initpar.wval,
        distinct : 1,
        sqlstart : 1,
        sqlend : 1
    }
    
    if ( this.initpar.query ) this.obj.readparam.query = this.initpar.query;
    if ( this.initpar.table ) this.obj.readparam.table = this.initpar.table;
    
    this.obj.readurl = this.initpar.url ?? (( this.initpar.query ) ? 'db/utils/query/data.json' : 'db/utils/table/data.json')

    this.obj.cols = this.initpar.cols.split(',');
    this.obj.showcolnames = ( this.initpar.showcolnames ) ? this.initpar.showcolnames.split(',') : this.initpar.showcols.split(',');
  }

  getReadParam(data)
  {
    var par = Object.assign({}, this.obj.readparam);
    var i;
    var actionid = 0;
    
    if ( data.values[0].deep == this.obj.cols.length - 1 )
    {
      par.cols = this.obj.cols[data.values[actionid].deep] + ',' + this.initpar.showcols; 
    }
    else
    {
      par.cols = this.obj.cols[data.values[actionid].deep]; 
    } 

    par.scols = this.obj.cols[data.values[actionid].deep];

    par.wcol = data.values[actionid].wcol;
    par.wop  = data.values[actionid].wop;
    par.wval = data.values[actionid].wval;
    if ( this.obj.lastquery ) par.lastquery = 1;

    return par;
  }
  
  mk_submenu( container, res, data )
  {
    var i;
    
    for ( i=0; i<res.values.length; i++)
    {
      var div = document.createElement('div');
      var values = {};
      var classname;
      
      if ( res.ids.length > 1 )
      {
        values.action = 'show';
        values.values = res.values[i]
        classname = this.initpar.classname + 'leaf';
      }
      else
      {
        values.action = 'submenu';
        values.deep = data.values[0].deep + 1;
        values.wcol = (( data.values[0].wcol ) ? data.values[0].wcol + ',' : '' ) + res.ids[0];
        values.wop  = (( data.values[0].wop  ) ? data.values[0].wop  + ',' : '' ) + '=';
        values.wval = (( data.values[0].wval ) ? data.values[0].wval + ',' : '' ) + res.values[i][0];

        classname = this.initpar.classname;
      }
      div.className = classname;
      div.innerHTML = '<div class="' + this.initpar.classname + 'link"></div><div class="' + this.initpar.classname + 'main"></div>'
      div.firstChild.innerHTML = MneInput.format(res.values[i][0], res.typs[0], res.formats[0]);

      this.mkButton(res.values[i][0], div.firstChild, { menu : div, frame : div.lastChild, values : [ values ], parent : data, res : { rids : { action : 0 }} } , 'action');
      container.appendChild(div);
    }
  }

  async values()
  {
    var i;
    var values = {};
    
    values.action = 'submenu';
    values.deep = 0;
    values.wcol = ( this.initpar.wcol ) ? this.initpar.wcol : '';
    values.wop  = ( this.initpar.wop  ) ? this.initpar.wop  : '';
    values.wval = ( this.initpar.wval ) ? this.initpar.wval : '';
    await this.action_submenu( { menu : null, frame : this.obj.container.content, values : [ values ] })

  }
  
  async action_show(data, dblclick)
  {
    var i;
    
    if ( dblclick ) return;
    
    for ( i =0; i<this.obj.showcolnames.length; i++)
      this.obj.run.values[this.obj.showcolnames[i]] = data.values[0].values[i+1];
    
    this.newselect = true;
  }
}

export default MneFixMenu

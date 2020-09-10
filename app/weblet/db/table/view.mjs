//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/db/table/view.mjs
//================================================================================
'use strict';

import MneConfig     from '/js/basic/config.mjs'
import MneText       from '/js/basic/text.mjs'
import MneLog        from '/js/basic/log.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneRequest    from '/js/basic/request.mjs'

import MneWeblet  from '/weblet/basic/weblet.mjs'
import MneDbTableBasic from './basic.mjs'

class MneDbTableView extends MneDbTableBasic
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  async check_values()
  {
    var mustcheck = false;
    this.config.depend.forEach( (item) => { if ( item instanceof MneWeblet ) mustcheck = (item.obj.run.checkdepend === true ) });

    if ( mustcheck )
       await this.refresh();

    return super.check_values();
  }
  
  async add()
  {
     var row = this.obj.tbody.insertRow(this.obj.lastselect);
     var str = '';
     var i;
     var res = this.select;
     var self = this;

     row.okaction = 'add';
     row.values = ( res.values.length > 0 ) ? [... res.values[0]] : new Array(res.ids.length).fill('');

     for ( i in this.config.dependweblet.obj.run.values )
       if ( res.rids[i] != undefined ) row.values[res.rids[i]] = this.config.dependweblet.obj.run.values[i];
     
     for ( i in this.obj.defvalues )
       row.values[res.rids[i]] = this.obj.defvalues[i];
     
     for ( i=0; i< this.initpar.okids.length; ++i )
       row.values[res.rids[this.initpar.okids[i]]] = (this.obj.defvalues[this.initpar.okids[i]] != undefined ) ? this.obj.defvalues[this.initpar.okids[i]] : '################';

     for ( i=0; i< this.initpar.showids.length; ++i )
       row.values[res.rids[this.initpar.showids[i]]] = (this.obj.defvalues[this.initpar.showids[i]] != undefined ) ? this.obj.defvalues[this.initpar.showids[i]] : this.config.dependweblet.obj.run.values[this.initpar.showids[i]];

     for ( i =0; i< this.obj.run.result.ids.length; ++i)
       if ( ! this.obj.colhide[i] ) str += '<td>' + await this.mkCol(i, row.values[i]) + '</td>';
     
     row.innerHTML = str;
     row.addEventListener('click', function(evt) { self.btnClick('rowclick', {}, this, evt); }, true);
     await this.selectRow({type : 'add'}, row, {});
     
     for ( i=0; i<this.obj.cols.length; ++i)
       if ( this.obj.inputs[this.obj.cols[i]] ) { this.obj.inputs[this.obj.cols[i]].setAttribute('oldvalue', ''); }
     
     for ( i=0; i<this.obj.cols.length; ++i)
       if ( this.obj.inputs[this.obj.cols[i]] ) { this.obj.inputs[this.obj.cols[i]].focus(); break; }
     
     this.obj.run.okaction = 'add';
  }

  primarykey()
  {
    var skey;
    if ( this.initpar.primarykey )
    {
      skey = {};
      this.initpar.primarykey.forEach((item) =>
      {
        skey[item] = this.obj.run.values[item]; 
      })
    this.obj.run.selectedkeys.push(skey);
    }
  }
  
  async ok(param)
  {
    if ( this.obj.buttons.ok ) 
    {
      var i,j;
      var rows = this.obj.tbody.children;
      var retval = false;
      
      this.obj.run.selectedkeys = [];
      
      for ( i=0; i<rows.length; i++)
      {
        if ( rows[i].ismodify || rows[i].querySelector('.modifyok') != null ) 
        {
          retval = true;
          await this.selectRow({force : true}, rows[i] )
          this.primarykey();
          await super.ok(param);
        }
      }
      this.dependweblet = undefined;
    }
    return retval;
  }
  
  async del()
  {
    var sel = this.select;

    this.obj.run.selectedkeys = [];
    if ( sel.values.length > 0 && this.del_confirm( sel.values.length > 1 ))
    {
      var i,j;

      for ( i=0; i<sel.values.length; i++)
      {
        for ( j = 0; j<this.obj.run.result.ids.length; ++j)
          this.obj.run.values[this.obj.run.result.ids[j]] = sel.values[i][j];

        await super.del({noask : true });
      }
      this.dependweblet = undefined;
    }
  }

  async cancel()
  {
    this.unselectRows();
    this.obj.run.selectedkeys = [];
    await super.cancel();
  }
  
  async detail()
  {
    await this.openpopup(this.initpar.detailweblet);
    this.obj.weblets[this.initpar.detailweblet].config.depend.push(this);
    return false;
  }

  async detailscreen()
  {
    var values = {};
    var defvals = {};
    
    Object.keys(this.initpar.detailvalues).forEach( ( item ) => { values[item] = this.obj.run.values[this.initpar.detailvalues[item]]})
    Object.keys(this.initpar.detaildefvalues).forEach( ( item ) =>
    {
      defvals[item] = { defvalues : {} };
      Object.keys(this.initpar.detaildefvalues[item]).forEach( (subitem ) => {  defvals[item].defvalues[subitem] = this.obj.run.values[this.initpar.detaildefvalues[item][subitem]]});
    });
    
    this.showweblet(this.initpar.detailscreen, values, defvals);
    return false;
  }
  
  async detailmod()
  {
    await this.openpopup(this.initpar.detailmodweblet);
    this.obj.weblets[this.initpar.detailmodweblet].config.depend.push(this);
    return false;
  }
  
  async detailadd()
  {
    await this.openpopup(this.initpar.detailaddweblet);
    this.obj.weblets[this.initpar.detailaddweblet].config.depend.push(this);
    return false;
  }

  async detaildel()
  {
    var name = this.initpar.detailweblet;
    await this.openpopup(name, true);
    await this.obj.weblets[name].values();
    await this.obj.weblets[name].del();
    this.obj.weblets[name].dependweblet = undefined;
    return this.refresh();
  }
  
  async dblclick()
  {
    if ( this.initpar.detailweblet )
      return this.detail();
    else if ( this.initpar.detailscreen )
      return this.detailscreen()
  }
}

export default MneDbTableView

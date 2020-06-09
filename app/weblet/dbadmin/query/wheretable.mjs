//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/query/wheretable.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement   from '/js/basic/element.mjs'

import MneDbTableBasic from '/weblet/db/table/basic.mjs'

class MneAdminQueryWhereTable extends MneDbTableBasic
{
  reset()
  {
    super.reset();
    this.obj.mkbuttons = 
    [
      { id : 'ok',   value : MneText.getText('#mne_lang#Ok') },

      { id : 'up',   value : unescape("%uf077"), font : 'SymbolFont1', space : 'before' },
      { id : 'down', value : unescape("%uf078"), font : 'SymbolFont1' },

      { id : 'add',  value : MneText.getText("#mne_lang#neue Zeile"), space : 'before' },
      { id : 'del',  value : MneText.getText("#mne_lang#Löschen") },
   ];
    
    this.obj.enablebuttons.buttons.push('up');
    this.obj.enablebuttons.buttons.push('down');
    this.obj.enablebuttons.buttons.push('del');

    this.obj.enablebuttons.select.push('up');
    this.obj.enablebuttons.select.push('down');
    this.obj.enablebuttons.select.push('del');
  }
  
  async drop(data, evt)
  {
    var shortid = evt.target.getAttribute('shortid');
    
    if ( shortid == null || evt.target.tagName == 'TD' )
      await this.add();
    else
    {
      var ele = evt.target;
      while ( ele != null && ele.tagName != 'TR' ) ele = ele.parentNode;
      if ( ele != null ) this.selectRow({force : true }, ele);
      else return;
    }

    if ( shortid == 'righttab' || shortid == 'rightvalue' )
    {
      this.obj.run.act_row.obj.inputs.righttab.modValue(data.tabnum);
      this.obj.run.act_row.obj.inputs.rightvalue.modValue(data.column);
    }
    else
    {
      this.obj.run.act_row.obj.inputs.lefttab.modValue(data.tabnum);
      this.obj.run.act_row.obj.inputs.leftvalue.modValue(data.column);
    }
  }
  
  async add()
  {
    var row = this.obj.tbody.insertRow(-1);
    var i;
    var str;
    var self = this;
    
    row.values = new Array(this.obj.run.result.ids.length).fill('');

    str = '';
    for ( i =0; i< this.obj.run.result.ids.length; ++i)
      if ( ! this.obj.colhide[i] ) str += '<td>' + await this.mkCol(i, row.values[i]) + '</td>';
    
    row.innerHTML = str;
    row.addEventListener('click', function(evt) { self.btnClick('rowclick', {}, this, evt); }, true);

    this.obj  = Object.assign(this.obj, { inputs  : {}, outputs : {} });
    MneElement.mkElements(row);
    await this.findIO(row);
    row.obj = { inputs : this.obj.inputs, outputs : this.obj.outputs }

    for ( i in this.obj.inputs )
    {
      var rr = this.obj.run.result.rids[i];
      this.obj.inputs[i].setTyp(this.obj.run.result.typs[rr], this.obj.run.result.regexps[rr], this.obj.run.result.formats[rr]);
      this.obj.inputs[i].setValue('########');
      this.obj.inputs[i].modValue((row.values[rr]) ? row.values[rr] : ( this.initpar.defvalues[i] ?? '' ));
    }
    
    await this.selectRow({type : 'mod'}, row, {});
    
    for ( i=0; i<this.obj.cols.length; ++i)
      if ( this.obj.inputs[this.obj.cols[i]] ) { this.obj.inputs[this.obj.cols[i]].focus(); break; }
 
  }
  
  async up()
  {
    if ( this.obj.lastselect > 0 && this.obj.lastselect < this.obj.tbody.rows.length )
    {
      var r1 = this.obj.tbody.rows[this.obj.lastselect];
      var r2 = this.obj.tbody.rows[this.obj.lastselect - 1];

      r1.parentNode.removeChild(r1);
      r2.parentNode.insertBefore(r1,r2);
      
      this.selectRow({force : true }, r1);
      
      MneElement.mkClass(this.obj.buttons.up,'modifyok');
    }
  }
  
  async down()
  {
    if ( this.obj.lastselect >=0 && this.obj.lastselect < this.obj.tbody.rows.length - 1)
    {
      var r1 = this.obj.tbody.rows[this.obj.lastselect];
      var r2 = this.obj.tbody.rows[this.obj.lastselect + 1];

      r2.parentNode.removeChild(r2);
      r1.parentNode.insertBefore(r2,r1);

      this.obj.act_row = undefined;
      this.selectRow({force : true }, r1);
      
      MneElement.mkClass(this.obj.buttons.down,'modifyok');
    }
  }

  async ok()
  {
    return this.config.composeparent.obj.weblets.detail.ok();
  }

  async del()
  {
    if ( this.confirm( MneText.sprintf(MneText.getText('#mne_lang#Zeile $1 wirklich löschen'), this.obj.lastselect) ) )
    {
      this.obj.tbody.deleteRow(this.obj.lastselect);
      return this.config.composeparent.obj.weblets.detail.ok();
    }
  }
  
  async values()
  {
    Object.entries(this.obj.buttons).forEach( (item ) => { MneElement.clearClass(item[1],'modifyok'); });
    return super.values();
  }

}

export default MneAdminQueryWhereTable;

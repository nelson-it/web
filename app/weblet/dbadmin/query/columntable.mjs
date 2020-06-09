//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/query/columntable.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement   from '/js/basic/element.mjs'

import MneDbTableBasic from '/weblet/db/table/basic.mjs'

class MneDbAdminQueryColumnTable extends MneDbTableBasic
{
  reset()
  {
    super.reset();
    this.obj.mkbuttons = 
    [
      { id : 'ok',   value : MneText.getText('#mne_lang#Ok') },

      { id : 'up',   value : unescape("%uf077"),                   font : 'SymbolFont1', space : 'before' },
      { id : 'down', value : unescape("%uf078"),                   font : 'SymbolFont1' },
      
      { id : 'addfunc', value : MneText.getText("#mne_lang#neue Zeile"), space : 'before' },
      { id : 'del',   value : MneText.getText("#mne_lang#Löschen")                      },
   ];
    
    this.obj.enablebuttons.buttons.push('up');
    this.obj.enablebuttons.buttons.push('down');

    this.obj.enablebuttons.select.push('up');
    this.obj.enablebuttons.select.push('down');
  }
  
  drop(data)
  {
    this.addcol(data);
  }

  async addrow(values)
  {
    var row = this.obj.tbody.insertRow(-1);
    var i;
    var str;
    var self = this;
    
    row.values = (values ) ? values : new Array(this.obj.run.result.ids.length).fill('');

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
      this.obj.inputs[i].modValue(row.values[rr]);
    }
    
    await this.selectRow({type : 'mod'}, row, {});
    
    for ( i=0; i<this.obj.cols.length; ++i)
      if ( this.obj.inputs[this.obj.cols[i]] ) { this.obj.inputs[this.obj.cols[i]].focus(); break; }
 
  }
  
  async addfunc()
  {
    var values  = new Array(this.obj.run.result.ids.length).fill('');
    values[this.obj.run.result.rids.tnr] = -1
    values[this.obj.run.result.rids.typ] = 2;
    await this.addrow(values);
  }

  async addcol(val)
  {
    var values  = new Array(this.obj.run.result.ids.length).fill('');
    values[this.obj.run.result.rids.schema] = val['schema'];
    values[this.obj.run.result.rids.table] = val['table'];
    values[this.obj.run.result.rids.tabnum] = val['tabnum'];
    values[this.obj.run.result.rids.field] = val['column'];
    values[this.obj.run.result.rids.columnid] = val['column'];
    values[this.obj.run.result.rids.typ] = -1;
    
    await this.addrow(values);
    
    this.obj.inputs.text_de.setAttribute('placeholder', val['text_de']);
    this.obj.inputs.text_en.setAttribute('placeholder', val['text_en']);

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

  async del()
  {
    if ( this.confirm( MneText.sprintf(MneText.getText('#mne_lang#Zeile $1 wirklich löschen'), this.obj.lastselect) ) )
    {
      this.obj.tbody.deleteRow(this.obj.lastselect);
      return this.config.composeparent.obj.weblets.detail.ok();
    }
  }
  
  async ok()
  {
    return this.config.composeparent.obj.weblets.detail.ok();
  }
  
  async rowclick(data, row, evt)
  {
    await super.rowclick(data, row, evt);
    return false;
  }
  
  async values()
  {
    Object.entries(this.obj.buttons).forEach( (item ) => { MneElement.clearClass(item[1],'modifyok'); });
    return super.values();
  }
  
}

export default MneDbAdminQueryColumnTable;

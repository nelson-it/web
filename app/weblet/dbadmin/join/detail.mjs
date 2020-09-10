//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/join/detail.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneInput    from '/js/basic/input.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbView   from '/weblet/db/view.mjs'

class MneDbadminJoin extends MneDbView
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
          schema : 'mne_application',
          query  : 'join_all',
          table  : 'joindef',
        showids : ['joindefid'],
        
        drop : true,
        dropwait : [ 'firsttab', 'secondtab' ],
        
        selectlists: { typ :  'jointype' },

        delbutton : [ 'add', 'cancel'],
        hinput : false 
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    
    reset()
    {
      super.reset();
      this.obj.mkbuttons.push({ id : 'func', value : MneText.getText("#mne_lang#Ausdruck") })
      
    }
    
    async load()
    {
      await super.load();
      this.obj.op = this.obj.inputs.op.closest('.ele-wrapper');
      this.obj.opparent = this.obj.op.parentNode;
      this.obj.opparent.removeChild(this.obj.op);
      
      this.obj.tables.content.innerHTML = '<table class="border padding top disable-select relative" tabindex=1><thead><tr>'
                                       + '<td>' + MneText.getText('#mne_lang#erste Tabelle') + '</td>'
                                       + '<td>' + MneText.getText('#mne_lang#Operator') + '</td>'
                                       + '<td>' + MneText.getText('#mne_lang#zweite Tabelle') + '</td>'
                                       + '</tr></thead><tbody></tbody></table>';
      
      this.obj.tbody = this.obj.tables.content.firstChild.lastChild;
      
    }

    
    mkCol(id, value)
    {
      return MneElement.getSpan('<span id="'+ id + '">' + value + '</span>');
    }

    async addrow(values)
    {
      var row = this.obj.tbody.insertRow(-1);
      var i;
      var str;
      var self = this;
      var defvalues = { firstcolumn : '', operator : '=', secondcolumn : '' };
      var id = ['firstcolumnInput', 'operatorInput', 'secondcolumnInput'];
      row.values = values ?? defvalues;

      str = '';
      for ( i =0; i< 3; ++i)
        str += '<td>' + this.mkCol(id[i], row.values[i]) + '</td>';
      
      row.innerHTML = str;
      row.addEventListener('click', function(evt) { self.btnClick('rowclick', {}, this, evt); }, true);
      
      var inputs = this.obj.inputs;
      var outputs = this.obj.outputs;

      this.obj  = Object.assign(this.obj, { inputs  : {}, outputs : {} });
      MneElement.mkElements(row);
      await this.findIO(row);
      row.obj = { inputs : this.obj.inputs, outputs : this.obj.outputs }
      for ( i in row.obj.inputs )
      {
        row.obj.inputs[i].setTyp('char', MneInput.checktype.notempty, '');
        row.obj.inputs[i].setValue('')
        row.obj.inputs[i].modValue(values[i])
      }
      
      this.obj.inputs = inputs;
      this.obj.outputs = outputs;
      
      this.rowclick({}, row)
    }
    
    async drop(data, evt)
    {
      var ele = evt.target;
      while ( ele != null && ele.tagName != 'TR' && ele != this.obj.container.content ) ele = ele.parentNode;

      if ( ele != this.obj.container.content )
        (( data.dropfrom == 'firsttab') ? ele.obj.inputs.firstcolumn : ele.obj.inputs.secondcolumn ).setValue(data.column);
      else
        await this.addrow( ( data.dropfrom == 'firsttab') ? { firstcolumn : data.column, operator : '=', secondcolumn : '' } : { firstcolumn : '', operator : '=', secondcolumn : data.column } );
    }

    async rowclick(data, row, evt = {} )
    {
      this.obj.run.act_row = ( this.obj.run.act_row == undefined || row != this.obj.run.act_row ) ? row : undefined;
      Array.from(this.obj.tbody.children).forEach((item) => { MneElement.mkClass(item, 'active', item == this.obj.run.act_row )})
    }
    
    async func()
    {
      if ( this.obj.op.parentNode == null )
      {
        this.obj.opparent.insertBefore(this.obj.op, this.obj.tables.content.parentNode );
        this.obj.opparent.removeChild(this.obj.tables.content.parentNode);
      }
      else
      {
        this.obj.opparent.insertBefore(this.obj.tables.content.parentNode, this.obj.op );
        this.obj.opparent.removeChild(this.obj.op);
      }
    }

    async values()
    {
      var schema,table;
      
      schema = this.config.composeparent.obj.weblets.firsttab.obj.run.values.schema  ?? '';
      table = this.config.composeparent.obj.weblets.firsttab.obj.run.values.table   ?? '';
      if ( schema != this.obj.inputs.fschema.getValue() || table != this.obj.inputs.ftab.getValue() )
      {
        this.obj.inputs.fschema.modValue(schema);
        this.obj.inputs.ftab.modValue(table);
        this.obj.inputs.op.setValue('');
        Array.from(this.obj.tbody.children).forEach((item) => { item.inputs.firstcolumn.setValue('') })
      }

      schema = this.config.composeparent.obj.weblets.secondtab.obj.run.values.schema  ?? '';
      table = this.config.composeparent.obj.weblets.secondtab.obj.run.values.table   ?? '';
      if ( schema != this.obj.inputs.tschema.getValue() || table != this.obj.inputs.ttab.getValue() )
      {
        this.obj.inputs.tschema.modValue(schema);
        this.obj.inputs.ttab.modValue(table);
        this.obj.inputs.op.setValue('');
        Array.from(this.obj.tbody.children).forEach((item) => { item.obj.inputs.secondcolumn.setValue('') })
      }
    }
    
    async ok()
    {
      var fcols, tcols, op, i;
      
      this.obj.run.okaction = 'add';
      this.obj.inputs.joindefid.setValue('################');
      
      if ( this.obj.op.parentNode == null )
      {
        fcols = tcols = op = "";
        for ( i=0; i< this.obj.tbody.rows.length; i++)
        {
          fcols = fcols + this.obj.tbody.rows[i].obj.inputs.firstcolumn.getValue() + ",";
          op    = op    + this.obj.tbody.rows[i].obj.inputs.operator.getValue() + ",";
          tcols = tcols + this.obj.tbody.rows[i].obj.inputs.secondcolumn.getValue() + ",";
        }

        fcols = fcols.substring(0,fcols.length -1 );
        tcols = tcols.substring(0,tcols.length -1 );
        op    =    op.substring(0,op.length -1 );

        this.obj.inputs.fcols.setValue(fcols);
        this.obj.inputs.tcols.setValue(tcols);
        this.obj.inputs.op.setValue(op);
      }
      else
      {
        this.obj.inputs.fcols.setValue('');
        this.obj.inputs.tcols.setValue('');
      }

      this.config.composeparent.obj.weblets.joins.newvalues = true;
      await super.ok()

      this.modClear();
      for ( i=0; i< this.obj.tbody.rows.length; i++)
      {
        this.obj.tbody.rows[i].obj.inputs.firstcolumn.modClear();
        this.obj.tbody.rows[i].obj.inputs.operator.modClear();
        this.obj.tbody.rows[i].obj.inputs.secondcolumn.modClear();
      }

    }
    
    async del()
    {
       if ( this.obj.run.act_row && this.obj.run.act_row.parentNode != null )
       {
         this.obj.run.act_row.parentNode.removeChild(this.obj.run.act_row);
         this.obj.run.act_row = undefined;
       }
    }
    
    async selectok(res)
    {
      var w = this.obj.weblets.table;
      var values = {};

      res.ids.forEach((item, index) => { values[item] = res.values[0][res.rids[item]];  });
      
      if ( ! this.obj.run.act_row )
        await this.addrow( ( values.selectid == 'firsttab') ? { firstcolumn : values.column, operator : '=', secondcolumn : '' } : { firstcolumn : '', operator : '=', secondcolumn : values.column } );
      else if ( values.selectid == 'firsttab' )
        this.obj.run.act_row.obj.inputs.firstcolumn.modValue(values.column);
      else
        this.obj.run.act_row.obj.inputs.secondcolumn.modValue(values.column);
    }


}

export default MneDbadminJoin;

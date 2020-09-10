//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/table/index.mjs
//================================================================================
'use strict';

import MneInput    from '/js/basic/input.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbViewWeblet     from '/weblet/db/view.mjs'

class MneAdminTableIndexWeblet extends MneDbViewWeblet
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        schema : 'mne_application',
        query  : 'table_index_column',
        
        showids : [ 'schema', 'table', 'index' ],
        
        okschema : 'mne_catalog',

        addfunction  : "table_index_add",
        modfunction  : "table_index_add", 
        delfunction  : "table_index_drop",

        classname : 'border padding',
        
        ignore_notfound : true,
        hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    
    reset ()
    {
      super.reset();
      this.getParamAdd = function(p)
      {
        var i;
        var c;
        var cols = new Array();

        for ( i=0; i<this.obj.tbody.rows.length; i++ )
        {
          var pos = this.obj.tbody.rows[i].cells[1].valueField.getValue();
          if ( pos ) { cols[pos] =  this.obj.tbody.rows[i].values.column; }
        }

        if ( cols.length == 0 )
          throw new Error(MneText.getText("#mne_lang#keine Spalte ausgewählt"));
        
        c = 'ARRAY[';
        for ( i = 0; i<cols.length; i++ )
          if ( typeof cols[i] != 'undefined' ) c += "'" + cols[i] + "',";
        c = c.substring(0, c.length - 1);
        c += ']';
        p = 
        {
            par0 : this.obj.run.values.schema,
            par1 : this.obj.run.values.table,
            par2 : this.obj.inputs.index.getValue(),
            par3 : this.obj.inputs.isunique.getValue(),
            par4 : c,
            par5 : this.obj.inputs.text_de.getValue(),
            par6 : this.obj.inputs.text_en.getValue(),
            par7 : this.obj.inputs.custom.getValue(),

            typ3 : this.obj.inputs.isunique.valuetyp,
            typ4 : 'array',
            typ7 : this.obj.inputs.custom.valuetyp,
            
            sqlend : 1
        };

        return Object.assign(p, this.obj.run.addpar )
      }

      this.getParamMod = function(p)
      {
        p = this.getParamAdd(p);
        return Object.assign(p, this.obj.run.modpar )
      }
      
      this.getParamDel = function(p)
      {
        p.par0 = this.obj.run.values.schema,
        p.par1 = this.obj.run.values.index,
        p.sqlend = 1
        
        return Object.assign(p, this.obj.run.delpar )
      }

    }

    async add(nomod)
    {
      this.obj.defvalues.schema = this.config.dependweblet.obj.run.values.schema;
      this.obj.defvalues.table  = this.config.dependweblet.obj.run.values.table;
      this.obj.defvalues.index  = this.obj.defvalues.schema + "_" + this.obj.defvalues.table + '_idx_' + (new Date()).getTime();
      
      await super.add(nomod);
      var p =
      {
          schema   : this.obj.run.values['schema'],
          table    : this.obj.run.values['table'],
          no_vals  : "true",
          sqlend   : 1
      };
      
      var res = await MneRequest.fetch('/db/utils/table/data.json', p);
      var result = { ids : [ 'column', 'position'], labels : [ MneText.getText("#mne_lang#Spalte"), MneText.getText("#mne_lang#Position") ], rids : { column : 0, position : 1}, values : [], regexps : [ '', MneInput.checktype['numoempty'] ], typs : [ 'char', 'long' ], formats : [ '', '' ] }
      res.ids.forEach((item, index) =>
      {
        result.values[index] = [];
        result.values[index][result.rids['column']] = item;
        result.values[index][result.rids['position']] = 0;
      });
      
      this.obj.run.result = result;
      this.enable('add', (  this.obj.run.values['schema'] != undefined && this.obj.run.values['table'] != undefined ) == true ); 
    }
    
    async values()
    {
      var i,j;

      await super.values({multiline : true });
      
      var res = this.obj.run.result;
      var str = '<table class="' + this.initpar.classname + ' disable-select relative" tabindex=1><thead><tr>';
      
      var rtabid = this.obj.run.result.rtabid = {};
      ['column', 'position'].forEach( (item, index ) =>
      {
        str += '<td>' + res.labels[res.rids[item]] + '</td>';
        rtabid[item] = index;
      });

      str += '</tr></thead><tbody>';
      res.values.forEach((item, index) =>
      {
        str += '<tr><td>' + item[res.rids['column']] + '</td><td><span id="positionInput"></span></td></tr>';
      });
      str += '</tbody></table>';
      
      this.obj.tables.content.innerHTML = str;
      MneElement.mkElements(this.obj.tables.content);
      
      var obj = Object.assign({}, { inputs  : this.obj.inputs, outputs : this.obj.outputs });
      var rows = this.obj.tables.content.firstChild.querySelector('tbody').children;
      for ( i =0; i<rows.length; i++)
      {
        this.obj  = Object.assign(this.obj, { inputs  : {}, outputs : {} });
        await this.findIO(rows[i]);
        rows[i].obj = { inputs : this.obj.inputs, outputs : this.obj.outputs }
        
        rows[i].obj.inputs.position.setTyp(res.typs[res.rids['position']], res.regexps[res.rids['position']], res.formats[res.rids['position']]);
        rows[i].obj.inputs.position.setValue(res.values[i][res.rids['position']])
        rows[i].cells[1].valueField = this.obj.inputs['position'];
        rows[i].values = { column : rows[i].cells[0].innerText, position : res.values[i][res.rids['position']] }
      }

      this.obj  = Object.assign(this.obj, { inputs  : obj.inputs, outputs : obj.outputs });

      this.obj.thead = this.obj.tables.content.firstChild.firstChild;
      this.obj.tbody = this.obj.tables.content.firstChild.lastChild;
      this.obj.table = this.obj.tables.content.firstChild;
   
    }
}

export default MneAdminTableIndexWeblet;

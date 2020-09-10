//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/table/fkey.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbViewWeblet     from '/weblet/db/view.mjs'

class MneAdminTableFkeyWeblet extends MneDbViewWeblet
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
         schema  : 'mne_application',
         query   : 'table_fkeys',
         showids : [ "schema", "table", "name"],
         
        addurl  : "/db/admin/table/fkey/add.json",
        modurl  : "/db/admin/table/fkey/mod.json", 
        delurl  : "/db/admin/table/fkey/del.json",

        hinput : false
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    
    async getColWeblet(path, par = '')
    {
      var self = this;
      let { default: ColWeblet } =  await MneRequest.import(path + '.mjs' + par);
      class MyColWeblet extends ColWeblet
      {
        reset()
        {
          super.reset();
          this.obj.mkbuttons = [ { id : 'ok', value : MneText.getText('#mne_lang#OK') } ];
        }

        async dblclick()
        {
          await this.ok();
        }

        async ok()
        {
          await self.addCol(this.select);
        }

      }
      return MyColWeblet;
    }

    async getRcolWeblet(path, par = '')
    {
      var self = this;
      let { default: ColWeblet } =  await MneRequest.import(path + '.mjs' + par);
      class MyColWeblet extends ColWeblet
      {
        reset()
        {
          super.reset();
          this.obj.mkbuttons = [ { id : 'ok', value : MneText.getText('#mne_lang#OK')  }];
        }

        async dblclick()
        {
          await this.ok();
        }
        async ok()
        {
          await self.addRcol(this.select);
        }


      }
      return MyColWeblet;
    }

    async load()
    {
      var reload = this.config.reload;
      await super.load();

      var path = '/weblet/db/table/basic';
      
      var ColWeblet =  await this.getColWeblet(path, ( reload ) ? '?date=' + Date.now() : '');
      var initpar = { schema : 'mne_application', query  : 'table_cols', showids : [ "schema", "table" ], cols   : 'column', scols  : 'column', notitleframe : true };
      var config = Object.assign(Object.assign({}, this.config ), { path : path, dependweblet : this, depend : [], register : undefined } );
      this.obj.weblets.column = new ColWeblet(this, this.obj.tables.tablecols, 'colum', initpar, config );
      this.obj.weblets.column.newvalues = true;
      this.config.depend.push(this.obj.weblets.column);
      await this.obj.weblets.column.load();

      var RcolWeblet =  await this.getRcolWeblet(path, ( reload ) ? '?date=' + Date.now() : '');
      var initpar = { schema : 'mne_application', query  : 'table_cols', showids : [ "schema", "table" ],  showalias : [ '() => { return dw().obj.inputs.rschema.getValue() }', '() => { return dw().obj.inputs.rtable.getValue() }' ], cols   : 'column', scols  : 'column', notitleframe : true };
      var config = Object.assign(Object.assign({}, this.config ), { path : path, dependweblet : this , depend : [], register : undefined } );
      this.obj.weblets.rcolumn = new RcolWeblet(this, this.obj.tables.rtablecols, 'rcolum', initpar, config );
      this.config.depend.push(this.obj.weblets.rcolumn);
      this.obj.weblets.rcolumn.newvalues = true;
      await this.obj.weblets.rcolumn.load();
      
      var self = this;
      this.obj.observer.rcolumns = new MutationObserver((mut) =>
      {
        this.obj.weblets.rcolumn.initpar.labels = [ (( this.obj.outputs.rschema.getValue() ) ? this.obj.outputs.rschema.getValue() + '.' + this.obj.outputs.rtable.getValue() : undefined ) ];
        this.obj.weblets.rcolumn.values();
      });
      this.obj.observer.rcolumns.observe(this.obj.outputs.rtable, { characterData: true, attributes: false, childList: true, subtree: false } );

    }

    async add(data)
    {
      this.obj.defvalues.schema = this.config.dependweblet.obj.run.values.schema;
      this.obj.defvalues.table  = this.config.dependweblet.obj.run.values.table;
      this.obj.defvalues.name   = ( this.obj.defvalues.schema && this.obj.defvalues.table ) ? this.obj.defvalues.schema + "_" + this.obj.defvalues.table + '_fkey_' + (new Date()).getTime() : ''; 

      this.obj.weblets.column.initpar.labels = [ (( this.obj.run.values.schema ) ?  this.obj.run.values.schema + '.' + this.obj.run.values.table : undefined) ];
      await super.add(data);
      
      this.enable('add', this.obj.defvalues.name != '' )
    }
    
    async addCol(res)
    {
      this.obj.inputs.column.modValue( ( (this.obj.inputs.column.getValue() ) ? this.obj.inputs.column.getValue() + ',' : '' ) + res.values[0][0]);
    }

    async addRcol(res)
    {
      this.obj.inputs.rcolumn.modValue( ( (this.obj.inputs.rcolumn.getValue() ) ? this.obj.inputs.rcolumn.getValue() + ',' : '' ) + res.values[0][0]);
    }
    
    async ok()
    {
      await super.ok();
      this.obj.run.values.name = this.obj.inputs.name.getValue();
    }

    async values()
    {
      await super.values();
      this.obj.weblets.column.initpar.labels = [ (( this.obj.run.values.schema ) ?  this.obj.run.values.schema + '.' + this.obj.run.values.table : undefined) ];
    }
}

export default MneAdminTableFkeyWeblet;

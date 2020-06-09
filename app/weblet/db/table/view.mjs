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
import MneElement    from '/js/basic/element.mjs'
import MneRequest    from '/js/basic/request.mjs'

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
    var p = [];
    var self = this;
    

    this.config.depend.forEach( (item) =>
    {
      if ( item.newvalues && item.obj.run.dependweblet == item )
             mustcheck = true;
    });

    if ( mustcheck )
      p.push (this.refresh());

    p.push(super.check_values());

    return Promise.all(p);
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
     
     for ( i=0; i< this.initpar.modids.length; ++i )
       row.values[res.rids[this.initpar.modids[i]]] = (this.obj.defvalues[this.initpar.modids[i]] != undefined ) ? this.obj.defvalues[this.initpar.modids[i]] : '################';

     for ( i=0; i< this.initpar.showids.length; ++i )
       row.values[res.rids[this.initpar.showids[i]]] = (this.obj.defvalues[this.initpar.showids[i]] != undefined ) ? this.obj.defvalues[this.initpar.showids[i]] : this.config.dependweblet.obj.run.values[this.initpar.showids[i]];

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
       this.obj.inputs[i].modValue((row.values[rr]) ? row.values[rr] : ( this.obj.defvalues[i] ?? '' ));
     }
     
     await this.selectRow({type : 'add'}, row, {});
     
     for ( i=0; i<this.obj.cols.length; ++i)
       if ( this.obj.inputs[this.obj.cols[i]] ) { this.obj.inputs[this.obj.cols[i]].focus(); break; }
     
     this.obj.run.okaction = 'add';
  }

  async ok()
  {
    if ( this.obj.buttons.ok ) 
    {
      var i,j;
      var rows = this.obj.tbody.children;

      for ( i=0; i<rows.length; i++)
      {
        if ( rows[i].querySelector('.modifyok') != null ) 
        {
          this.selectRow({force : true}, rows[i] )
          await super.ok();
        }
        this.dependweblet = undefined;
      }
    }
  }
  
  async del()
  {
    var sel = this.select;

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
    await super.cancel();
  }
  
  async detail()
  {
    await this.openpopup(this.initpar.detailweblet);
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
  
  async refresh()
  {
    await super.refresh();
    this.newvalues = true;
  }
  
  async dblclick()
  {
    if ( this.initpar.detailweblet )
      return this.detail();
  }
}

export default MneDbTableView

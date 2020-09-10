//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/query/collisttable.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement from '/weblet/basic/element.mjs'

import MneDbTableBasic from '/weblet/db/table/basic.mjs'

class MneAdminQueryCollistTable extends MneDbTableBasic
{
  reset()
  {
    super.reset();
    this.obj.mkbuttons = [ { id : 'ok', value : MneText.getText('#mne_lang#Ok') } ];
  }
  
  get select()
  {
     var res = super.select;
     var i;
     for ( i in this.obj.run.tableparam)
     {
       res.ids.push(i);
       res.labels.push(i);
       res.rids[i] = res.ids.length -1;
       res.values[0].push(this.obj.run.tableparam[i]);
     }
     return res;
  }
  
  async values()
  {
    this.getParamShow({}, ['schema', 'table', 'tabnum'])
    this.obj.run.tableparam = Object.assign({ selectid : this.initpar.selectid }, this.config.dependweblet.obj.run.values);

    await super.values();
    
    Array.from(this.obj.tbody.rows).forEach( (item) =>
    {
      item.draggable = true;
      item.addEventListener('dragstart', (evt) =>
      {
        var values = {}
        this.obj.run.result.ids.forEach((ids, index) =>
        {
          values[ids] = item.values[index];
        })
        evt.dataTransfer.setData("mnejson", JSON.stringify(Object.assign( Object.assign({ dropfrom : ( this.initpar.dropfrom ?? this.parent.id ) }, this.obj.run.tableparam ), values)));
      })
    });
  }
  
  async ok()
  {
    if ( this.initpar.selectok)
    {
      var p = []
      this.initpar.selectok.forEach((item) =>
      {
        var w = this.config.composeparent.obj.weblets[item];
        var s = this.select;
        if ( w && w.visible ) p.push(w.selectok(s));
      });
    }
    return Promise.all(p)
  }
  
  async dblclick(data, obj, evt)
  {
    return this.ok();
  }

}

export default MneAdminQueryCollistTable;

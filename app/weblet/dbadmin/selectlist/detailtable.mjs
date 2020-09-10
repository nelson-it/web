//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/selectlist/detailtable.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement from '/weblet/basic/element.mjs'

import MneDbTableView from '/weblet/db/table/view.mjs'

class MneDbAdminSelectlistDetailTable extends MneDbTableView
{
  reset()
  {
    super.reset();
    this.obj.mkbuttons.push({ id : 'addlist',  value : MneText.getText('#mne_lang#Neue Liste'), before : 'del'});
  }
  
  async addlist()
  {
    this.clearRows();
    this.parent.dependweblet = this.parent;
    this.parent.obj.run.values = {};
    this.parent.obj.run.values.name = this.obj.defvalues.name = MneText.getText('#mne_lang#Neue Liste');
    await this.values();
    return this.add();
  }
  
  async ok()
  {
    var name = this.obj.run.act_row.obj.inputs.name.getValue();

    await super.ok();

    this.parent.dependweblet = this.parent;
    this.parent.obj.run.values = {};
    this.parent.obj.run.values.name = name
  }
  
  async del()
  {
    var name = this.obj.run.act_row.obj.inputs.name.getValue();

    await super.del();

    this.parent.dependweblet = this.parent;
    this.parent.obj.run.values = {};
    this.parent.obj.run.values.name = name;

  }

}

export default MneDbAdminSelectlistDetailTable;

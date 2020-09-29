//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/admin/interestoverviewtable.mjs
//================================================================================
'use strict';

import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneElement  from '/weblet/basic/element.mjs'
import MneDbTableDynamic from '/weblet/db/table/dynamic.mjs'

class MneRepositoryInterestOverviewTable extends MneDbTableDynamic
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = {};
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  reset()
  {
    super.reset();
    this.obj.mkbuttons.push( { id : 'addperson', value : MneText.getText('#mne_lang#Person Hinzufügen#'), behind : 'cancel', space : 'before' } ); 
    this.obj.mkbuttons.push( { id : 'delperson', value : MneText.getText('#mne_lang#Person löschen#'), behind : 'addperson' } ); 
    
    this.obj.enablebuttons.buttons.push('addperson');
    this.obj.enablebuttons.buttons.push('delperson');
    
    this.obj.enablebuttons.select.push('addperson');
    this.obj.enablebuttons.select.push('delperson');
    
   }
  
  async addperson()
  {
    var w;
    if ( ! ( w = this.obj.weblets['interesseadd'] ) )
    {
      w = await this.createpopup('interesseadd', {}, { selectok : async (res) =>
      {
        this.obj.run.selectedkeys = [];
        this.primarykey();

        var p =
        {
            schema : 'mne_repository',
            name   : 'fileinterests_add',
            
            sqlend : "1"
        };

        p = this.addParam(p, "par0", this.obj.run.values['repositoryid']);
        p = this.addParam(p, "par1", this.obj.run.values['filename']);
        p = this.addParam(p, "par2", res.values[0][res.rids.personid]);

        await MneRequest.fetch('/db/utils/connect/func/execute.json', p);
        
        this.newvalues = true;
      }});
    }
 
    await w.show();
    w.newvalues = true;
    await w.check_values();

    return false;
  }

  async modperson()
  {
    if ( ! this.obj.act_personid ) return;
    
    this.obj.run.selectedkeys = [];
    this.primarykey();
    
    var p =
    {
        schema : 'mne_repository',
        name   : 'fileinterests_mod',
        
        sqlend : "1"
    };

    p = this.addParam(p, "par0", this.obj.run.values['repositoryid']);
    p = this.addParam(p, "par1", this.obj.run.values['filename']);
    p = this.addParam(p, "par2", this.obj.act_personid);

    await MneRequest.fetch('/db/utils/connect/func/execute.json', p);
    
    this.newvalues = true;

  }
  async delperson()
  {
    if ( ! this.obj.act_personid ) return;

    this.obj.run.selectedkeys = [];
    this.primarykey();

    var p =
    {
        schema : 'mne_repository',
        name   : 'fileinterests_del',
        
        sqlend : "1"
    };

    p = this.addParam(p, "par0", this.obj.run.values['repositoryid']);
    p = this.addParam(p, "par1", this.obj.run.values['filename']);
    p = this.addParam(p, "par2", this.obj.act_personid);

    await MneRequest.fetch('/db/utils/connect/func/execute.json', p);
    
    this.newvalues = true;

  }
  
  async rowclick(data, row, evt)
  {
    await super.rowclick(data, row, evt);
    
    this.obj.act_personid = undefined;
    var ele = this.obj.tables.content.querySelector('tbody td.person.active');
    if ( ele ) MneElement.clearClass(ele, 'active');
    this.obj.buttons.delperson.disabled = true;
  }

  async values()
  {
    await super.values();
    
    Array.from(this.obj.tables.content.querySelectorAll('tbody td.person')).forEach( (item, index) =>
    {
      item.addEventListener('click', (evt) =>
      {

        MneElement.mkClass(evt.target, 'active');
        this.obj.act_personid = item.querySelector('span[shortid]').getAttribute("shortid");
        this.obj.buttons.delperson.disabled = false;
        if ( evt.detail == 2 )
          this.btnClick('modperson', {}, evt );
      });
    })
    
  }

}

export default MneRepositoryInterestOverviewTable;

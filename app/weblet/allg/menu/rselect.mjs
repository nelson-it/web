//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/menu/rselect.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs';
import MneRequest from '/js/basic/request.mjs';
import MneElement from '/weblet/basic/element.mjs';
import MneRecursiveMenu from './recursive.mjs';

export class MneSelectRecursiveMenu extends MneRecursiveMenu
{

  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    initpar.nowebletframe = 0;
    initpar.nobuttonframe = false;

    super( parent, frame, id, initpar, config );
  }
  
  reset()
  {
      super.reset();
      
      if ( ! this.initpar.table )
        this.delbutton('del,add');
      else
        this.obj.mkbuttons.push( { id : 'rename', value : MneText.getText('#mne_lang#Umbenennen'), behind : 'add' } );
      
      var cols = this.initpar.cols.split(',');
      var res = { ids : [], rids : {} } ;
      this.obj.showcolnames = ( this.initpar.showcolnames ) ? this.initpar.showcolnames.split(',') : this.initpar.showcols.split(',');
      this.obj.showcolnames.forEach((item, index) =>
      {
        res.ids[index]  = item;
        res.rids[item] = index;
        
        if ( ! cols.includes(item) )
          this.obj.readparam.cols += ',' + item;
        
      });
      this.obj.run.result = res;
    }
  
  async load()
  {
    await super.load();

    if ( ! this.initpar.table )  return;

    this.obj.container.content.innerHTML = '<div></div><div class="inputarea"><div class="inputgroup"><div class="inputsingle"><span>&nbsp;</span><span id="nameInput"></span></div></div></div>';
    this.obj.container.tree = this.obj.container.content.firstChild;
    
    await MneElement.mkElements(this.obj.container.content.lastChild);
    await this.findIO(this.obj.container.content.lastChild);
    
    this.obj.inputs.name.addEventListener('input', (evt) =>
    {
      this.obj.buttons.add.disabled = ( this.obj.inputs.name.getValue(false) == '');
      this.obj.buttons.rename.disabled = ( this.obj.inputs.name.getValue(false) == '') || ( ! this.obj.selectdata );
    });
    this.obj.buttons.add.disabled = ( this.obj.inputs.name.getValue(false) == '');
    this.obj.buttons.del.disabled = true;
    this.obj.buttons.rename.disabled = true;

    this.obj.container.content.mne_data = '';
    this.obj.container.content.addEventListener('dragover', async (evt) =>
    {
      var data = evt.dataTransfer.getData('mne_rselect');
      if ( data && evt.target.mne_data != undefined )
      {
        if ( this.obj.timeout ){ window.clearTimeout(this.obj.timeout); this.obj.timeout = undefined; }
        ( this.frame.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));

        if ( data )
        {
          MneElement.mkClass(evt.target, 'dropover')
          if ( evt.target.mne_data && evt.target.mne_data.values[evt.target.mne_data.res.rids.action].action == 'submenu' && evt.target.mne_data.menu.className.indexOf('menuopen') == -1 )
          {
            this.obj.timeout = window.setTimeout(() => { this.action_submenu(evt.target.mne_data, false); }, 1000);
          }
        }
        evt.dataTransfer.dropEffect = 'move';
      }
      else
      {
        evt.dataTransfer.dropEffect = 'none';
      }
      evt.preventDefault();
    });

    this.obj.container.content.addEventListener('dragleave', async (evt) =>
    {
      ( this.frame.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));
      if ( this.obj.timeout ){ window.clearTimeout(this.obj.timeout); this.obj.timeout = undefined; }
    });

    this.obj.container.content.addEventListener('drop', async (evt) => 
    {
      var data = evt.dataTransfer.getData('mne_rselect');

      (this.frame.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));
      if ( this.obj.timeout ){ window.clearTimeout(this.obj.timeout); this.obj.timeout = undefined; }

      if ( data && evt.target.mne_data != undefined )
      {
        var p = 
        {
            schema : this.initpar.schema,
            table : this.initpar.table,

            "treeidInput.old" : this.obj.drag.data.values[this.obj.drag.data.res.rids.menuid],
            parentidInput : ( evt.target.mne_data ) ? evt.target.mne_data.values[evt.target.mne_data.res.rids.menuid] : '',

                sqlend : 1
        }

        await MneRequest.fetch('/db/utils/table/modify.json', p);
        ( evt.target.mne_data )  ? await this.action_submenu(Object.assign({ refresh : true }, evt.target.mne_data )) : await this.values();
        this.obj.drag.element.parentNode.removeChild(this.obj.drag.element);
      }
      evt.preventDefault();
    });
  }
  
  mk_submenu(container, res, data)
  {
    super.mk_submenu(container, res, data);
    
    if ( ! this.initpar.table ) return;
    
    container.querySelectorAll('.treelink').forEach((item) => 
    {
      item.draggable = true;
      item.addEventListener('dragstart', (evt) => 
      { 
        evt.dataTransfer.setData('mne_rselect', 'ok');
        this.obj.drag = { data : item.mne_data, element : item.parentNode };
      });
    });
  }

  async action_submenu( data, dblclick )
  {
    await super.action_submenu(data, dblclick);
    this.frame.querySelectorAll('.selected').forEach( ( item) => MneElement.clearClass(item, 'selected'));
    delete this.obj.selectdata;

    if ( data.menu )
    {
      this.obj.selectdata = data;
      MneElement.mkClass(data.menu, 'selected');
    }
    
    if ( dblclick )
    {
      await this.ok();
      return this.cancel();
    }
    
    if ( ! this.initpar.table ) return;
    
    this.obj.buttons.add.disabled = ( this.obj.inputs.name.getValue(false) == '');
    this.obj.buttons.del.disabled = ! this.obj.selectdata;
    this.obj.buttons.rename.disabled = ! this.obj.selectdata;
    

    
    return false;
  }
  
  async action_show(data, dblclick )
  {
    this.frame.querySelectorAll('.selected').forEach( ( item) => MneElement.clearClass(item, 'selected'));
    delete this.obj.selectdata;

    if ( data.menu )
    {
      this.obj.selectdata = data;
      MneElement.mkClass(data.menu, 'selected');
    }

    if ( dblclick )
    {
      var retval = await this.ok();
      if ( ! this.initpar.noclose ) await this.cancel();
      return retval;
    }
  }
  
  async enter()
  {
    if ( ! this.obj.buttons.add.disabled ) return this.add();
    return false;
  }

  async ok()
  {
    var res;
    var retval = false;
    
    if ( this.obj.selectdata == undefined ) return false;
    
    res = Object.assign({}, this.obj.run.result );
    res.values = [[]];
    
    res.ids.forEach( (item) =>
    {
      res.values[0].push(this.obj.selectdata.values[this.obj.selectdata.res.rids[item]]);
    });
    
    if ( this.initpar.selectok )
      retval = ( await this.initpar.selectok(res) === true );
    
    return retval;
  }
  
  async add()
  {
    var p = {};
    
    p.schema = this.initpar.schema;
    p.table = this.initpar.table;
    p.parentidInput = ( this.obj.selectdata ) ? this.obj.selectdata.values[this.obj.selectdata.res.rids.menuid] : '';
    p.treeidInput = '################';
    p.treenameInput = this.obj.inputs.name.getValue();
    p.sqlend = 1;
    
    await MneRequest.fetch('/db/utils/table/insert.json', p);
    ( this.obj.selectdata )  ? await this.action_submenu(Object.assign({ refresh : true }, this.obj.selectdata )) : await this.values();
    this.obj.inputs.name.setValue('');
    
    return false;
  }
  
  async rename()
  {
    var p = {};
    
    p.schema = this.initpar.schema;
    p.table = this.initpar.table;
    p["treeidInput.old"] = ( this.obj.selectdata ) ? this.obj.selectdata.values[this.obj.selectdata.res.rids.menuid] : '';
    p.treenameInput = this.obj.inputs.name.getValue();
    p.sqlend = 1;
    
    console.log(p)
    await MneRequest.fetch('/db/utils/table/modify.json', p);
    ( this.obj.selectdata.parent )  ? await this.action_submenu(Object.assign({ refresh : true }, this.obj.selectdata.parent )) : await this.values();
    this.obj.inputs.name.setValue('');
    
    return false;
  }
  
  async del()
  {
    var p = {};
    p.schema = this.initpar.schema;
    p.table = this.initpar.table;
    p["treeidInput.old"] = this.obj.selectdata.values[this.obj.selectdata.res.rids.menuid];
    p.sqlend = 1;
    
    await MneRequest.fetch('/db/utils/table/delete.json', p);
    ( this.obj.selectdata && this.obj.selectdata.parent )  ? await this.action_submenu(Object.assign({ refresh : true }, this.obj.selectdata.parent )) : await this.refresh();
    
    return false;
  }
  
  async cancel()
  {
    await this.close();
    return false;
  }
  
  async values()
  {
    await super.values();

    if ( this.initpar.table ) 
    {
      this.obj.buttons.add.disabled = ( this.obj.inputs.name.getValue(false) == '');
      this.obj.buttons.del.disabled = ! this.obj.selectdata;
      this.obj.buttons.rename.disabled = ! this.obj.selectdata;
    }
  }

}

export default MneSelectRecursiveMenu

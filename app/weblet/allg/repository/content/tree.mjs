//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/content/tree.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'

import MneElement from '/weblet/basic/element.mjs'
import MnePopup   from '/weblet/basic/popup.mjs'

import MneMenuRecursive  from '/weblet/allg/menu/recursive.mjs'

class MneRepositoryTree extends MneMenuRecursive
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        frameclass : 'weblet-allg-repository',

        url : 'db/utils/repository/ls.json',
        readpar : {'rootInput.old' : 'repository',
                      'dirInput.old' : '',
                      'pointdirInput.old' : 0,
                              idname : 'nameid',
                              schema : 'mne_repository',
                               table : 'repository'
                     },

      hinput : false
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + 'allg/repository/repository.css'; }

  reset ()
  {
    super.reset();
    this.obj.readurl = this.initpar.url;
    this.obj.run.readpar = Object.assign({ wcol : '', wop : '', wval : '' }, this.initpar.readpar );
    this.obj.popups['edit'] = new MnePopup( 'edit', {root : 'repository' }, { nointeractive : true, composeparent : this, htmlcomposetabid : 'edit', id : 'edit', position : 'popup', path : '/weblet/allg/repository/content/treeedit', depend : [], label : MneText.getText('#mne_lang#Bearbeiten') } );
  }
  
  async load()
  {
    await super.load();
    this.obj.container.content.addEventListener('contextmenu', async (evt) =>
    {
      evt.preventDefault();
      
      var repositoryid = this.obj.run.values.repositoryid;
      if ( ! repositoryid || repositoryid == '################' )
        return;

      await this.openpopup('edit');
      this.obj.popups.edit.popup.frame.style.left = evt.clientX + "px";
      this.obj.popups.edit.popup.frame.style.top = evt.clientY  + "px";
      this.obj.weblets.edit.openmenu(evt.target);
      return false;
    });

    this.obj.container.content.addEventListener('click', async (evt) => { if ( this.obj.weblets.edit ) this.obj.weblets.edit.close(); } );

    this.obj.container.content.addEventListener('dragstart', async (evt) =>
    {
       evt.dataTransfer.setData('text/json', JSON.stringify(evt.target.mne_data));
       evt.dataTransfer.setData('text/plain', 'mne_repository: ' + this.frame.id);
       
       this.obj.run.dragelement = evt.target;
    });

    this.obj.container.content.addEventListener('dragover', async (evt) =>
    {
      if ( this.obj.timeout ){ window.clearTimeout(this.obj.timeout); this.obj.timeout = undefined; }
      ( this.frame.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));
      
      var isfile = evt.dataTransfer.types.includes('Files');
      var isown  = evt.dataTransfer.getData('text/plain').indexOf('mne_repository') == 0;
      var data = evt.target.mne_data;

      if ( ( isfile || isown ) && data )
      {
        if (  isfile )
          evt.dataTransfer.dropEffect = 'copy';
        else
          evt.dataTransfer.dropEffect = 'move';
        MneElement.mkClass(evt.target, 'dropover')
        if ( data.values[data.res.rids.action].action == 'submenu' && data.menu && data.menu.className.indexOf('menuopen') == -1 )
            this.obj.timeout = window.setTimeout(() => { this.action_submenu(data, false); }, 1000);
      }
      else
        evt.dataTransfer.dropEffect = 'none';

      evt.preventDefault();
    });
    
    this.obj.container.content.addEventListener('dragleave', async (evt) =>
    {
      ( this.frame.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));
      if ( this.obj.timeout ){ window.clearTimeout(this.obj.timeout); this.obj.timeout = undefined; }
    });
    
    this.obj.container.content.addEventListener('drop', async (evt) => 
    {
      evt.preventDefault();
      var repositoryid = this.obj.run.values.repositoryid;
      var data = evt.target.mne_data;
      
      ( this.frame.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));

      if ( ! repositoryid || repositoryid == '################' )
        return;

      if ( data.values[data.res.rids.action].parameter[2].filetype == 'dir' )
        this.obj.act_openmenu = data;
      
      await this.openpopup('edit');

      this.obj.popups.edit.popup.frame.style.left = evt.clientX + "px";
      this.obj.popups.edit.popup.frame.style.top = evt.clientY  + "px";

      this.obj.weblets.edit.btnClick('filedrop' , data, evt.target, evt);
    });
  }
  
  getReadParam(data)
  {
    var par = Object.assign({sqlend : 1, sqlstart : 1}, this.obj.run.readpar);
    par['dirInput.old'] = data.values[data.res.rids.menuid] ?? '';
    
    return par;
  }
  
  mk_submenu( container, res, data )
  {
    super.mk_submenu(container, res, data );
    container.querySelectorAll('.treelink').forEach( ( item ) => { item.draggable = true });
  }

  async values()
  {
    var repositoryid = this.config.dependweblet.obj.run.values.repositoryid;
    this.obj.run.values = this.config.dependweblet.obj.run.values;
    this.obj.run.readpar['repositoryidInput.old'] = repositoryid;

    this.obj.container.content.innerHTML = '';
    if ( ! repositoryid || repositoryid == '################' )
      return;
    
    this.obj.container.tree.mne_data = { res : { rids : { menuid : 0, action : 2 }}, values : [ '', '', {action : 'submenu', parameter : [ '', '', { name : '', fullname : '', filetype : "dir" }] }] }

    return super.values();
  }
}


export default MneRepositoryTree;

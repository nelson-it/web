//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/filesystem/treeedit.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText    from '/js/basic/text.mjs'
//import MneInput   from '/js/basic/input.mjs'
//import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'

import MneView           from '/weblet/basic/view.mjs'

class MneFilesystemTreeEdit extends MneView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        frameclass : 'weblet-allg-filesystem',
        
        diraddaction : 'file/mkdir.json',
        dirdelaction : 'file/rmdir.json',

        fileaddaction : 'file/mkfile.json',
        filedelaction : 'file/rmfile.json',

        renameaction : 'file/mv.json',

        notitle : true,
        nointeractive : true,
        
        autosave: false,
        hinput: false
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getViewPath() { return this.getView(import.meta.url) }

  reset ()
  {
    super.reset();

    this.obj.mkbuttons =
    [ 
      { id : 'ok',         value : MneText.getText('#mne_lang#Ok#')},
      { id : 'cancel',     value : MneText.getText('#mne_lang#Abbrechen#')},
      { id : 'adddir',     value : MneText.getText('#mne_lang#Ordner Hinzufügen#')},
      { id : 'addfile',    value : MneText.getText('#mne_lang#Datei Hinzufügen#')},
      { id : 'rename',     value : MneText.getText('#mne_lang#Umbenennen#')},
      { id : 'del',        value : MneText.getText('#mne_lang#Löschen#')}
    ];
    
    this.obj.enablebuttons.buttons = [];
    this.obj.mkbuttons.forEach( (item) => { this.obj.enablebuttons.buttons.push(item.id); });
    
    this.obj.enablebuttons.ok   =  [ 'ok', 'cancel' ];
    this.obj.enablebuttons.root =  [ 'adddir', 'addfile' ];
    this.obj.enablebuttons.dir  =  [ 'adddir', 'addfile', 'rename', 'del'];
    this.obj.enablebuttons.file =  [ 'addfile','rename', 'del'];
    
    this.obj.run.btnrequest = [];
    this.obj.run.btnrequest['adddir']  = this.initpar.diraddaction;
    this.obj.run.btnrequest['deldir']  = this.initpar.dirdelaction;
    this.obj.run.btnrequest['addfile'] = this.initpar.fileaddaction;
    this.obj.run.btnrequest['delfile'] = this.initpar.filedelaction;
    this.obj.run.btnrequest['rename']  = this.initpar.renameaction;

  }
  
  async load()
  {
    await super.load();
    this.obj.observer.content.disconnect();

    this.obj.files.name.addEventListener('change', (evt) => { this.btnClick('filechange', {}, evt ); });
  }
  
  mkdir(leaf = false )
  {
    var index;

    this.obj.inputs.root.setValue(this.initpar.rootnew);
    this.obj.inputs.rootold.setValue(this.initpar.root);

    this.obj.inputs.dir.setValue('');
    this.obj.outputs.dirold.setValue('');

    this.obj.inputs.name.setValue('');
    this.obj.outputs.nameold.setValue('');

    if ( this.obj.run.act_data )
    {
      var menuid = this.obj.run.act_data.values[this.obj.run.act_data.res.rids.menuid];
      if ( leaf || this.obj.run.act_data.values[this.obj.run.act_data.res.rids.action].parameter[2].filetype != 'dir' )
      {
        this.obj.outputs.dirold.setValue(  (( index = menuid.lastIndexOf('/') ) < 0 ) ? "" : menuid.substring(0, index));
        this.obj.outputs.nameold.setValue( (  index < 0 ) ? menuid : menuid.substr(index + 1));
      }
      else
      {
        this.obj.outputs.dirold.setValue(menuid);
      }

      this.obj.inputs.dir.setValue( this.obj.outputs.dirold.getValue());
      this.obj.inputs.name.setValue( this.obj.outputs.nameold.getValue());
    }
  }
  
  mkpar()
  {
    return {
      'rootInput.old' : this.initpar.root,
    };
  }

  showButton(typ)
  {
    this.obj.enablebuttons.buttons.forEach((item) => { this.obj.buttons[item].style.display = 'none' } )
    this.obj.enablebuttons[typ].forEach((item) => { this.obj.buttons[item].style.display = 'block' } )
  }
  
  openmenu(obj)
  {
    var i;
    this.obj.run.act_data = obj.mne_data;

    if ( ! this.obj.run.act_data  || this.obj.run.act_data.values[0] == '')
      this.showButton('root')
    else if ( this.obj.run.act_data.values[this.obj.run.act_data.res.rids.action].parameter[2].filetype == 'dir' )
      this.showButton('dir')
    else
      this.showButton('file')
    
    MneElement.mkClass(this.obj.container.weblet, 'filesystem-select', true, 'filesystem')
    
    this.obj.files.name.modClear();
    for ( i in this.obj.outputs ) this.obj.outputs[i].setValue('');
    for ( i in this.obj.inputs  ) this.obj.inputs[i].setValue('');
  }
  
  async adddir()
  {
    this.showButton('ok')
    this.obj.run.action = this.obj.run.btnrequest['adddir'];
    MneElement.mkClass(this.obj.container.weblet, 'filesystem-adddir', true, 'filesystem')

    this.mkdir();
    this.obj.inputs.name.focus();
    
    return false;
  }

  async addfile()
  {
    this.showButton('ok')
    this.obj.run.action = this.obj.run.btnrequest['addfile'];
    MneElement.mkClass(this.obj.container.weblet, 'filesystem-addfile', true, 'filesystem')

    this.mkdir();
    this.obj.inputs.name.focus();
    
    return false;
  }
  
  async filechange()
  {
    this.showButton('ok')
    
    if ( this.obj.files.name.files.length )
    {
      if (this.obj.files.name.files[0].type == '' && this.obj.files.name.files[0].size == 0 ) 
      {
        this.obj.run.action = this.obj.run.btnrequest['adddir'];
        MneElement.mkClass(this.obj.container.weblet, 'filesystem-adddir', true, 'filesystem')
      }
      else
      {
        this.obj.run.action = this.obj.run.btnrequest['addfile'];
        MneElement.mkClass(this.obj.container.weblet, 'filesystem-addfile', true, 'filesystem')
      }

      if ( ! this.obj.inputs.name.getValue() )
        this.obj.inputs.name.modValue(this.obj.files.name.files[0].name);
    }
    this.obj.inputs.name.focus();
    
    if ( this.initpar.autosave ) return this.ok();

    return false;
  }
  
  async rename()
  {
    this.showButton('ok')
    this.obj.run.action = this.obj.run.btnrequest['rename'];
    MneElement.mkClass(this.obj.container.weblet, 'filesystem-renamefile', true, 'filesystem');

    this.mkdir(true);
    this.obj.inputs.name.focus();
    return false;
  }

  async filedrop(data, _obj, evt)
  {
    var i,d;
    this.obj.files.name.modClear();
    for ( i in this.obj.outputs ) this.obj.outputs[i].setValue('');
    for ( i in this.obj.inputs  ) this.obj.inputs[i].setValue('');

    if ( evt.dataTransfer.dropEffect == 'move' )
    {
      this.obj.run.action = this.obj.run.btnrequest['rename'];
      MneElement.mkClass(this.obj.container.weblet, 'filesystem-renamefile', true, 'filesystem');

      d = this.obj.run.act_data = JSON.parse(evt.dataTransfer.getData('text/json'));
      this.mkdir();

      this.obj.inputs.rootold.setValue(d.values[d.res.rids.action].root);
      
      var menuid = data.values[data.res.rids.menuid];
      if ( data.values[data.res.rids.action].parameter[2].filetype != 'dir' )
      {
        var index;
        this.obj.inputs.dir.setValue(  (( index = menuid.lastIndexOf('/') ) < 0 ) ? "" : menuid.substring(0, index));
        this.obj.inputs.name.setValue( (  index < 0 ) ? menuid : menuid.substr(index + 1));
      }
      else
      {
        this.obj.inputs.dir.setValue(menuid);
        if ( d.values[d.res.rids.action].parameter[2].filetype == 'dir' )
        {
          MneElement.mkClass(this.obj.container.weblet, 'filesystem-renamedir', true, 'filesystem');
          this.obj.inputs.name.setValue(d.values[d.res.rids.item])
        }
      }
      
      if ( this.initpar.autosave ) return this.ok();
    }
    else
    {
      MneElement.mkClass(this.obj.container.weblet, 'filesystem-addfile', true, 'filesystem');
      d = this.obj.run.act_data = data;
      this.mkdir();

      this.obj.files.name.files = evt.dataTransfer.files;
      var e = new Event('change');
      this.obj.files.name.dispatchEvent(e);
    }
    
    this.showButton('ok');
    return false;
 }

 async ok()
  {
    var data = new FormData();
    data.append('rootInput.old', this.obj.inputs.rootold.getValue());
    data.append('dirInput.old', this.obj.outputs.dirold.getValue());
    data.append('filenameInput.old', this.obj.outputs.nameold.getValue());
    data.append('rootInput', this.obj.inputs.root.getValue());
    data.append('dirInput', this.obj.inputs.dir.getValue());
    data.append('filenameInput', this.obj.inputs.name.getValue());
    data.append('overwrite', this.obj.inputs.overwrite.getValue());
    
    if (this.obj.files.name.files.length )
      data.append('dataInput', this.obj.files.name.files[0], this.obj.files.name.files[0].name);
    
    this.close();
    await MneRequest.fetch(this.obj.run.action, data);

    this.obj.run.checkdepend = true;
    this.parent.treeeditok(Object.keys(this.obj.run.btnrequest).find( item => this.obj.run.btnrequest[item] == this.obj.run.action ), this);
    
    if (this.initpar.noleaf)
      this.parent.newselect = true;
  }
  
  async cancel()
  {
    this.close();
  }
  
  async del(_data, _obj, evt)
  {
    this.obj.run.dir = '';
    this.obj.run.file = '';

    if ( evt.dataTransfer && evt.dataTransfer.getData('text/plain').indexOf('mne_filesystem') == 0 )
      this.obj.run.act_data = JSON.parse(evt.dataTransfer.getData('text/json'));
      
    this.mkdir();
    var p =
    {
        'rootInput.old'         : this.obj.inputs.root.getValue(),
        'dirInput.old'          : this.obj.outputs.dirold.getValue(),
        'filenameInput.old'     : this.obj.outputs.nameold.getValue(),
    };
    
    this.close();
    
    if ( this.obj.outputs.nameold.getValue() != '' )
    {
      if ( this.confirm(MneText.sprintf(MneText.getText("#mne_lang#<$1> wirklich löschen ?"), this.obj.outputs.nameold.getValue() )) != true )
          return;
      await MneRequest.fetch(this.initpar.filedelaction, p)
      this.parent.treeeditok('del', this)  
    }
    else if ( this.obj.outputs.dirold.getValue() != '' )
    {
      if ( this.confirm(MneText.sprintf(MneText.getText("#mne_lang#<$1> wirklich löschen ?"), this.obj.outputs.dirold.getValue() )) != true )
          return;
      
      await MneRequest.fetch(this.initpar.dirdelaction, p)
      this.parent.treeeditok('del', this)  
    }
    
    this.obj.run.checkdepend = true;
    this.parent.newselect = true;
  }
  
  async values()
  {
  }

}

export default MneFilesystemTreeEdit;

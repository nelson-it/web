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
import MneInput   from '/js/basic/input.mjs'
import MneLog     from '/js/basic/log.mjs'
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

    if ( this.obj.run.act_data )
    {
      var menuid = this.obj.run.act_data.values[this.obj.run.act_data.res.rids.menuid];
      if ( leaf || this.obj.run.act_data.values[this.obj.run.act_data.res.rids.action].parameter[2].filetype != 'dir' )
      {
        this.obj.run.dir  = ( ( index = menuid.lastIndexOf('/') ) < 0 ) ? "" : menuid.substring(0, index);
        this.obj.run.file = ( index < 0 ) ? menuid : menuid.substr(index + 1);
      }
      else
      {
        this.obj.run.dir = menuid;
        this.obj.run.file = '';
      }
    }
    else
      {
      this.obj.run.dir = this.obj.run.file = '';
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
    var btn;
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

    this.mkdir(true);
    this.obj.outputs.dir.setValue(this.obj.run.dir);
    
    return false;
  }

  async addfile()
  {
    this.showButton('ok')
    this.obj.run.action = this.obj.run.btnrequest['addfile'];
    MneElement.mkClass(this.obj.container.weblet, 'filesystem-addfile', true, 'filesystem')

    this.mkdir();
    this.obj.outputs.dir.setValue(this.obj.run.dir);
    this.obj.inputs.name.setValue(this.obj.run.file);
    
    this.obj.inputs.name.focus();
    
    return false;
  }
  
  async filechange()
  {
    var name;
    var dir;
    
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
      dir  = this.obj.run.dir;
      name = ( this.obj.run.file ) ? this.obj.run.file : this.obj.files.name.files[0].name;
    }
    else if ( this.obj.run.dropdata.items.length )
    {
        var data = this.obj.run.act_data;

        this.obj.run.action = this.obj.run.btnrequest['rename'];
        MneElement.mkClass(this.obj.container.weblet, 'filesystem-rename', true, 'filesystem')

        this.obj.run.act_data = JSON.parse(this.obj.run.dropdata.getData('text/json'));
        this.mkdir();
        
        name = data.values[1];
        if ( data.values[data.res.rids.action].parameter[2].filetype == 'dir' )
          name = name + '/' + this.obj.run.act_data.values[1]
        dir = this.obj.run.act_data.values[0]
    }

    this.mkdir();
    this.obj.outputs.dir.setValue( dir );
    this.obj.inputs.name.modValue(name);
    
    this.obj.inputs.name.focus();
    
    if ( this.initpar.autosave ) return this.ok();

    return false;
  }
  
  async rename()
  {
    this.showButton('ok')
    this.obj.run.action = this.obj.run.btnrequest['rename'];
    MneElement.mkClass(this.obj.container.weblet, 'filesystem-rename', true, 'filesystem');

    this.mkdir(true);

    this.obj.outputs.dir.setValue(this.obj.run.dir);
    this.obj.inputs.name.setValue(this.obj.run.file);

    return false;
  }

  async filedrop(data, obj, evt)
  {
    var i;
    this.obj.files.name.modClear();
    for ( i in this.obj.outputs ) this.obj.outputs[i].setValue('');
    for ( i in this.obj.inputs  ) this.obj.inputs[i].setValue('');

    this.obj.run.act_data = data;
    this.obj.run.dropdata = evt.dataTransfer;
    this.obj.files.name.files = evt.dataTransfer.files;

    if ( ! data.res || data.values[data.res.rids.action].action == 'submenu' )
        await this.addfile();
    else
      await this.filechange();
    
    var e = new Event('change');
    this.obj.files.name.dispatchEvent(e);
    
    return false;
 }

 async ok()
  {
    var data = new FormData();
    data.append('rootInput.old', this.initpar.root);
    data.append('dirInput.old', this.obj.run.dir);
    data.append('filenameInput.old', this.obj.run.file);
    data.append('filenameInput', this.obj.inputs.name.getValue());
    data.append('overwrite', this.obj.inputs.overwrite.getValue());
    
    if (this.obj.files.name.files.length )
      data.append('dataInput', this.obj.files.name.files[0], this.obj.files.name.files[0].name);
    
    this.close();
    var res = await MneRequest.fetch(this.obj.run.action, data);

    this.obj.run.checkdepend = true;
    this.parent.treeeditok(Object.keys(this.obj.run.btnrequest).find( item => this.obj.run.btnrequest[item] == this.obj.run.action ), this);
    this.parent.newselect = true;
  }
  
  async cancel()
  {
    this.close();
  }
  
  async del()
  {
    this.obj.run.dir = '';
    this.obj.run.file = '';

    this.mkdir();
    var p =
    {
        'dirInput.old'          : this.obj.run.dir,
        'filenameInput.old'     : this.obj.run.file,
    };
    p = Object.assign(this.mkpar(), p);
    
    this.close();
    
    if ( this.obj.run.file )
    {
      if ( this.confirm(MneText.sprintf(MneText.getText("#mne_lang#<$1> wirklich löschen ?"), this.obj.run.file)) != true )
          return;
      await MneRequest.fetch(this.initpar.filedelaction, p)
    }
    else if ( this.obj.run.dir )
    {
      if ( this.confirm(MneText.sprintf(MneText.getText("#mne_lang#<$1> wirklich löschen ?"), this.obj.run.dir)) != true )
          return;
      
      this.parent.treeeditok('del', this)  
      await MneRequest.fetch(this.initpar.dirdelaction, p)
    }
    
    this.obj.run.checkdepend = true;
    this.parent.newselect = true;
  }
  
  async values()
  {
    this.obj.run.values = this.config.dependweblet.obj.run.values;
  }

}

export default MneFilesystemTreeEdit;

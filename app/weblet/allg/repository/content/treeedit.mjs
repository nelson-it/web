//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/repository/content/treeedit.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText    from '/js/basic/text.mjs'
import MneInput   from '/js/basic/input.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'

import MneView           from '/weblet/basic/view.mjs'

class MneRepositoryTreeEdit extends MneView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        frameclass : 'weblet-allg-repository',
        
        diraddaction : '/db/utils/repository/mkdir.json',
        dirdelaction : '/db/utils/repository/rmdir.json',

        repaddaction : '/db/utils/repository/addfile.json',

        fileaddaction : '/db/utils/repository/mkfile.json',
        filedelaction : '/db/utils/repository/rmfile.json',

        renameaction : '/db/utils/repository/mv.json',

        autocommit : true,
        
        notitle : true,
        nointeractive : true
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getViewPath() { return this.getView(import.meta.url) }

  reset ()
  {
    super.reset();

    this.obj.mkbuttons =
    [ 
      { id : 'adddir',     value : MneText.getText('#mne_lang#Ordner Hinzufügen#')},
      { id : 'addfile',    value : MneText.getText('#mne_lang#Datei Hinzufügen#')},
      { id : 'addrep',     value : MneText.getText('#mne_lang#Datei versionieren#')},
      { id : 'rename',     value : MneText.getText('#mne_lang#Umbenennen#')},
      { id : 'del',        value : MneText.getText('#mne_lang#Löschen#')}
    ];
    
    this.obj.enablebuttons.buttons = [];
    this.obj.mkbuttons.forEach( (item) => { this.obj.enablebuttons.buttons.push(item.id); });
    
    this.obj.enablebuttons.root =  [ 'adddir', 'addfile' ];
    this.obj.enablebuttons.dir  =  [ 'adddir', 'addfile', 'rename', 'del'];
    this.obj.enablebuttons.file =  [ 'addfile','rename', 'del'];
    this.obj.enablebuttons.vfile = [ 'addfile', 'addrep', 'rename', 'del'];
    
    this.obj.run.btnrequest = [];
    this.obj.run.btnrequest['adddir']  = this.initpar.diraddaction;
    this.obj.run.btnrequest['deldir']  = this.initpar.dirdelaction;
    this.obj.run.btnrequest['addfile'] = this.initpar.fileaddaction;
    this.obj.run.btnrequest['delfile'] = this.initpar.filedelaction;
    this.obj.run.btnrequest['rename']  = this.initpar.renameaction;
    this.obj.run.btnrequest['addrep']  = this.initpar.repaddaction;

  }
  
  async load()
  {
    await super.load();
    this.obj.observer.content.disconnect();

    this.obj.files.name.addEventListener('change', (evt) => { this.btnClick('filechange', {}, evt ); });
    this.obj.inputs.commitmessage.setTyp('char', MneInput.checktype.notempty, '');
    
  }
  
  mkdir(leaf = false )
  {
    var index;

    if ( this.obj.run.act_data )
    {
      var menuid = this.obj.run.act_data.values[this.obj.run.act_data.res.rids.menuid];
      if ( leaf || this.obj.run.act_data.values[this.obj.run.act_data.res.rids.typ] == 'leaf' )
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
      'rootInput.old'         : this.initpar.root,
      'repositoryidInput.old' : this.obj.run.values.repositoryid,
      'autocommitInput'       : ( this.initpar.autocommit == true ) ? "true" : "",
    };
  }

  openmenu(obj)
  {
    var btn;
    var i;
    this.obj.run.act_data = obj.mne_data;

    if ( ! this.obj.run.act_data )
      btn = this.obj.enablebuttons.root;
    else if ( this.obj.run.act_data.values[this.obj.run.act_data.res.rids.typ] == 'leaf' )
    {
      if ( this.obj.run.act_data.values[this.obj.run.act_data.res.rids.status]  == 'Y' )
        btn = this.obj.enablebuttons.vfile;
      else
        btn = this.obj.enablebuttons.file;
    }
    else
      btn = this.obj.enablebuttons.dir;
    
    this.obj.enablebuttons.buttons.forEach((item) => { this.obj.buttons[item].style.display = 'none' } )
    btn.forEach((item) => { this.obj.buttons[item].style.display = 'block' } )

    MneElement.mkClass(this.obj.container.weblet, 'repository-select', true, 'repository')
    
    this.obj.files.name.clearModify();
    for ( i in this.obj.outputs ) this.obj.outputs[i].setValue('');
    for ( i in this.obj.inputs  ) this.obj.inputs[i].setValue('');
  }
  
  async adddir()
  {
    this.obj.run.action = this.obj.run.btnrequest['adddir'];
    MneElement.mkClass(this.obj.container.weblet, 'repository-adddir', true, 'repository')

    this.mkdir(true);
    this.obj.outputs.dir.setValue(this.obj.run.dir);
    
    return false;
  }

  async addfile()
  {
    this.obj.run.action = this.obj.run.btnrequest['addfile'];
    MneElement.mkClass(this.obj.container.weblet, 'repository-addfile', true, 'repository')

    this.mkdir();
    this.obj.outputs.dir.setValue(this.obj.run.dir);
    this.obj.inputs.name.setValue(this.obj.run.file);
    
    return false;
  }
  
  async filechange()
  {
    this.obj.run.action = this.obj.run.btnrequest['addfile'];
    MneElement.mkClass(this.obj.container.weblet, 'repository-addfile', true, 'repository')
    
    this.mkdir();
    this.obj.outputs.dir.setValue( this.obj.run.dir );
    this.obj.inputs.name.modValue(( this.obj.run.file ) ? this.obj.run.file : this.obj.files.name.files[0].name);
    
    return false
  }
  
  async rename()
  {
    this.obj.run.action = this.obj.run.btnrequest['rename'];
    MneElement.mkClass(this.obj.container.weblet, 'repository-rename', true, 'repository');

    this.mkdir(true);

    this.obj.outputs.dir.setValue(this.obj.run.dir);
    this.obj.inputs.name.setValue(this.obj.run.file);

    return false;
  }

  async addrep()
  {
    this.obj.run.dir = '';
    this.obj.run.file = '';
    this.mkdir();

    var p = this.mkpar();

    p['dirInput.old']  = this.obj.run.dir;
    p['filenameInput'] = this.obj.run.file;

    this.close();
    if ( this.obj.run.file )
    {
      await MneRequest.fetch('/db/utils/repository/addfile.json', p);
      this.obj.run.checkdepend = true;
    }
  }
  
  async filedrop(data, obj, evt)
  {
    if ( ! data.res || data.values[data.res.rids.action].action == 'submenu' )
      await this.addfile();
    else
      await this.filechange();
    
    this.obj.files.name.files = evt.dataTransfer.files;
    var e = new Event('change');
    this.obj.files.name.dispatchEvent(e);
    
    return false;
 }

 async ok()
  {
    var data = new FormData();
    data.append('rootInput.old', this.initpar.root);
    data.append('repositoryidInput.old', this.obj.run.values.repositoryid);
    data.append('dirInput.old', this.obj.run.dir);
    data.append('filenameInput.old', this.obj.run.file);
    data.append('filenameInput', this.obj.inputs.name.getValue());
    data.append('autocommitInput', ( this.initpar.autocommit == true ) ? "true" : "");
    data.append('commitmessageInput', this.obj.inputs.commitmessage.getValue());
    
    if (this.obj.files.name.files.length )
      data.append('dataInput', this.obj.files.name.files[0], this.obj.files.name.files[0].name);
    
    this.close();
    var res = await MneRequest.fetch(this.obj.run.action, data);

    this.obj.run.checkdepend = true;
    this.parent.newselect = true;
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
    if ( this.confirm(MneText.sprintf(MneText.getText("#mne_lang#<$1> wirklich löschen ?"), this.obj.run.file)) != true )
        return;
    
    if ( this.obj.run.file )
      await MneRequest.fetch('/db/utils/repository/rmfile.json', p)
    else if ( this.obj.run.dir )
      await MneRequest.fetch('/db/utils/repository/rmdir.json', p)
    
    this.obj.run.checkdepend = true;
    this.parent.newselect = true;
  }
  
  async values()
  {
    this.obj.run.values = this.config.dependweblet.obj.run.values;
  }

}

export default MneRepositoryTreeEdit;

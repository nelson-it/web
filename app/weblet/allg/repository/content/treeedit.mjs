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
        
        diraddaction : 'db/utils/repository/mkdir.json',
        dirdelaction : 'db/utils/repository/rmdir.json',

        repaddaction : 'db/utils/repository/addfile.json',

        fileaddaction : 'db/utils/repository/mkfile.json',
        filedelaction : 'db/utils/repository/rmfile.json',

        renameaction : 'db/utils/repository/mv.json',

        autocommit : true,
        
        notitle : true,
        nointeractive : true,
        hinput: true
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
      { id : 'addrep',     value : MneText.getText('#mne_lang#Datei versionieren#')},
      { id : 'rename',     value : MneText.getText('#mne_lang#Umbenennen#')},
      { id : 'del',        value : MneText.getText('#mne_lang#Löschen#')}
    ];
    
    this.obj.enablebuttons.buttons = [];
    this.obj.mkbuttons.forEach( (item) => { this.obj.enablebuttons.buttons.push(item.id); });
    
    this.obj.enablebuttons.ok   =  [ 'ok', 'cancel' ];
    this.obj.enablebuttons.root =  [ 'adddir',  'addfile' ];
    this.obj.enablebuttons.dir  =  [ 'adddir',  'addfile', 'rename', 'del'];
    this.obj.enablebuttons.file =  [ 'addfile', 'rename', 'del'];
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
      'rootInput.old'         : this.initpar.root,
      'repositoryidInput.old' : this.obj.run.values.repositoryid,
      'autocommitInput'       : ( this.initpar.autocommit == true ) ? "true" : "",
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

    if ( ! this.obj.run.act_data )
       this.showButton('root')
    else if ( this.obj.run.act_data.values[this.obj.run.act_data.res.rids.typ] == 'leaf' )
    {
      if ( this.obj.run.act_data.values[this.obj.run.act_data.res.rids.status]  == 'Y' )
       this.showButton('vfile')
      else
       this.showButton('file')
        btn = this.obj.enablebuttons.file;
    }
    else
       this.showButton('dir')

    MneElement.mkClass(this.obj.container.weblet, 'repository-select', true, 'repository')
    
    this.obj.files.name.modClear();
    for ( i in this.obj.outputs ) this.obj.outputs[i].setValue('');
    for ( i in this.obj.inputs  ) this.obj.inputs[i].setValue('');
  }
  
  async adddir()
  {
    this.showButton('ok')
    this.obj.run.action = this.obj.run.btnrequest['adddir'];
    MneElement.mkClass(this.obj.container.weblet, 'repository-adddir', true, 'repository')

    this.mkdir();
    this.obj.inputs.name.focus();
    
    return false;
  }

  async addfile()
  {
    this.showButton('ok')
    this.obj.run.action = this.obj.run.btnrequest['addfile'];
    MneElement.mkClass(this.obj.container.weblet, 'repository-addfile', true, 'repository')

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
        MneElement.mkClass(this.obj.container.weblet, 'repository-adddir', true, 'repository')
      }
      else
      {
        this.obj.run.action = this.obj.run.btnrequest['addfile'];
        MneElement.mkClass(this.obj.container.weblet, 'repository-addfile', true, 'repository')
      }

      if ( ! this.obj.inputs.name.getValue() )
        this.obj.inputs.name.modValue(this.obj.files.name.files[0].name);
    }
    this.obj.inputs.name.focus();
    
    return false
  }
  
  async rename()
  {
    this.showButton('ok')
    this.obj.run.action = this.obj.run.btnrequest['rename'];
    MneElement.mkClass(this.obj.container.weblet, 'repository-rename', true, 'repository');

    this.mkdir(true);
    this.obj.inputs.name.focus();
    return false;

  }

  async addrep()
  {
    this.showButton('ok')
    this.obj.run.action = this.obj.run.btnrequest['addrep'];
    MneElement.mkClass(this.obj.container.weblet, 'repository-addrep', true, 'repository');

    this.mkdir();
    this.obj.inputs.commitmessage.focus();
    return false;
  }
  
  async filedrop(data, obj, evt)
  {
    var i,d;
    this.obj.files.name.modClear();
    for ( i in this.obj.outputs ) this.obj.outputs[i].setValue('');
    for ( i in this.obj.inputs  ) this.obj.inputs[i].setValue('');

    if ( evt.dataTransfer.dropEffect == 'move' )
    {
      this.obj.run.action = this.obj.run.btnrequest['rename'];
      MneElement.mkClass(this.obj.container.weblet, 'repository-renamefile', true, 'repository');

      d = this.obj.run.act_data = JSON.parse(evt.dataTransfer.getData('text/json'));
      this.mkdir();

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
          MneElement.mkClass(this.obj.container.weblet, 'repository-renamedir', true, 'repository');
          this.obj.inputs.name.setValue(d.values[d.res.rids.item])
        }
      }
    }
    else
    {
      MneElement.mkClass(this.obj.container.weblet, 'repository-addfile', true, 'repository');
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
    data.append('rootInput.old', this.initpar.root);
    data.append('repositoryidInput.old', this.obj.run.values.repositoryid);
    data.append('dirInput.old', this.obj.outputs.dirold.getValue());
    data.append('filenameInput.old', this.obj.outputs.nameold.getValue());
    data.append('dirInput', this.obj.inputs.dir.getValue());
    data.append('filenameInput', this.obj.inputs.name.getValue());
    data.append('autocommitInput', ( this.initpar.autocommit == true ) ? "true" : "");
    data.append('commitmessageInput', this.obj.inputs.commitmessage.getValue());
    data.append('overwrite', "1");

    
    if (this.obj.files.name.files.length )
      data.append('dataInput', this.obj.files.name.files[0], this.obj.files.name.files[0].name);
    
    this.close();
    var res = await MneRequest.fetch(this.obj.run.action, data);

    if ( this.parent.obj.run.dragelement && this.parent.obj.run.dragelement.parentNode )
    {
      this.parent.obj.run.dragelement.parentNode.removeChild(this.parent.obj.run.dragelement);
      this.parent.obj.run.dragelement = undefined;
    }
    
    this.obj.run.checkdepend = true;
    this.parent.newselect = true;
  }
  
  async cancel()
  {
    this.close();
  }

  async del(data, obj, evt)
  {
    if ( evt.dataTransfer && evt.dataTransfer.getData('text/plain').indexOf('mne_repository') == 0 )
      this.obj.run.act_data = JSON.parse(evt.dataTransfer.getData('text/json'));
      
    this.mkdir();
    var p =
    {
        'repositoryidInput.old' : this.obj.run.values.repositoryid,
        'dirInput.old'          : this.obj.outputs.dirold.getValue(),
        'filenameInput.old'     : this.obj.outputs.nameold.getValue(),
    };
    p = Object.assign(this.mkpar(), p);
    
    this.close();
    
    if ( this.obj.outputs.nameold.getValue() != '' )
    {
      if ( this.confirm(MneText.sprintf(MneText.getText("#mne_lang#<$1> wirklich löschen ?"), this.obj.outputs.nameold.getValue() )) != true )
          return;
      await MneRequest.fetch(this.initpar.filedelaction, p)
    }
    else if ( this.obj.outputs.dirold.getValue() != '' )
    {
      if ( this.confirm(MneText.sprintf(MneText.getText("#mne_lang#<$1> wirklich löschen ?"), this.obj.outputs.dirold.getValue() )) != true )
          return;
      
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

export default MneRepositoryTreeEdit;

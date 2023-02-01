//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/filesystem/view.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'

import MneElement from '/weblet/basic/element.mjs'
import MnePopup   from '/weblet/basic/popup.mjs'

import MneView  from '/weblet/basic/view.mjs'

class MneFilesystemView extends MneView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        frameclass : 'weblet-allg-filesystem',

        url : 'file/ls.json',
        readpar :
        {
             'dirInput.old' : '',
        'pointdirInput.old' : '',
        },
        
        root     : 'dataroot',
        actioncol: 2,
        autosave : false,

        hinput : false
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + 'allg/filesystem/filesystem.css'; }

  reset ()
  {
    super.reset();
    
    this.obj.readurl = this.initpar.url;
    this.obj.htmlcontent = '<div id="iconContainer"><div id="trashIcon" class="icon"></div></div><div id="listContainer"></div>'
    
    this.obj.mkbuttons = [];
    
    this.obj.run.readpar = Object.assign({ 'rootInput.old' : this.initpar.root }, this.initpar.readpar );
    this.obj.popups['edit'] = new MnePopup( 'edit', {root : 'album', autosave : this.initpar.autosave }, { nointeractive : true, composeparent : this, htmlcomposetabid : 'edit', id : 'edit', position : 'popup', path : '/weblet/allg/filesystem/treeedit', depend : [], label : MneText.getText('#mne_lang#Bearbeiten') } );
    
    this.obj.evt = { list : {}, icon : {} };
    this.obj.evt.list.click = async (evt) => { if ( this.obj.weblets.edit ) this.obj.weblets.edit.close(); };
    this.obj.evt.list.contextmenu = async (evt) =>
    {
      evt.preventDefault();
      var obj = evt.target;
      var data;
      
      for ( data = obj.mne_data; ! data && obj != this.obj.container.list; obj = obj.parentNode, data = obj.mne_data );
 
      await this.openpopup('edit');
      this.obj.popups.edit.popup.frame.style.left = evt.clientX + "px";
      this.obj.popups.edit.popup.frame.style.top = evt.clientY  + "px";
      this.obj.weblets.edit.openmenu(obj);
      return false;
    }
    
    this.obj.evt.list.dragstart = async (evt) =>
    {
       evt.dataTransfer.setData('text/json', JSON.stringify(evt.target.mne_data));
       evt.dataTransfer.setData('text/plain', 'mne_filesystem: ' + this.frame.id);
    };
    
    this.obj.evt.list.dragover = async (evt) =>
    {
      var isfile = evt.dataTransfer.types.includes('Files');
      var isown  = evt.dataTransfer.getData('text/plain').indexOf('mne_filesystem') == 0;
      
      if ( isfile || isown )
      {
        var obj = evt.target;
        var data;
      
        for ( data = obj.mne_data; ! data && obj != this.obj.container.list; obj = obj.parentNode, data = obj.mne_data );
        
        ( this.obj.container.content.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));

        if ( data && ! (evt.dataTransfer.getData('text/plain').indexOf('mne_filesystem: ' + this.frame.id) == 0 && obj == this.obj.container.list ) )
        {
        
          if ( ( data.values[data.res.rids.action].parameter[2].filetype ?? 'dir' ) == 'dir' ) 
          {
              if (  isfile )
                evt.dataTransfer.dropEffect = 'move';
              else
                evt.dataTransfer.dropEffect = 'copy';
              MneElement.mkClass(obj, 'dropover')
          }
          else if ( isfile )
          {
            evt.dataTransfer.dropEffect = 'move';
            MneElement.mkClass(obj, 'dropover')
          }
          else
          {
            evt.dataTransfer.dropEffect = 'none';
          }
        }
        else
           evt.dataTransfer.dropEffect = 'none';
            
        evt.preventDefault();
      }
    };

    this.obj.evt.icon.dragover = async (evt) =>
    {
      var isown  = evt.dataTransfer.getData('text/plain').indexOf('mne_filesystem') == 0;
      
      if ( isown )
      {
        var obj = evt.target;
        var data;
      
        for ( data = obj.mne_data; ! data && obj != this.obj.container.icon; obj = obj.parentNode, data = obj.mne_data );
        
        ( this.obj.container.icon.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));

        if ( data )
        {
              evt.dataTransfer.dropEffect = 'move';
              MneElement.mkClass(obj, 'dropover')
        }
        else
           evt.dataTransfer.dropEffect = 'none';
            
        evt.preventDefault();
      }
    };

    this.obj.evt.list.dragleave = async (evt) =>
    {
      ( this.obj.container.content.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));
    };
    
    this.obj.evt.list.drop = async (evt) => 
    {
      evt.preventDefault();

      var obj = evt.target;
      var data;
      
      for ( data = obj.mne_data; ! data; obj = obj.parentNode, data = obj.mne_data );
       
      var ok = obj.classList.contains('dropover');
      
      ( this.obj.container.content.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));

      if ( ok )
      {
        await this.openpopup('edit');

        this.obj.popups.edit.popup.frame.style.left = evt.clientX + "px";
        this.obj.popups.edit.popup.frame.style.top = evt.clientY  + "px";

        this.obj.weblets.edit.btnClick('filedrop' , data, evt.target, evt);
      }
    };
  }
  
  async check_values()
  {
    var mustcheck = false;
    var self = this;
    
    if ( this.obj.weblets.edit && this.obj.weblets.edit.obj.run.checkdepend  )
    {
      this.dependweblet = this;
      this.obj.weblets.edit.obj.run.checkdepend = false;
    }
    return super.check_values();
  }

  async load()
  {
    await super.load();
    await this.createpopup('edit', {notsetdepend : true }, {});
    
    var self = this;
    Object.entries(this.obj.evt).forEach( (frame) => { Object.entries(frame[1]).forEach( (event) => { self.obj.container[frame[0]].addEventListener(event[0], event[1]) }) });
    
    this.frame.querySelector("#trashIcon").mne_data = {};
  }
  
  async refresh()
  {
    this.obj.run.values = { parameter : [ "", "", {} ] };
    this.dependweblet = this;
    return this.values()
  }
  
  async eleClick(index, obj, evt)
  {
    var p = obj.mne_data.values[this.obj.run.res.rids.action];
     
    this.obj.run.values = p;
    if ( p.action == 'submenu')
      this.dependweblet = this;
    else
      this.newselect = true;
  }

  getReadParam(values, ignore_error)
  {
    var par = Object.assign({}, this.obj.run.readpar);
    var actioncol = ( this.obj.run.res ) ? this.obj.run.res.rids.action ?? this.initpar.actioncol : this.initpar.actioncol;
    
    par['dirInput.old'] = this.obj.run.dir = values.parameter[actioncol].fullname ?? '';
    par['ignore_error'] = ignore_error;
    return par;
  }

  treeeditok(typ, weblet)
  {
    var actioncol = ( this.obj.run.res ) ? this.obj.run.res.rids.action ?? this.initpar.actioncol : this.initpar.actioncol;
    if ( this.obj.weblets.edit.obj.run.values.parameter[0] == this.obj.container.list.mne_data.values[0])
    {
      var actioncol = ( this.obj.run.res ) ? this.obj.run.res.rids.action ?? this.initpar.actioncol : this.initpar.actioncol;
      var dir = this.obj.run.values.parameter[0];
      
      if ( typ == 'rename' && weblet.obj.run.act_data.values[weblet.obj.run.act_data.res.rids.action].parameter[2].filetype == 'dir' )
      {
        this.obj.run.values.parameter[actioncol].fullname = dir.substring(0, dir.length - this.obj.run.values.parameter[1].length) + this.obj.weblets.edit.obj.inputs.name.getValue();
      }
      else if ( typ == 'del' )
      {
        this.obj.run.values.parameter[actioncol].fullname = dir.substring(0, dir.length - this.obj.run.values.parameter[1].length - 1);
      }
      
      this.dependweblet = this;
    }
  }

  async mkElement(index)
  {
    var a = this.obj.run.res.values[index][this.obj.run.res.rids.action];
    var p = a.parameter[2];
    var img = '';
    var str = p.name.toLowerCase().split('.');

    if ( str.length > 1 )
    {
      switch(str[str.length - 1] )
      {
      case "jpg" :
      case "jpeg" :
      case "png" :
      case "tiff" :
      case "gif" :
        img = '<div class="filesystem-list-img" style="background-image: url(\'file/images/mk_icon.php?rootInput.old=' + this.initpar.root + '&dirInput.old=' + this.obj.run.dir + '&name=' + p.name + '&y=300&mtime=' + p.modifytime + '\')"></div>';
      }
    }
    
    return '<div id="filesystem-list-element' + index + '" class="filesystem-list-element ' + p.filetype + '" draggable="true">' + img + '<div id="name">' + p.name + '</div></div>';
  }
  
  async values()
  {
    var  i,j,data,str;
    var res;
    
    var dependweblet = ( this.obj.run.dependweblet ) ? this.obj.run.dependweblet : this.config.dependweblet;
    var values = dependweblet.obj.run.values;
    
    this.obj.container.list.innerHTML = '';
    this.obj.run.dependweblet = undefined;
    this.title = '';

    try 
    {
       res = this.obj.run.res = await MneRequest.fetch(this.obj.readurl, this.getReadParam(values, true));
    }
    catch(e)
    {
       await this.config.dependweblet.values();
       values = this.config.dependweblet.obj.run.values;
       res = this.obj.run.res = await MneRequest.fetch(this.obj.readurl, this.getReadParam(values));
    }
    
    this.title = '/' + this.obj.run.dir;
    
    var actioncol = ( this.obj.run.res ) ? this.obj.run.res.rids.action ?? this.initpar.actioncol : this.initpar.actioncol;
    this.obj.container.list.mne_data = { res : res }
    this.obj.container.list.mne_data.values = [ values.parameter[actioncol].fullname ?? '', values.parameter[actioncol].name ?? '', Object.assign({}, values) , '', "0"];

    str = '';
    for ( i = 0; i<res.values.length; i++)
    {
       res.values[i][res.rids.action] = JSON.parse(res.values[i][res.rids.action]);
       str += await this.mkElement(i)
    }
    
    this.obj.container.list.innerHTML = str;
    this.obj.run.savevalues = this.obj.run.values = Object.assign({}, dependweblet.obj.run.values);
    this.obj.run.values.root = this.initpar.root;
    this.obj.run.values.dir = this.obj.run.dir;
    
    var self = this;
    this.obj.container.list.querySelectorAll(".filesystem-list-element").forEach( function (obj, index)
    {
      var val = res.values[parseInt(obj.id.substring(23))];
      val[actioncol].root = self.initpar.root;
      val[actioncol].dir = self.obj.run.values.dir;
      val[actioncol].filename = val[res.rids.item];
      
      obj.addEventListener('click', async function(evt) { await self.btnClick('eleClick', index, obj, evt) } );
      obj.mne_data = { res : res, values : res.values[parseInt(obj.id.substring(23))] };
    });
    
    res.values = undefined;
  }
}


export default MneFilesystemView;

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
        frameclass : 'weblet-allg-filesystem-view weblet-allg-filesystem',

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
    
    if ( ! this.initpar.rootnew ) this.initpar.rootnew = this.initpar.root;
    
    this.obj.run.readpar = Object.assign({ 'rootInput.old' : this.initpar.root }, this.initpar.readpar );
    this.obj.popups['edit'] = new MnePopup( 'edit', {root : this.initpar.root,  rootnew : this.initpar.rootnew, autosave : this.initpar.autosave }, { nointeractive : true, composeparent : this, htmlcomposetabid : 'edit', id : 'edit', position : 'popup', path : '/weblet/allg/filesystem/treeedit', depend : [], label : MneText.getText('#mne_lang#Bearbeiten') } );
    
    this.obj.evt = { list : {}, icon : {} };
    this.obj.evt.list.click = async () => { if ( this.obj.weblets.edit ) this.obj.weblets.edit.close(); };
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
       evt.dataTransfer.setData('text/plain', 'mne_filesystem: ' + this.fullid);
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

        if ( data )
        {
          if (  isfile )
            evt.dataTransfer.dropEffect = 'copy';
          else
            evt.dataTransfer.dropEffect = 'move';
          MneElement.mkClass(obj, 'dropover')
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

    this.obj.evt.list.dragleave = async () =>
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
    this.obj.evt.icon.drop = async (evt) => 
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

        this.obj.weblets.edit.btnClick('del' , data, evt.target, evt);
      }
    };
  }
  
  async check_values()
  {
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
  
  async eleClick(_index , obj, _evt )
  {
    var p = obj.mne_data.values[this.obj.run.res.rids.action];
     
    ( this.obj.container.content.querySelectorAll('.selected') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'selected', false));
    MneElement.mkClass(obj, 'selected');

    this.obj.run.values = p;
    
    if ( p.action == 'submenu')
    {
    	this.obj.run.savevalues = p;
    	this.dependweblet = this; 
    }
    else
    {
      this.obj.scrollTop  = this.obj.container.list.scrollTop;
      this.obj.scrollLeft = this.obj.container.list.scrollLeft;
      this.newselect = true;
    }
  }

  getReadParam(values, ignore_error)
  {
    var par = Object.assign({}, this.obj.run.readpar);
    var actioncol = ( this.obj.run.res ) ? this.obj.run.res.rids.action ?? this.initpar.actioncol : this.initpar.actioncol;
    
    par['dirInput.old'] = this.obj.run.dir = values.parameter[actioncol].fullname ?? '';
    par['ignore_error'] = ignore_error;
    return par;
  }

  treeeditok(_typ, _weblet)
  {
      this.dependweblet = this;
  }

  async mkElement(index)
  {
    var a = this.obj.run.res.values[index][this.obj.run.res.rids.action];
    var p = a.parameter[2];
    var img = '';
    //var ftyp = p.name.toLowerCase().split('.');
    var fclass = '';

    //ftyp = MneFile.filetyps[(( ftyp.length > 1 ) ? ftyp[ftyp.length - 1] : '').toLowerCase()] ?? { mime : 'text/plain' };
     
    switch( true )
    {
      case p.mime.indexOf('image') == 0 :
        img = '<div class="filesystem-list-img" style="background-image: url(\'file/icon.jpg?rootInput.old=' + this.initpar.root + '&dirInput.old=' + this.obj.run.dir + '&name=' + p.name + '&y=300&mtime=' + p.modifytime + '\')"></div>';
        fclass = 'image';
        break;

      case p.mime.indexOf('video') == 0 :
        img = '<div class="filesystem-list-img" style="background-image: url(\'file/icon.jpg?rootInput.old=' + this.initpar.root + '&dirInput.old=' + this.obj.run.dir + '&name=' + p.name + '&y=300&mtime=' + p.modifytime + '\')"></div>';
        fclass = 'video';
        break;
        
      case p.mime.indexOf('audio') == 0 :
        fclass = 'audio';
        break;
        
      case p.mime.indexOf('application') == 0 :
        fclass = 'application';
        break;

    }
    return '<div id="filesystem-list-element' + index + '" class="filesystem-list-element ' + p.filetype + ' ' + fclass + '" draggable="true">' + img + '<div id="name">' + p.name + '</div></div>';
  }
  
  async values()
  {
    var  i,str;
    var res;
    
    var dependweblet = ( this.obj.run.dependweblet ) ? this.obj.run.dependweblet : this.config.dependweblet;
    var values = ( dependweblet == this ) ? this.obj.run.savevalues : dependweblet.obj.run.values;
    
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
    this.obj.run.savevalues = this.obj.run.values = Object.assign({}, values);
    this.obj.run.values.root = this.initpar.root;
    this.obj.run.values.dir = this.obj.run.dir;
    
    var self = this;
    this.obj.container.list.querySelectorAll(".filesystem-list-element").forEach( function (obj, index)
    {
      var val = res.values[parseInt(obj.id.substring(23))];
      val[actioncol].root = self.initpar.root;
      val[actioncol].dir = self.obj.run.values.dir;
      val[actioncol].filename = val[res.rids.item];
      val[actioncol].index = index;
      
      obj.addEventListener('click', async function(evt) { await self.btnClick('eleClick', index, obj, evt) } );
      obj.mne_data = { res : res, values : res.values[parseInt(obj.id.substring(23))] };
    });
    
    this.obj.container.list.scrollTop  = this.obj.scrollTop ?? 0;
    this.obj.container.list.scrollLeft = this.obj.scrollLeft ?? 0;
 
    this.obj.scrollTop = 0;
    this.obj.scrollLeft = 0;
    
    res.values = undefined;
  }
}


export default MneFilesystemView;

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/filesystem/tree.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs'
//import MneLog     from '/js/basic/log.mjs'
//import MneRequest from '/js/basic/request.mjs'

import MneElement from '/weblet/basic/element.mjs'
import MnePopup   from '/weblet/basic/popup.mjs'

import MneMenuRecursive  from '/weblet/allg/menu/recursive.mjs'

class MneFilesystemTree extends MneMenuRecursive
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        frameclass : 'weblet-allg-filesystem',

        root : 'dataroot',

        url : 'file/ls.json',
        readpar :
        {
             'dirInput.old' : '',
        'pointdirInput.old' : '',
        },
        
        noleaf : '',
        showids : [ 'parentid' ],

      hinput : false
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + 'allg/filesystem/filesystem.css'; }

  async check_values()
  {
    var openmenu = this.obj.act_openmenu;
    var values = this.obj.run.values;
    
    if ( this.obj.act_refreshmenu )
    {
       if ( this.obj.act_refreshmenu.frame )
       {
         await this.action_submenu(Object.assign({ refresh : true }, this.obj.act_refreshmenu));
         if ( this.obj.run.dragelement)
           this.obj.run.dragelement.parentNode.removeChild(this.obj.run.dragelement);
       }
       else if ( this.initpar.noleaf )
       {
         this.newvalues = true;
       }
       else
       {
         this.obj.run.newvalues = true;
       }
    }
    
    this.obj.act_openmenu = this.obj.act_refreshmenu = this.obj.run.dropdata = this.obj.run.dragelement = undefined;

    await super.check_values();
    this.obj.act_openmenu = openmenu;
    this.obj.run.values = values;
  }
  
  reset ()
  {
    super.reset();
    this.obj.readurl = this.initpar.url;
    this.initpar.readpar['pointdirInput.old'] = this.initpar.pointdir ?? true;
    this.initpar.rootnew = this.initpar.rootnew ?? this.initpar.root;
    
    this.obj.run.readpar = Object.assign({ 'rootInput.old' : this.initpar.root }, this.initpar.readpar );
    this.obj.popups['edit'] = new MnePopup( 'edit', {root : this.initpar.root, rootnew : this.initpar.rootnew, autosave : this.initpar.autosave, noleaf : this.initpar.noleaf }, { nointeractive : true, composeparent : this, htmlcomposetabid : 'edit', id : 'edit', position : 'popup', path : '/weblet/allg/filesystem/treeedit', depend : [], label : MneText.getText('#mne_lang#Bearbeiten') } );
    this.obj.run.values = { parameter : [ "", "", {} ] };
    
    this.obj.observer.frame = new IntersectionObserver((is) => { if ( is[0].isIntersecting == 0 && this.obj.popups.edit.popup ) this.obj.popups.edit.close() }, { root : document.body } );
    this.obj.observer.frame.observe(this.frame);

  }
  
  async load()
  {
    await super.load();
    this.obj.container.content.addEventListener('contextmenu', async (evt) =>
    {
      evt.preventDefault();
      
      await this.openpopup('edit');
      this.obj.popups.edit.popup.frame.style.left = evt.clientX + "px";
      this.obj.popups.edit.popup.frame.style.top = evt.clientY  + "px";
      this.obj.weblets.edit.openmenu(evt.target);
      return false;
    });

    this.obj.container.content.addEventListener('click', async (_evt) => { if ( this.obj.weblets.edit ) this.obj.weblets.edit.close(); } );

    this.obj.container.content.addEventListener('dragstart', async (evt) =>
    {
       evt.dataTransfer.setData('text/json', JSON.stringify(evt.target.mne_data));
       evt.dataTransfer.setData('text/plain', 'mne_filesystem: ' + this.frame.id);
       
       this.obj.run.dragelement = evt.target;
    });
    
    this.obj.container.content.addEventListener('dragover', async (evt) =>
    {
      if ( this.obj.timeout ){ window.clearTimeout(this.obj.timeout); this.obj.timeout = undefined; }
      ( this.obj.container.content.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));
      
      var isfile = evt.dataTransfer.types.includes('Files');
      var isown  = evt.dataTransfer.getData('text/plain').indexOf('mne_filesystem') == 0;
      var data = evt.target.mne_data;

      if ( ( isfile || isown ) && data )
      {
        if (  isfile )
          evt.dataTransfer.dropEffect = 'copy';
        else
          evt.dataTransfer.dropEffect = 'move';
        MneElement.mkClass(evt.target, 'dropover')
        if ( data.values[data.res.rids.action].action == 'submenu' && data.menu && data.menu.className.indexOf('menuopen') == -1 )
            this.obj.timeout = window.setTimeout(async () => { var v = this.obj.run.values; await this.action_submenu(data, false); this.obj.run.values = v}, 1000);
      }
      else
        evt.dataTransfer.dropEffect = 'none';

      evt.preventDefault();
    });
    
    this.obj.container.content.addEventListener('dragleave', async (_evt) =>
    {
      ( this.obj.container.content.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));
      if ( this.obj.timeout ){ window.clearTimeout(this.obj.timeout); this.obj.timeout = undefined; }
    });
    
    this.obj.container.content.addEventListener('drop', async (evt) => 
    {
      evt.preventDefault();
      var data = evt.target.mne_data;
      
      ( this.obj.container.content.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));

      this.obj.run.dropdata = data;
      
      await this.openpopup('edit');

      this.obj.popups.edit.popup.frame.style.left = evt.clientX + "px";
      this.obj.popups.edit.popup.frame.style.top = evt.clientY  + "px";

      this.obj.weblets.edit.btnClick('filedrop' , data, evt.target, evt);
    });

  }
  
  mk_submenu( container, res, data )
  {
    if ( data.menu == null )
    {
      var div = document.createElement('div');
      div.className = this.initpar.classname + 'leaf';
      div.innerHTML = '<div class="' + this.initpar.classname + 'link"></div>'
      div.firstChild.innerHTML =  ".";
      this.mkButton('treelink', div.firstChild, {res : { rids : {menuid : 0, item : 1, action : 2 }}, values : [ '', '', { action : 'submenu', parameter : [ '', '', { name : '', fullname : '', filetype : "dir" }] }] }, 'values');
      container.appendChild(div);
    }
      
    super.mk_submenu(container, res, data );
    container.querySelectorAll('.treelink').forEach( ( item ) => { item.draggable = true });
  }

  async action_submenu( data, dblclick )
  {
    await super.action_submenu(data, dblclick );

    if (this.initpar.noleaf)
    {
      var rids = data.res.rids;
      var action = data.values[rids.action ?? this.initpar.actioncol];

      this.obj.run.values = action;
      ( this.initpar.selectok && dblclick ) ? this.initpar.selectok(this.obj.run.values.parameter[2]) : this.newselect = true;
    }
  }

  async action_show(data)
  {
    this.obj.run.values = {};
    await super.action_show(data);
    
    var index;
    var menuid = this.obj.run.values.menuid;
    
    this.obj.run.values.dir = ((index = menuid.lastIndexOf('/')) < 0) ? "" : menuid.substring(0, index);
    this.obj.run.values.filename = (index < 0) ? menuid : menuid.substr(index + 1);
  }

  getReadParam(data)
  {
    var par = Object.assign({}, this.obj.run.readpar);
    par['dirInput.old'] = data.values[data.res.rids.menuid];
    par['noleaf'] = this.initpar.noleaf;
    return par;
  }

  treeeditok(typ, weblet)
  {
    if ( typ == 'adddir' || typ == 'addfile' )
    {
        this.obj.act_refreshmenu = ( weblet.obj.run.act_data ) ? weblet.obj.run.act_data : this.obj.container.content.firstChild.firstChild.mne_data;
    }
    else if ( typ == 'del' )
    {
        this.obj.act_refreshmenu = weblet.obj.run.act_data.parent;
    }
    else if ( typ == 'rename' )
    {
      this.obj.act_refreshmenu = this.obj.run.dropdata ?? weblet.obj.run.act_data.parent;

      if ( weblet.obj.run.act_data.values[0] == this.obj.run.values.parameter[0] )
      {
        var actioncol = ( this.obj.run.res ) ? this.obj.run.res.rids.action ?? this.initpar.actioncol : this.initpar.actioncol;
        var dir = this.obj.run.values.parameter[0];
        var name = weblet.obj.inputs.name.getValue();
        
        this.obj.run.values.parameter[0] = this.obj.run.values.parameter[actioncol].fullname = dir.substring(0, dir.length - this.obj.run.values.parameter[1].length) + name;
        this.obj.run.values.parameter[1] = this.obj.run.values.parameter[actioncol].name = name;
      }
    }
  }
  
  async values()
  {
    var i;
    var rids = { action : 0, menuid : 2 };
    var wval = '';
    
    for( i =0; i<this.initpar.showids.length - 1; i++)
    {
      var val;
      var w = this.config.dependweblet;
      if ( this.initpar.showalias && this.initpar.showalias[i] )
        val = this.initpar.showalias[i]();
      else
        val = w.obj.run.values[this.initpar.showids[i]];
      wval += (val + ',');
    }
    
    if ( this.initpar.showids && this.initpar.showids.length ) this.obj.readparam.wval = wval;
    
    this.obj.run.values = { action : 'submenu', parameter : [ "", "", {} ] }
    await this.action_submenu( { menu : null, values : [this.obj.run.values, '', '', '', ''], res : { rids : rids }, frame : this.obj.container.tree});
  }
}


export default MneFilesystemTree;

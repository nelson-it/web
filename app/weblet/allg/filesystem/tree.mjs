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
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'

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
        
        showids : [ 'parentid' ],

      hinput : false
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + 'allg/filesystem/filesystem.css'; }

  async check_values()
  {
    var mustcheck = false;
    var self = this;
    var openmenu = this.obj.act_openmenu;
    var values = this.obj.run.values;
    
    if ( this.obj.act_refreshmenu )
    {
       await this.action_submenu(Object.assign({ refresh : true }, this.obj.act_refreshmenu));
       this.obj.act_openmenu = this.obj.act_refreshmenu = undefined;
    }

    await super.check_values();
    this.obj.act_openmenu = openmenu;
    this.obj.run.values = values;
  }
  
  reset ()
  {
    super.reset();
    this.obj.readurl = this.initpar.url;
    this.initpar.readpar['pointdirInput.old'] = this.initpar.pointdir;
    this.obj.run.readpar = Object.assign({ 'rootInput.old' : this.initpar.root }, this.initpar.readpar );
    this.obj.popups['edit'] = new MnePopup( 'edit', {root : 'album' }, { nointeractive : true, composeparent : this, htmlcomposetabid : 'edit', id : 'edit', position : 'popup', path : '/weblet/allg/filesystem/treeedit', depend : [], label : MneText.getText('#mne_lang#Bearbeiten') } );
    this.obj.run.values = { parameter : [ "", "", {} ] };
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

    this.obj.container.content.addEventListener('click', async (evt) => { if ( this.obj.weblets.edit ) this.obj.weblets.edit.close(); } );
    this.obj.container.content.addEventListener('dragover', async (evt) =>
    {
      if ( evt.dataTransfer.types.includes('Files') )
      {
        var data = evt.target.mne_data;

        if ( this.obj.timeout ){ window.clearTimeout(this.obj.timeout); this.obj.timeout = undefined; }
        ( this.obj.container.content.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));

        if ( data )
        {
          MneElement.mkClass(evt.target, 'dropover')
          if ( data.values[data.res.rids.action].action == 'submenu' && data.menu.className.indexOf('menuopen') == -1 )
          {
            this.obj.timeout = window.setTimeout(() => { this.action_submenu(data, false); }, 1000);
          }
        }
        evt.dataTransfer.dropEffect = 'copy';
        evt.preventDefault();
      }
    });
    
    this.obj.container.content.addEventListener('dragleave', async (evt) =>
    {
      ( this.obj.container.content.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));
      if ( this.obj.timeout ){ window.clearTimeout(this.obj.timeout); this.obj.timeout = undefined; }
    });
    
    this.obj.container.content.addEventListener('drop', async (evt) => 
    {
      evt.preventDefault();
      var data = evt.target.mne_data;
      
      ( this.obj.container.content.querySelectorAll('.dropover') ?? [] ).forEach( (item) => MneElement.mkClass(item, 'dropover', false));

      await this.openpopup('edit');

      this.obj.popups.edit.popup.frame.style.left = evt.clientX + "px";
      this.obj.popups.edit.popup.frame.style.top = evt.clientY  + "px";

      this.obj.weblets.edit.openmenu(evt.target);
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
      this.mkButton('treelink', div.firstChild, {}, 'values');
      container.appendChild(div);
    }
      
    return super.mk_submenu(container, res, data );
  }

  async action_submenu( data, dblclick )
  {
    await super.action_submenu(data, dblclick );

    var rids = data.res.rids;
    var action = data.values[rids.action ?? this.initpar.actioncol];
    
    this.obj.run.values = action;
    
    this.newselect = true;
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
    if ( typ == 'del')
    {
      if ( this.obj.act_openmenu && weblet.obj.run.values.parameter[0] == this.obj.act_openmenu.values[this.obj.act_openmenu.res.rids.menuid] )
      {
        this.obj.act_refreshmenu = this.obj.act_openmenu.parent;
      }
    }
    else if ( typ == 'rename')
    {
      var actioncol = ( this.obj.run.res ) ? this.obj.run.res.rids.action ?? this.initpar.actioncol : this.initpar.actioncol;
      if ( weblet.obj.run.values.parameter[0] == this.obj.run.values.parameter[0] )
      {
        var actioncol = ( this.obj.run.res ) ? this.obj.run.res.rids.action ?? this.initpar.actioncol : this.initpar.actioncol;
        var dir = this.obj.run.values.parameter[0];
        var name = weblet.obj.inputs.name.getValue();
        
        this.obj.run.values.parameter[0] = this.obj.run.values.parameter[actioncol].fullname = dir.substring(0, dir.length - this.obj.run.values.parameter[1].length) + name;
        this.obj.run.values.parameter[1] = this.obj.run.values.parameter[actioncol].name = name;
        this.obj.act_refreshmenu = this.obj.act_openmenu.parent;
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
    
    this.obj.run.values = { parameter : [ "", "", {} ] }
    await this.action_submenu( { menu : null, values : [this.obj.run.values, '', '', '', ''], res : { rids : rids }, frame : this.obj.container.tree});
  }

}


export default MneFilesystemTree;

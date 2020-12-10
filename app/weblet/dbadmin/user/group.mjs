//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/user/group.mjs
//================================================================================
'use strict';

import MneConfig   from '/js/basic/config.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneElement from '/weblet/basic/element.mjs'
import MneView    from '/weblet/basic/view.mjs'

class MneDbadminUserGroup extends MneView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        hinput : false
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  //getViewPath() { return this.getView(import.meta.url) }
  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  reset()
  {
    super.reset();
    this.obj.mkbuttons = [];
    Object.keys(this.obj.enablebuttons).forEach((item) => { this.obj.enablebuttons[item] = []});
  }

  async getGroupWeblet(path, par = '')
  {
    var self = this;
    let { default: TableWeblet } =  await MneRequest.import(path + '.mjs' + par);
    class MyGroupWeblet extends TableWeblet
    {
      constructor(parent, frame, id, initpar = {}, config = {} )
      {
        var ivalues = 
        {
          schema       : 'mne_application',
          query        : 'usergroup',
          cols         : 'group,groupname',
          scols        : 'groupname',
          showids      : ['rolname', 'ismember'],
          showalias    : ['loginname', '#0'],
          primarykey   : ['group'],
          
          tablehidecols : ['group'],
          labels        : ['#mne_lang#Gruppen'],
          
          okschema   : 'mne_catalog',
          okfunction : 'usergroupadd',
          okcols     : ['loginname', 'group'],
          
          notitleframe : true,
          hinput       : false
        };

        super(parent, frame, id, Object.assign(ivalues, initpar), config );
      }

      async reset()
      {
        super.reset();
        this.obj.mkbuttons = [ { id : 'ok', value : '>'} ];
        Object.keys(this.obj.enablebuttons).forEach((item) => { this.obj.enablebuttons[item] = []});
        this.obj.enablebuttons.buttons = [ 'ok'];
        this.obj.enablebuttons.select  = ['ok'];
      }
      
      async loadbutton()
      {
        this.obj.container.button = self.obj.container.button;
        return super.loadbutton();
      }
      
      async ok()
      {
        Array.from(this.obj.tbody.children).forEach((item) => { if ( this.isselected(item)) item.ismodify = true;} );
        await super.ok();

        self.newvalues = true;
      }
      
      async dblclick()
      {
         return this.ok();
      }
    }
    return MyGroupWeblet;
  }
  
  async getMemberWeblet(path, par = '')
  {
    var self = this;
    let { default: TableWeblet } =  await MneRequest.import(path + '.mjs' + par);
    class MyMemberWeblet extends TableWeblet
    {
      constructor(parent, frame, id, initpar = {}, config = {} )
      {
        var ivalues = 
        {
          schema       : 'mne_application',
          query        : 'usergroup',
          cols         : 'group,groupname',
          scols        : 'groupname',
          showids      : ['rolname', 'ismember'],
          showalias    : ['loginname', '#1'],
          
          tablehidecols : ['group'],
          labels        : ['#mne_lang#Gruppenzugehörigkeit'],
          
          delschema   : 'mne_catalog',
          delfunction : 'usergroupdel',
          delcols     : ['loginname', 'group'],

          notitleframe : true,
          hinput       : false
        };

        super(parent, frame, id, Object.assign(ivalues, initpar), config );
      }

      async reset()
      {
        super.reset();
        this.obj.mkbuttons = [{ id : 'del', value : '<'}];
        Object.keys(this.obj.enablebuttons).forEach((item) => { this.obj.enablebuttons[item] = []});
        this.obj.enablebuttons.buttons = [ 'del'];
        this.obj.enablebuttons.select  = ['del'];
      }
      
      async loadbutton()
      {
        this.obj.container.button = self.obj.container.button;
        return super.loadbutton();
      }
      
      del_confirm()
      {
        return true;
      }
      
      async del()
      {
        await super.del();
        self.newvalues = true;
      }

      async dblclick()
      {
         return this.del();
      }
    }
    return MyMemberWeblet;
  }

  async loadbutton()
  {
    this.obj.container.content.innerHTML='<div></div><div id="buttonContainer" class="buttons"></div><div></div>';
    this.obj.container.button = this.obj.container.content.children[1];
    return super.loadbutton();
  }
  
  async load()
  {
    await super.load();
    
    var reload = this.config.reload;
    var path = '/weblet/db/table/view';
    
    var configgroup  = Object.assign(Object.assign({},  this.config ), { path : path, depend : this.config.depend, dependweblet : this } );
    var configmember = Object.assign(Object.assign({},  this.config ), { path : path, depend : this.config.depend, dependweblet : this } );

    var GroupWeblet =  await this.getGroupWeblet(path, ( reload ) ? '?date=' + Date.now() : '');
    this.obj.weblets.group = new GroupWeblet(this, this.obj.container.content.firstChild, 'group', {}, configgroup );
    this.obj.weblets.group.obj.run.newvalues = true;
    await this.obj.weblets.group.load();

    var MemberWeblet =  await this.getMemberWeblet(path, ( reload ) ? '?date=' + Date.now() : '');
    this.obj.weblets.member = new MemberWeblet(this, this.obj.container.content.lastChild, 'member', {}, configmember );
    this.obj.weblets.member.obj.run.newvalues = true;
    await this.obj.weblets.member.load();
    
  }
  
  async values(param)
  {
    this.obj.run.origvalues = Object.assign({}, (( this.config.dependweblet ) ? this.config.dependweblet.obj.run.values : {}));
    this.obj.run.values = Object.assign({}, this.obj.run.origvalues);
    
    this.obj.weblets.group.newvalues = false;
    this.obj.weblets.member.newvalues = false;
    
    var p = [];
    p.push(this.obj.weblets.group.values(param));
    p.push(this.obj.weblets.member.values(param));
    
    return Promise.all(p);
  }
}

export default MneDbadminUserGroup;

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/geometrie.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'

import MneWeblet   from './weblet.mjs'
import MnePopup    from './popup.mjs'
import MneRegister from './register.mjs'

class MneGeometrie extends MneWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    super(parent, frame, id, initpar, config )
  }

  reset()
  {
    super.reset();
    Object.assign(this.obj, { container : {} });
  }

  async getSlider()
  {
    var i;
    var res;
    var htmlcomposeid = '';
    
    if ( MneGeometrie.slider == undefined )
    {
      var p = 
      {
          schema : 'mne_application',
          table  : 'htmlcomposetabslider',
          cols   : 'htmlcomposeid,slidername,sliderpos',
          scols  : 'htmlcomposeid'
      }
      res = await MneRequest.fetch('/db/utils/table/data.json', p );

      MneGeometrie.slider = {};

      for ( i=0; i < res.values.length; ++i )
      {
        if ( htmlcomposeid != res.values[i][res.rids['htmlcomposeid']] )
      {
          htmlcomposeid = res.values[i][res.rids['htmlcomposeid']];
          MneGeometrie.slider[htmlcomposeid] = {};
      }
        MneGeometrie.slider[htmlcomposeid][res.values[i][res.rids['slidername']]] = res.values[i][res.rids['sliderpos']];
      }
    }
    
    return ( MneGeometrie.slider[this.obj.run.config.htmlcomposeid] ) ? MneGeometrie.slider[this.obj.run.config.htmlcomposeid] : [];
  }

  async getTemplate()
  {
    var i;
    var res;

    res = await MneRequest.fetch('/htmlcompose/weblet.json', { name : this.obj.name } ); 
    if ( res.values.length != 1 )
      throw new Error(MneText.sprintf('#mne_lang#Kein Weblet <$1> gefunden', this.obj.name ))

    this.obj.run.config = [];
    for ( i in res.ids )
      this.obj.run.config[res.ids[i]] = res.values[0][i];
  }

  async mkTemplate()
  {
    let { default: templ } = await MneRequest.import('/weblet/geometrie/' + this.obj.run.config.template + '.mjs');
    var slider = await this.getSlider();
    await templ.mkTemplate( this, slider )
  }

  async getSubWeblets()
  {
    return await MneRequest.fetch('/htmlcompose/subweblets.json', { htmlcomposeid : this.obj.run.config.htmlcomposeid } ); 
  }

  async mkWeblet( position, sub )
  {
    var i;
    
    if ( position == 'popup' )
    {
      var i;
      var container;

      this.obj.popups['rte']  = new MnePopup( 'rte',  {}, { composeparent : this, htmlcomposetabid : 'rte',  id : 'rte',  position : 'popup', path : '/weblet/allg/editor/rte', initpar : {}, depend : [], label : MneText.getText('#mne_lang#Editor') } );
      this.obj.popups['show'] = new MnePopup( 'show', {}, { composeparent : this, htmlcomposetabid : 'show', id : 'show', position : 'popup', path : '/weblet/allg/file/show',   initpar : {}, depend : [], label : MneText.getText('#mne_lang#Print') } );

      for ( i = 0; i< sub.values.length; i++)
      {
        var id = sub.values[i]['id'];
        var config = Object.assign({composeparent : this}, sub.values[i] );
        this.obj.popups[id] = new MnePopup( id, Object.assign({}, sub.values[i]['initpar']), config );
      }
    }
    else if ( sub.count == 0 )
    {
      var id = sub.values[0]['id'];
      var container = this.obj.container[position];
      container.innerHTML="<div></div>"; // äquivalent zu Register
      
      var config = Object.assign({ composeparent : this }, sub.values[0] );

      let { default: Weblet } =  await MneRequest.import(sub.values[0]['path'] + '.mjs');
      this.obj.weblets[id] = new Weblet(this, container.firstChild, id, Object.assign({}, sub.values[0]['initpar']), config )
      
      if ( this.obj.run.depend && this.obj.run.depend[id] ) this.obj.run.depend[id].split(',').forEach( ( item ) => { this.obj.weblets[id].config.dependid.push(item); this.obj.weblets[id].config.depend.push( { composeparent : this.config.composeparent, depend : ( item[0] != '#') ? item : item.substring(1) }) });
      this.obj.weblets[id].obj.run.newvalues = true;
    }
    else if ( sub.count > 0 )
    {
      var config = { htmlcomposeid : this.obj.run.htmlcomposeid, path : '/weblet/weblet/register', id : position, composeparent : this, register : sub.values, initpar : { menuframe : sub.menuframe }, label : '',  depend : [], dependid : [] };

      this.obj.weblets[position] = new MneRegister(this, this.obj.container[position], position, { menuframe : sub.menuframe }, config );
      this.obj.weblets[position].obj.run.newvalues = true;
    }
  }


  async mkSubWeblets(res)
  {
    var i,j;
    var p = [];
    var sub = { popup : { count : -1, values : [] }};
    var initpar  = res.rids['initpar'];
    var position = res.rids['position'];
    var errors = '';
     
    for ( i in this.obj.container )
      if ( i.substr(i.length - 4) != 'menu' ) sub[i] = { count : -1, values : [] };

    for ( i in this.obj.container )
      if ( i.substr(i.length - 4) == 'menu' ) sub[i.substr(0, i.length - 4)].menuframe = this.obj.container[i];
      
    res.values.forEach( (item, i) =>
    {
      var s = { composeparent : this };
      eval('res.values[i][initpar] = { ' + res.values[i][initpar] + '}');
      if ( this.obj.run.initpar && this.obj.run.initpar[res.values[i][res.rids.id]] ) res.values[i][initpar] = Object.assign(res.values[i][initpar], this.obj.run.initpar[res.values[i][res.rids.id]]);
      
      res.values[i][res.rids.depend] = ( res.values[i][res.rids.depend] ) ? res.values[i][res.rids.depend].split(',') : [];
      if ( res.values[i][initpar].mainweblet )
        this.obj.mainweblet = res.values[i][res.rids.id];
      try
      {
        sub[res.values[i][position]].count++;
        for ( j=0; j < res.ids.length; ++j)
          s[res.ids[j]] = res.values[i][j];
        sub[res.values[i][position]].values.push(s);
      }
      catch(e)
      {
        errors += 'Position ' + res.values[i][position] + ': ' + e.message + '\n';
      }
    });

    if ( errors )
      throw new Error(errors)
    
    for ( i in sub )
      p.push(this.mkWeblet(i, sub[i]));

    return Promise.all(p);
  }
  
  async mkDepend()
  {
    var i,j;
    for ( i in this.obj.weblets )
    {
      var d = this.obj.weblets[i].config.depend;
      this.obj.weblets[i].config.depend = [];
      for ( j =0; j < d.length; j++)
      {
        if ( typeof d[j] == 'string' && this.obj.weblets[d[j]] )
        {
            var name = ( d[j][0] != '#' ) ? d[j] : d[j].substring(1);
            if ( !  ( this.obj.weblets[name] instanceof MneRegister ) )
            {
              this.obj.weblets[i].config.dependid.push(d[j][0]);
              this.obj.weblets[i].config.depend.push(this.obj.weblets[name]);
            }
            if ( d[j][0] != '#' ) this.obj.weblets[name].config.dependweblet = this.obj.weblets[i];
        }
        else if ( d[j] instanceof MneWeblet )
          this.obj.weblets[i].config.depend.push(d[j]);
        else
          throw new Error(MneText.sprintf(MneText.getText("#mne_lang#Weblet <$1> nicht gefunden"), d[j]));
      }
    }
  }

  async load()
  {
    var p = [];
    var i;

    if ( ! this.obj.name ) return;
    
    this.frame.innerHTML = '';
    
    await super.load();
    
    await this.getTemplate();
    await this.mkTemplate();
    await this.mkSubWeblets(await this.getSubWeblets());
    await this.mkDepend();
    
    for ( i in this.obj.weblets )
      p.push(this.obj.weblets[i].load());

    await Promise.all(p);
    
    p = [];
    for ( i in this.obj.weblets )
      if ( this.obj.weblets[i] instanceof MneRegister )
        p.push(this.obj.weblets[i].show())
    
    await Promise.all(p);
  }
  
  async show(name, initpar)
  {
    
   var popup = this.obj.popup;
   this.obj.popup = undefined;
   this.reset();
   if ( popup ) this.obj.popup = popup;
   
   console.log(name)
   if ( name ) this.obj.name = name;
   if ( initpar ) this.obj.run.initpar = initpar;
   
   await super.show();
   
   if ( this.obj.mainweblet )
   {
     var val = window.sessionStorage.getItem(window.mne_application + ':' + this.obj.name);
     if ( val )
     {
       val = JSON.parse(val);
       if ( this.obj.weblets[this.obj.mainweblet].config.dependweblet )
       {
         this.obj.weblets[this.obj.mainweblet].config.dependweblet.obj.run.values = val;
         this.obj.weblets[this.obj.mainweblet].config.dependweblet.newvalues = true;
       }
       else
       {
         this.obj.weblets[this.obj.mainweblet].newvalues = true;
         this.obj.weblets[this.obj.mainweblet].obj.run.values = val;
         this.obj.weblets[this.obj.mainweblet].obj.run.dependweblet = this.obj.weblets[this.obj.mainweblet];
       }
     }
   }
   await this.check_values();
  }
}

export default MneGeometrie;

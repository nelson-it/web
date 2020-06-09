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

class MneGeometrieWeblet extends MneWeblet
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
    
    if ( MneGeometrieWeblet.slider == undefined )
    {
      var p = 
      {
          schema : 'mne_application',
          table  : 'htmlcomposetabslider',
          cols   : 'htmlcomposeid,slidername,sliderpos',
          scols  : 'htmlcomposeid'
      }
      res = await MneRequest.fetch('/db/utils/table/data.json', p );

      MneGeometrieWeblet.slider = {};

      for ( i=0; i < res.values.length; ++i )
      {
        if ( htmlcomposeid != res.values[i][res.rids['htmlcomposeid']] )
      {
          htmlcomposeid = res.values[i][res.rids['htmlcomposeid']];
          MneGeometrieWeblet.slider[htmlcomposeid] = {};
      }
        MneGeometrieWeblet.slider[htmlcomposeid][res.values[i][res.rids['slidername']]] = res.values[i][res.rids['sliderpos']];
      }
    }
    
    return ( MneGeometrieWeblet.slider[this.obj.run.config.htmlcomposeid] ) ? MneGeometrieWeblet.slider[this.obj.run.config.htmlcomposeid] : [];
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
      this.obj.weblets[id].obj.run.newvalues = true;
    }
    else if ( sub.count > 0 )
    {
      var config = { htmlcomposeid : this.obj.run.htmlcomposeid, path : '/weblet/weblet/register', id : position, composeparent : this, register : sub.values, initpar : { menuframe : sub.menuframe }, label : '',  depend : [] };

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
      
    for ( i in res.values )
    {
      var s = { composeparent : this };
      eval('res.values[i][initpar] = { ' + res.values[i][initpar] + '}');
      res.values[i][res.rids.depend] = ( res.values[i][res.rids.depend] ) ? res.values[i][res.rids.depend].split(',') : [];

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
    }
    
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
            if ( !  ( this.obj.weblets[d[j]] instanceof MneRegister ) )
              this.obj.weblets[i].config.depend.push(this.obj.weblets[d[j]]);
            this.obj.weblets[d[j]].config.dependweblet = this.obj.weblets[i];
        }
        else if ( d[j] instanceof MneWeblet )
          this.obj.weblets[i].config.depend.push(d[j]);
        else
          throw new Error(MneText.sprintf(MneText.getText("#mne_lang#Weblet <$1> nicht gefunden"), d[j]));
      }
    }
  }

  async values()
  {
    var i;
    var d;
    var found;

    found = true;
    while ( found )
    {
      found = false;

      for ( i in this.obj.weblets )
      {
        var d = this.obj.weblets[i].config.dependweblet;
        if ( this.obj.weblets[i].newvalues && ( ! d || ! d.newvalues ) )
        {
          found=true;
          await this.obj.weblets[i].values();
          this.obj.weblets[i].newvalues = false;
        }
      }
    }
  }
  
  async show(name)
  {
   var p = [];
   var i;
   
   this.reset();
   await super.show();
   
   this.obj.name = name;

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

    
    return this.values();
  }
}

export default MneGeometrieWeblet;

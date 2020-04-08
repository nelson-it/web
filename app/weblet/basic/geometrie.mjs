//================================================================================

//Copyright: M.Nelson - technische Informatik
//Die Software darf unter den Bedingungen 
//der APGL ( Affero Gnu Public Licence ) genutzt werden

//datei: allg/weblet.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'
import MnePopup   from '/js/geometrie/popup.mjs'

import MneWeblet         from './weblet.mjs'
import MneRegisterWeblet from './register.mjs'

class MneGeometrieWeblet extends MneWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    super(parent, frame, id, initpar, config )
  }

  reset()
  {
    super.reset();
  }

  async getTemplate()
  {
    var i;
    var res;

    res = await MneRequest.fetch('/htmlcompose/weblet.json', { name : this.obj.name } ); 
    if ( res.values.length != 1 )
      throw new Error(MneText.sprintf('#mne_lang#Kein Weblet <$1> gefunden', this.obj.name ))

    for ( i in res.ids )
      this.config[res.ids[i]] = res.values[0][i];
  }

  async mkTemplate()
  {
    let { default: templ } = await MneRequest.import('/weblet/template/' + this.config.template + '.mjs');
    await templ.mkTemplate( this )
  }

  async getSubWeblets()
  {
    return await MneRequest.fetch('/htmlcompose/subweblets.json', { htmlcomposeid : this.config.htmlcomposeid } ); 
  }

  async mkWeblet( position, sub )
  {
    var promise;
    var i;
    
    if ( sub.count == 0 || position == 'popup' )
    {
      var i;
      var container;

      for ( i = 0; i< sub.values.length; i++)
      {
        var id = sub.values[i]['id'];

        if ( position == 'popup' )
          this.obj.popups[id] = new MnePopup(( container = document.createElement('div')), id );
        else
          container = this.obj.container[position];
        
        var config = Object.assign({}, sub.values[i] );
        config.depend = ( config.depend ) ? config.depend.split(',') : [];

        let { default: Weblet } =  await MneRequest.import(sub.values[i]['path'] + '.mjs');
        this.obj.weblets[id] = new Weblet(this, container, id, ( position == 'popup' ) ? Object.assign({ popup : this.obj.popups[id] }, sub.values[i]['initpar'] ) : sub.values[i]['initpar'], config )
        this.obj.weblets[id].obj.run.newvalues = true;
      }

      if ( position == 'popup' )
        promise = true;
      else
        promise = this.obj.weblets[id].load();
    }
    else if ( sub.count > 0 )
    {
      var config = { path : '/weblet/weblet/register.mjs', id : position, initpar : {}, label : '', position : position, depend : [] };

      this.obj.weblets[position] = new MneRegisterWeblet(this, this.obj.container[position], position, {}, config );
      this.obj.weblets[position].obj.run.newvalues = true;

      promise = this.obj.weblets[position].load(sub.values);
    }
    return promise;
  }


  async mkSubWeblets(res)
  {
    var i,j;
    var p = [];
    var sub = { popup : { count : -1, values : [] }};
    var initpar  = res.rids['initpar'];
    var position = res.rids['position'];
     
    for ( i in this.obj.container )
      sub[i] = { count : -1, values : [] };
      
    for ( i in res.values )
    {
      var s = {};
      eval('res.values[i][initpar] = { ' + res.values[i][initpar] + '}');

      sub[res.values[i][position]].count++;

      for ( j=0; j < res.ids.length; ++j)
        s[res.ids[j]] = res.values[i][j];
      sub[res.values[i][position]].values.push(s);
    }
    
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
        this.obj.weblets[i].config.depend.push(this.obj.weblets[d[j]]);
        
        if ( this.obj.weblets[d[j]] ) this.obj.weblets[d].config.dependweblet = this.obj.weblets[i];
        else throw new Error(MneText.sprintf(MneText.getText("#mne_lang#Weblet <$1> nicht gefunden"), d[j]));
      }
    }
  }

  async check_values()
  {
    await this.values();
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
        if ( this.obj.weblets[i].obj.run.newvalues && ( ! d || ! d.obj.run.newvalues ) )
        {
          found=true;
          console.log('values für weblet: ' + i)
          this.obj.weblets[i].obj.run.newvalues = false;
          await this.obj.weblets[i].values();
        }
      }
    }
  }
  
  async show(name)
  {
   await this.reset();
   super.show();
   
   this.obj.name = name;

    await this.getTemplate();
    await this.mkTemplate();
    await this.mkSubWeblets(await this.getSubWeblets());
    await this.mkDepend();
    await this.values();
  }
}

export default MneGeometrieWeblet;

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/weblet.mjs
//================================================================================
'use strict';

import MneMutex   from '/js/basic/mutex.mjs'
import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'
import MneTheme   from '/js/basic/theme.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneFullscreen  from '/js/geometrie/fullscreen.mjs'

MneTheme.loadCss('basic/weblet.css', 'styles/weblet');

export class MneWebletEmpty
{
  constructor(parent, config = {})
  {
    this.parent = parent;
    this.configorig = Object.assign({depend : [], dependid : [] }, config );
    
    this.dropevt     = (evt) =>
    {
      if ( evt.dataTransfer.types.length > 0 && evt.dataTransfer.types[0] == 'text/plain' && evt.target.modValue )
      {
        MneWeblet.dropok = true;
        return;
      }

      evt.preventDefault();
      var data = JSON.parse(evt.dataTransfer.getData("mnejson"));
      this.drop(data, evt).catch((e) => { MneLog.exception('drag & drop: ' + this.fullid, e); throw e})
      
      MneWeblet.dropok = true;
    };
    
    this.dragoverevt = (evt) => 
    {
      var data;
      
      MneWeblet.dropok = false;
      if ( evt.dataTransfer.types.length > 0 && evt.dataTransfer.types[0] == 'text/plain' && evt.target.modValue )
      {
          evt.dataTransfer.dropEffect = 'copy';
          evt.preventDefault();
          return;
      }
      try { data = JSON.parse(evt.dataTransfer.getData("mnejson")) } catch(e) { evt.dataTransfer.dropEffect = "none"; return; }
      this.initpar.dropwait.forEach((item) => { if ( data.dropfrom && data.dropfrom == item ) evt.preventDefault(); });
    }
  }

  getPath(url)     { url = new URL(url); return url.pathname.substring(url.pathname.indexOf('/weblet/')).replace(/\/[^\/]+\.mjs$/, ''); }
  getBasePath(url) { url = new URL(url); return url.pathname.substring(url.pathname.indexOf('/weblet/') + 8 ).replace(/\/[^\/]*$/, ''); }
  getCss(url)      { url = new URL(url); return url.pathname.substring(url.pathname.indexOf('/weblet/') + 8 ).replace(/\.mjs$/, '.css'); }
  getView(url)     { url = new URL(url); return url.pathname.substring(url.pathname.indexOf('/weblet/') + 8 ).replace(/\.mjs$/, '.html'); }

  getCssPath() { return "" };

  reset()
  {
    if ( this.obj )
    {
      var i;

      for ( i in this.obj.observer )
      {
        this.obj.observer[i].disconnect();
        delete this.obj.observer[i];
      }
      
      this.obj.styles.forEach( ( item ) => { document.head.removeChild(item)});
    }

    this.config = Object.assign({}, this.configorig );
    this.config.webletnum = MneWeblet.webletnum++;
    
    this.obj  =  { run : { values : {}, newvalues : false }, observer : {}, styles : [] };
    this.deldrop(this.frame);
  }

  get visible()
  {
    return ( !! ( this.frame.offsetWidth || this.frame.offsetHeight || this.frame.getClientRects().length) );
  }
  
  set newvalues(val)
  {
    if ( val )
    {
      if ( this.obj.run.newvalues == true ) return;
      
      this.obj.run.newvalues = true;
      this.config.depend.forEach ( (item, index) =>
      {
        if ( item instanceof MneWeblet )
        {
          if ( item.newvalues != true ) item.newvalues = true;
        }
        else if ( typeof item == 'string' && this.config.composeparent && this.config.composeparent.obj.weblets[( item[0] == '#') ? item.substr(1) : item ] )
        {
          this.config.depend[index] = item = this.config.composeparent.obj.weblets[( item[0] == '#') ? item.substr(1) : item];
          if ( item.newvalues != true ) item.newvalues = true;
        }
        else if ( typeof item == 'object' && item.composeparent && item.composeparent.obj.weblets[( item.depend[0] == '#') ? item.depend.substr(1) : item.depend ] )
        {
          this.config.depend[index] = item = item.composeparent.obj.weblets[( item.depend[0] == '#') ? item.depend.substr(1) : item.depend];
          if ( item.newvalues != true ) item.newvalues = true;
        }
      });
    }
    else
    {
      this.obj.run.dependweblet = undefined;
      this.obj.run.newvalues = false;
      this.obj.run.checkdepend = false;
    }
  }

  /**
   * @param {boolean} val
   */
  set newselect(val)
  {
    this.newvalues = val;
    this.obj.run.newvalues = false;
    this.obj.run.checkdepend = false;
  }

  set mustcheckvalues(val)
  {
    this.obj.run.mustcheckvalues = ( this.visible ) ?  val : false;
  }

  /**
   * @param {any} weblet
   */
  set dependweblet(weblet)
  {
    this.obj.run.dependweblet = weblet;
    this.obj.run.checkdepend = ( weblet ) ? true : false;
    if ( weblet && ! this.obj.run.newvalues )
      this.newvalues = true;
  }

  get newvalues()
  {
    return ( !! ( this.frame.offsetWidth || this.frame.offsetHeight || this.frame.getClientRects().length) ) ?  this.obj.run.newvalues : false;
  }

  get mustcheckvalues()
  {
    return this.obj.run.mustcheckvalues;
  }


  get fullpath()
  {
    return this.fullid + '<' + this.config.path + '>';
  }

  get fullid()
  {
    var str = this.id;
    var p = this.parent;
    while ( p != null )
    {
      str = p.id + ":" + str;
      p = p.parent;
    }
    return str; 
  }

  async clear_newvalues()
  {
    var w;

    this.newvalues = false;

    var w = ( this.obj.webletsort ) ? this.obj.webletsort : Object.keys(this.obj.weblets);
    w.forEach((item) => { this.obj.weblets[item].newvalues = false;} );
  }

  async check_values()
  {
    var i;
    var d;
    var found;
    var w;

    //if ( this == window.main_weblet )
    //  this.list_weblets();

    //console.log('check_values: ' + this.fullid + ' ' + this.newvalues);
    //Object.values(this.obj.weblets).forEach( ( item ) => { console.log('check_depend: ' + item.fullid + ' ' + item.obj.run.checkdepend); });

    if ( this.newvalues )
    {
      try { await this.values(); }
      catch(e) { this.newvalues = false; throw(e); }
      this.newvalues = false;
    }
    

    var w = ( this.obj.webletsort ) ? this.obj.webletsort : Object.keys(this.obj.weblets);
    w.forEach((item) => { this.obj.weblets[item].mustcheckvalues = true;} );

    found = true;
    while ( found )
    {
      found = false;

      for ( i=0; i<w.length; i++ )
      {
        var d = this.obj.weblets[w[i]].config.dependweblet;
        if ( this.obj.weblets[w[i]].mustcheckvalues && ( ! d || ! d.mustcheckvalues ) )
        {
          found=true;
          this.obj.weblets[w[i]].mustcheckvalues = false;
          await this.obj.weblets[w[i]].check_values();
        }
      }
    }
  }

  confirm(text)
  {
    return ( window.confirm(text) == true )
  }
  
  fullscreen()
  {
    MneFullscreen.fullscreen(this.obj.buttons.fullscreen, this.frame);
  }

  modClear()
  {
  }

  async load()
  {
  }

  async loadready()
  {
  }

  async show()
  {
  }

  async close()
  {
  }

  async values()
  {
  }
  
  async drop (_data)
  {
  }
  
  adddrop(ele)
  {
    ele.addEventListener('dragover', this.dragoverevt );
    ele.addEventListener('drop',     this.dropevt );
  }

  deldrop(ele)
  {
    ele.removeEventListener('dragover', this.dragoverevt );
    ele.removeEventListener('drop',     this.dropevt );
  }
}


export class MneWeblet extends MneWebletEmpty
{
  constructor( parent, frame, id, initpar = {}, config = {} )
  {
    super( parent, config);

    if ( parent != null &&  ! ( parent instanceof MneWeblet ) ) throw new Error(MneText.getText("#mne_lang#Elternelement ist kein Weblet"));
    if ( ! ( frame.tagName ) ) throw new Error(MneText.getText("#mne_lang#Container ist kein HTML Element"));

    this.frame = frame;
    this.id = id;
    this.initorig = initpar;


    this.reset();
  }

  reset()
  {
    if ( this.obj )
    {
      var i;

      for ( i in this.obj.weblets )
        this.obj.weblets[i].reset();

      for ( i in this.obj.slider )
        this.obj.slider[i].reset();
      
      for ( i in this.obj.popups )
        this.obj.popups[i].reset();
      
    }

    super.reset();
    this.initpar = Object.assign({}, this.initorig )
    this.obj  = Object.assign( this.obj, { loaded : false, weblets : {}, popups : {}, slider : {}, buttons : {} });

    this.frame.className = '';
    this.config.cssName = this.config.path.replace(/\.mjs$/, '').replace(/^\//,'').replace(/\//g,'-');
    MneElement.mkClass(this.frame, 'weblet');
    MneElement.mkClass(this.frame, this.config.cssName);
    MneElement.mkClass(this.frame, 'weblet' + this.config.webletnum);
    if ( this.initpar.frameclass ) MneElement.mkClass(this.frame, this.initpar.frameclass );
    
    this.frame.id = this.id;
  }

  
  showweblet(name, values, initpar )
  {
    window.sessionStorage.setItem(window.mne_application + ':startweblet', JSON.stringify([ name ]));
    window.sessionStorage.setItem(window.mne_application + ':' + name, JSON.stringify(values)); 
    window.main_weblet.show(name, initpar).catch( (e) => { MneLog.exception('showweblet:' + name, e)});
  }
  
  async createpopup(name, config = {}, initpar  = {})
  {
    var parent = ( this.initpar.popupparent) ? this.initpar.popupparent : this;
    var p = this.obj.popups[name] ?? parent.obj.popups[name] ?? this.config.composeparent.obj.popups[name];
    
    await p.create(parent, config, initpar )

    var w = parent.obj.weblets[name];
    if ( w )
    {
      if ( ! config.notsetdepend && parent.config.depend.indexOf(w) == -1 )
        parent.config.depend.push(w);

      w.config.dependweblet = this;
    }
    
    return w;
  }
  
  async openpopup(name, config = {}, initpar = {} )
  {
    var w = await this.createpopup(name, config, initpar );
    
    await w.show( config.popuphide );
    w.modClear();
    w.config.dependweblet = this;
    w.newvalues = true;
    await w.check_values();
    
    return w;
    
  }

  change_depend ( weblet, oldweblet )
  {
    var i;
    var depend = this.config.depend;

    depend.forEach( (item, index ) => { if ( item == oldweblet ) depend[index] = weblet; })
    if ( this.config.dependweblet == oldweblet ) this.config.dependweblet = weblet;

    for ( i in this.obj.weblets )
      this.obj.weblets[i].change_depend(weblet, oldweblet )
  }

  find_parent ( weblet )
  {
    var i,w;

    for ( i in this.obj.weblets )
    {
      if ( this.obj.weblets[i] == weblet ) return this;
      if ( ( w = this.obj.weblets[i].find_parent(weblet) ) != undefined ) return w;
    }
  }

  list_weblets ()
  {
    var i;
    var weblets = this.obj.weblets

    //console.info(this.fullid + ' ' + this.newvalues )

    for ( i in weblets )
      weblets[i].list_weblets();
  }

  async reload ()
  {
    var parent = window.main_weblet.find_parent(this);
    var id = this.id;
    var oldweblet = parent.obj.weblets[id];

    if ( oldweblet == undefined ) throw new Error(MneText.sprintf(MneText.getText('#mne_langWeblet <$1> nicht gefunden'), id));

    let { default: Weblet } =  await MneRequest.import(oldweblet.config.path + '.mjs?date=' + Date.now());
    var w = parent.obj.weblets[id] = new Weblet(parent, oldweblet.frame, id,  oldweblet.initorig, Object.assign(oldweblet.config, {reload : true }) );

    w.obj.popup = oldweblet.obj.popup;
    if ( typeof w.obj.popup == 'object')
    {
      w.obj.popup.reload = async function() { return w.reload() };
      w.obj.popup.query = async function() { return w.query() };
      w.obj.buttons.query = w.obj.popup.frame.querySelector('#querybutton');
    }
   
    w.newvalues = true;

    await w.load();
    window.main_weblet.change_depend(w, oldweblet);
    await w.check_values();

    oldweblet.obj.popup = undefined;
    oldweblet.reset();
  }

  async load()
  {
    this.config.reload = undefined;
    if ( this.obj.loaded ) throw Error('Weblet <' + this.id + '> ist schon geladen');

    var i;
    var css = this.getCssPath()
    css = ( css ) ? css.split(',') : [];

    this.obj.loaded = true;

    for ( i = 0; i < css.length; i++ )
      MneTheme.loadCss(css[i], MneWeblet.stylePath);

    if ( this.initpar.css )
      MneTheme.loadCss(this.initpar.css, MneWeblet.stylePath);
  }

  async show( _hide = false )
  {
    if ( this.obj.loaded == false )
      await this.load();
  }
  
  showWaitframe()
  {
    MneElement.mkClass(MneWeblet.waitframe, 'show');
  }
  
  hideWaitframe()
  {
    MneElement.mkClass(MneWeblet.waitframe, 'show', false);
  }

  async btnClick (clickid, data = {}, obj, evt )
  {
    let unlock = await MneWeblet.click_mutex.lock();
    var timeout = window.setTimeout(() => { if ( this.obj.run.nowaitframe ) return; MneElement.mkClass(MneWeblet.waitframe, 'show') }, 500);
    
    try
    {
      var res;
      
      if ( ( res = await this[clickid](data, obj, evt)) !== false )
        await window.main_weblet.check_values();
      console.log(clickid + " ready " + this.id + " " + res );
      window.clearTimeout(timeout);
      MneElement.mkClass(MneWeblet.waitframe, 'show', false);
      unlock()
    }
    catch(e)
    {
      window.clearTimeout(timeout);
      MneElement.mkClass(MneWeblet.waitframe, 'show', false);
      
      unlock();
      MneLog.exception('clickid: ' + this.fullid, e);
      e.nolog = true;
      throw e;
    }
    
  }

  async close()
  {
    return false;
  }

}

MneWeblet.webletnum = 0;
MneWeblet.stylePath = 'styles/weblet';
MneWeblet.click_mutex = new MneMutex();

MneWeblet.waitframe = document.createElement("div");
MneWeblet.waitframe.className = 'waitframe';
MneWeblet.waitframe.innerHTML = "<div>Daten werden gelesen/geschrieben</div>";
document.body.appendChild(MneWeblet.waitframe);


export default MneWeblet;

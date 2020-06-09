//================================================================================

//Copyright: M.Nelson - technische Informatik
//Die Software darf unter den Bedingungen 
//der APGL ( Affero Gnu Public Licence ) genutzt werden

//datei: weblet/basic/weblet.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'
import MneTheme   from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'
import MneConfig  from '/js/basic/config.mjs'
import MneFullscreen  from '/js/geometrie/fullscreen.mjs'

MneTheme.loadCss('basic/weblet.css', '/styles/weblet');

export class MneWebletEmpty
{
  constructor(config = {})
  {
    this.configorig = Object.assign({depend : [] }, config );
    this.dropevt     = (evt) => { evt.preventDefault(); var data = JSON.parse(evt.dataTransfer.getData("text")); this.drop(data, evt).catch((e) => { MneLog.exception('drag & drop: ' + this.fullid, e); throw e}) };
    this.dragoverevt = (evt) => 
    {
      var data;
      try { data = JSON.parse(evt.dataTransfer.getData("text")) } catch(e) { evt.dataTransfer.dropEffect = "none"; return };
      this.initpar.dropwait.forEach((item) => { if ( data.dropfrom && data.dropfrom == item ) evt.preventDefault(); });
    }
  }

  getPath(url) { return (new URL(url)).pathname.replace(/\/[^\/]+\.mjs$/, ''); }
  getCss(url)  { return (new URL(url)).pathname.substring(8).replace(/\.mjs$/, '.css'); }
  getView(url) { return (new URL(url)).pathname.substring(8).replace(/\.mjs$/, '.html'); }

  getCssPath() { return "" };

  reset()
  {
    this.config = Object.assign({}, this.configorig )
    this.obj  =  { run : { values : {}, newvalues : false }};
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
      var i;
      this.obj.run.newvalues = true;
      for ( i=0;  i<this.config.depend.length; i++ )
        this.config.depend[i].newvalues = true;
    }
    else
    {
      this.obj.run.dependweblet = undefined;
      this.obj.run.newvalues = false;
    }
  }

  set newselect(val)
  {
    this.newvalues = val;
    this.obj.run.newvalues = false;
  }

  set mustcheckvalues(val)
  {
    this.obj.run.mustcheckvalues = ( this.visible ) ?  val : false;
  }

  set dependweblet(weblet)
  {
    this.obj.run.dependweblet = weblet;
    if ( ! this.newvalues )
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

  async check_values()
  {
    var i;
    var d;
    var found;
    var w;

    //if ( this == window.main_weblet )
    //  this.list_weblets();

    console.log('check_values: ' + this.fullid + ' ' + this.newvalues);

    if ( this.newvalues )
    {
      await this.values();
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

  async show()
  {
  }

  async close()
  {
  }

  async values()
  {
  }
  
  async drop (data)
  {
    console.log(data);
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
    super(config);

    if ( parent != null &&  ! ( parent instanceof MneWeblet ) ) throw new Error(MneText.getText("#mne_lang#Elternelement ist kein Weblet"));
    if ( ! ( frame.tagName ) ) throw new Error(MneText.getText("#mne_lang#Container ist kein HTML Element"));

    this.parent = parent,
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

      if ( this.obj.popup && this.obj.popup.frame && this.obj.popup.frame.parentNode )
        this.obj.popup.frame.parentNode.removeChild(this.obj.popup.frame);

      for ( i in this.obj.weblets )
        this.obj.weblets[i].reset();

      for ( i in this.obj.slider )
        this.obj.slider[i].reset();

    }

    super.reset();
    this.initpar = Object.assign({}, this.initorig )
    this.obj  = Object.assign( this.obj, { loaded : false, weblets : {}, popups : {}, slider : {} });
    if ( this.initpar.popup ) this.obj.popup = this.initpar.popup;

    MneElement.mkClass(this.frame, 'weblet');
    MneElement.mkClass(this.frame, this.config.path.replace(/\/[^\/]+\.mjs$/, '').replace(/^\//,'').replace(/\//g,'-'));
  }

  async openpopup(name, hide = false )
  {
    var self = this;

    var p = ( this.obj.popups[name] ) ? this.obj.popups[name] : this.config.composeparent.obj.popups[name];
    await p.create(this);

    var w = this.obj.weblets[name];
    w.config.dependweblet = this;

    await w.show( hide );
    w.newvalues = true;
    await w.check_values();

    if ( this.config.depend.indexOf(w) == -1 )
      this.config.depend.push(w);
    
  }

  change_depend ( weblet, oldweblet )
  {
    var i;
    var depend = this.config.depend;
    var self = this;

    depend.forEach( (item, index ) => { if ( item == oldweblet ) depend[index] = weblet; })
    if ( this.config.dependweblet == oldweblet ) this.config.dependweblet = weblet;

    for ( i in this.obj.weblets )
      this.obj.weblets[i].change_depend(weblet, oldweblet )
  }

  find_parent ( weblet )
  {
    var i,w;
    var weblets = this.obj.weblets

    for ( i in this.obj.weblets )
    {
      if ( this.obj.weblets[i] == weblet ) return this;
      if ( ( w = this.obj.weblets[i].find_parent(weblet) ) != undefined ) return w;
    }
  }

  list_weblets ()
  {
    var i,w;
    var weblets = this.obj.weblets

    console.info(this.fullid)

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
    if ( w.obj.popup )
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
    var css = this.getCssPath().split(',');

    this.obj.loaded = true;

    for ( i = 0; i < css.length; i++ )
      MneTheme.loadCss(css[i], MneWeblet.stylePath);

  }

  async show( hide = false )
  {
    if ( this.obj.loaded == false )
      await this.load();

    if ( this.obj.popup != undefined )
    {
      var self = this;
      if ( hide == false )
        this.obj.popup.show();
      this.obj.popup.setTitle(this.title ?? this.config.label ?? this.id );
      this.obj.popup.reload = async function() { return self.reload() };
      this.obj.popup.query = async function() { return self.query() };
      this.obj.buttons.query = this.obj.popup.frame.querySelector('#querybutton');
    }
  }

  async btnClick (clickid, data = {}, obj, evt )
  {
    try
    {
      if ( MneWeblet.inbutton ) return;

      MneWeblet.inbutton = true;
      var res;
      if ( ( res = await this[clickid](data, obj, evt)) !== false )
        await window.main_weblet.check_values();
      MneWeblet.inbutton = false;
      console.log(clickid + " ready " + ( res !== false ) );
    }
    catch(e)
    {
      MneWeblet.inbutton = undefined;
      MneLog.exception('clickid: ' + this.fullid, e);
      e.nolog = true;
      throw e;
    }
  }

  async close()
  {
    if ( this.obj.popup != undefined )
    {
      this.obj.popup.close();
      return true;
    }

    return false;
  }

}

MneWeblet.stylePath = '/styles/weblet';
MneWeblet.inbutton = false;

export default MneWeblet;

//================================================================================

//Copyright: M.Nelson - technische Informatik
//Die Software darf unter den Bedingungen 
//der APGL ( Affero Gnu Public Licence ) genutzt werden

//datei: weblet/allg/table/table.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement   from '/js/basic/element.mjs'

import MneViewWeblet from '/weblet/basic/view.mjs'
import MneWeblet     from '/weblet/basic/weblet.mjs'

class MneTableWhereWeblet extends MneWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    console.log('ttttt')
    console.log(config)
    super(parent, frame, id, initpar, config );
  }

  get wcol()
  {
    return "";
  }

  get wop()
  {
    return "";
  }
  get wval()
  {
    return "";
  }
}

class MneTableWeblet extends MneViewWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        classname : 'border padding',
        showlabel : { de : 'hinzufügen/ändern', en : 'add/modify' },

        tablehidecols : [],
        selectsingle : false
    };

    if ( typeof initpar.tablehidecols == 'string')
    {
      var hidecols=initpar.tablehidecols.split(',');
      var cols = initpar.cols.split(',')
      var i;

      initpar.tablehidecols = [];
      for( i=0; i< cols.length; i++)
        initpar.tablehidecols[i] = ( hidecols.indexOf("" + i) != -1 )
    }

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  reset ()
  {
    super.reset();

    this.obj.mkbuttons =
      [
        { id : 'select',  value : unescape("%uf0c9"), size : 'notset', classname : 'mobile', show : this.initpar.selectpopup },
        { id : 'refresh', value : MneText.getText('#mne_lang#Aktualisieren') },
        { id : 'ok',      value : MneText.getText('#mne_lang#OK'), space : 'before', show : ( this.initpar.okfunction != undefined || this.initpar.oktable != undefined || this.initpar.ok != 'undefined') },
        { id : 'cancel',  value : MneText.getText('#mne_lang#Abbrechen') },
        { id : 'detail',  value : ( this.initpar.showlabel[MneConfig.language] != undefined ) ? this.initpar.showlabel[MneConfig.language] : this.initpar.showlabel['de'], show : ( this.initpar.detailweblet != undefined ) },
        { id : 'mdel',    value : MneText.getText('#mne_lang#Löschen'), space : 'before', show : ( this.initpar.detailweblet != undefined || this.initpar.delparam != undefined || this.initpar.delfunction != undefined || this.initpar.deltable != undefined ) },
        { id : 'print',   value :  MneText.getText('#mne_lang#Drucken'), space : (( this.initpar.report != undefined ) ? '' : 'before') , show : ( this.initpar.report != undefined ) } ,
        { id : 'exports', value :  MneText.getText('#mne_lang#Exportieren'), space : 'before', show : ( this.initpar.query != undefined ) }
        ]

    this.obj.enablebuttons      = ['showdetail'];
    this.obj.enablebuttonsvalue = [ 'ok', 'mdel' ];

    if ( ! this.initpar.action )
    {
      if ( this.initpar.query    ) this.initpar.action = '/db/utils/query/data.json';
      else if ( this.initpar.table    ) this.initpar.action = '/db/utils/table/data.json';
      else if ( this.initpar.function ) this.initpar.action = '/db/utils/func/execute.json';
    }

    this.obj.run.readpar = {}
    if ( typeof this.initpar.query    != 'undefined') this.obj.run.readpar.query   = this.initpar.query;
    if ( typeof this.initpar.schema   != 'undefined') this.obj.run.readpar.schema  = this.initpar.schema;
    if ( typeof this.initpar.table    != 'undefined') this.obj.run.readpar.table   = this.initpar.table;

  }



  getViewPath() { return this.getView(import.meta.url) }
  getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  clearRow()
  {
    var obj = this.obj.tbody.children;
    var i;
    for ( i =0; i<obj.length; i++)
      MneElement.clearClass(obj[i], 'active');
  }

  async selectRow(data, row, evt)
  {
    var obj = this.obj.tbody.children;
    var index = row.rowIndex - this.obj.thead.children.length;
    var i;

    if ( this.initpar.selectsingle || ! evt.ctrlKey )
      this.clearRow();

    if ( ! this.initpar.selectsingle && evt.shiftKey )
    {
      if ( this.obj.lastselect < index )
        for ( i = this.obj.lastselect; i<=index; i++)
          MneElement.mkClass(obj[i], 'active');
      else
        for ( i = index; i <= this.obj.lastselect; i++)
          MneElement.mkClass(obj[i], 'active');
    } 
    else
    {
      MneElement.mkClass(row, 'active', ! MneElement.hasClass(row, 'active'));
    }

    this.obj.lastselect = index;
  }

  get select()
  {
    var obj = this.obj.tbody.children;
    var i;
    var res = Object.assign({}, this.obj.run.values);
    res.values = [];

    for ( i=0; i<obj.length; i++)
    {
      if ( MneElement.hasClass( obj[i], 'active'))
        res.values.push(obj[i].values);
    }
    return res;
  }

  async loadview()
  {
    var self = this;

    await super.loadview();

    if ( this.initpar.whereweblet )
    {
      var path = ( this.initpar.whereweblet[0] == '/' ) ? this.initpar.whereweblet : this.getPath(import.meta.url) +'/where/' + this.initpar.whereweblet + '.mjs';
      let { default: Weblet } =  await MneRequest.import(path);

      var initpar = { notitle : true, popup : undefined, ok : async () => { await self.refresh() } }
      this.obj.weblets.where = new Weblet(this, this.frame.querySelector('#tablefilter'), this.id + 'where', Object.assign(Object.assign({}, this.initpar), initpar ));
      await this.obj.weblets.where.load();

      var p = Object.assign(
          {
            cols     : this.initpar.cols,
            novals   : true,
            sqlend   : 1
          }, this.obj.run.readpar);

      var res = await MneRequest.fetch(this.initpar.action, p);
      var ids = [];
      var labels = [];
      var typs = [];
      var i;

      for ( i =0; i < res.ids.length; ++i)
      {
        if ( ! this.initpar.tablehidecols[i] )
        {
          ids.push(res.ids[i]);
          labels.push(res.labels[i]);
          typs.push(res.typs[i]);
        }
      }
      this.obj.weblets.where.viewpar = { ids : ids, typs : typs, labels : labels };
    }
    else
    {
      this.obj.weblets.where = new MneTableWhereWeblet(this, this.frame.querySelector('#tablefilter'), this.id + 'where', { notitle : true, popup : undefined });
    }

    this.obj.container.content.addEventListener('contextmenu', function(evt) { evt.preventDefault(); }, false);
    this.obj.container.content.addEventListener('keyup', function(evt)
    {
      evt.preventDefault();
    });

    this.obj.container.content.addEventListener('keydown', function(evt)
    {
      evt.preventDefault();

      if ( evt.shiftKey ) return;

      switch(evt.key)
      {
        case "ArrowDown" :
          if ( ! self.initpar.selectsingle && evt.ctrlKey && self.obj.lastkey == "ArrowUp" )
            self.selectRow({}, self.obj.tbody.children[self.obj.lastselect], evt);
          else if ( self.obj.lastselect < ( self.obj.tbody.children.length - 1 ) ) 
            self.selectRow({}, self.obj.tbody.children[self.obj.lastselect + 1], evt);
          break;

        case  "ArrowUp" :
          if ( ! self.initpar.selectsingle && evt.ctrlKey && self.obj.lastkey == "ArrowDown" )
            self.selectRow({}, self.obj.tbody.children[self.obj.lastselect], evt);
          else if ( self.obj.lastselect > 0 ) 
            self.selectRow({}, self.obj.tbody.children[self.obj.lastselect - 1], evt);
          break;

        case "Tab":
          self.obj.weblets.where.focus();
          evt.preventDefault();
          break;

       case "Enter":
          self.btnClick('ok', {}, this, evt );
          break;
        default:
          break;
      }
      self.obj.lastkey = evt.key;
    });
  }

  async values(param)
  {
    var i,j;
    var str = '';
    var self = this;

    
    var p = Object.assign(
        {
          cols     : this.initpar.cols,
          wcol     : (( this.initpar.wcol ) ? this.initpar.wcol + ',' : '' ) + this.obj.weblets.where.wcol,
          wop      : (( this.initpar.wop  ) ? this.initpar.wop  + ',' : '' ) + this.obj.weblets.where.wop,
          wval     : (( this.initpar.wval ) ? this.initpar.wval + ',' : '' ) + this.obj.weblets.where.wval,

          sqlend   : 1
        }, this.obj.run.readpar);

    if (   typeof p.schema == 'undefined' || typeof p.table == 'undefined' && typeof p.query == 'undefined')
      throw new Error("#mne_lang#keine Abfrage und keine Table für <" + this.id + ":" + this.path + "> definiert");

    this.obj.run.values = await MneRequest.fetch(this.initpar.action, p);
    
    str = '<table class="' + this.initpar.classname + ' disable-select" tabindex=1><thead><tr>'
    for ( i =0; i < this.obj.run.values.labels.length; ++i)
      if ( ! this.initpar.tablehidecols[i] ) str += '<td>' + this.obj.run.values.labels[i] + '</td>';

    str += '</tr></thead><tbody>';
    for ( i =0; i < this.obj.run.values.values.length; ++i)
    {
      str += '<tr>'
        for ( j =0; j<this.obj.run.values.values[i].length; ++j)
        {
          if ( ! this.initpar.tablehidecols[j] ) str += '<td>' + this.obj.run.values.values[i][j] + '</td>';
        }
      str += '</tr>'
    }
    str += '</tbody></table>';


    this.obj.tables.content.innerHTML = str;
    var obj = this.obj.tables.content.firstChild.querySelector("tbody").children;

    for ( i =0; i<obj.length; i++)
    {
      obj[i].values = this.obj.run.values.values[i];
      obj[i].addEventListener('click', async function(evt)
      {
        if ( evt.detail == 1 ) 
        {
          obj.needclick = true;
          new Promise( resolve => setTimeout(resolve, 200)).then( () => { if ( obj.needclick ) { obj.needclick = false; self.btnClick('selectRow', this, this, evt); } })
        }
        else if ( evt.detail == 2 )
        {
          if ( obj.needclick ) 
          {
            obj.needclick = false;
            await self.btnClick('selectRow', this, this, evt);
            await self.btnClick('ok');
          }
        }
      });
    }

    this.obj.lastselect = -1;
    this.obj.thead = this.obj.tables.content.firstChild.firstChild;
    this.obj.tbody = this.obj.tables.content.firstChild.lastChild;
    this.obj.table = this.obj.tables.content.firstChild;
    this.obj.table.focus()
    
    this.obj.weblets.where.modClear();
  }

  async refresh()
  {
    await this.values()
  }

  async ok(data)
  {
    await this.initpar.ok(this.select);
  }

  async cancel()
  {
    this.clearRow();
    await this.close();
  }

  async detail()
  {
    this.detailweblet.show();
    this.detailweblet.values();
  }
}

export default MneTableWeblet;

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/db/table/allg.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement   from '/js/basic/element.mjs'
import MneInput     from '/js/basic/input.mjs'

import MneDbView    from '../view.mjs'
import MneWeblet    from '/weblet/basic/weblet.mjs'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class MneDbTableBasic extends MneDbView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        classname : 'border padding top',
        labels    : [],
        cols      : '',
        
        selectsingle : false,
        mkrowdirect : false
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  reset ()
  {
    var self = this;
    var i;
    
    super.reset();
    
    this.obj.mkbuttons =
      [
        { id : 'select',    value : unescape("%uf0c9"), size : 'notset', classname : 'mobile', show : this.initpar.selectpopup },
        { id : 'refresh',   value : MneText.getText('#mne_lang#Aktualisieren'), space : 'behind' },
        
        { id : 'ok',        value : MneText.getText('#mne_lang#OK'),         show : ( this.obj.run.btnrequest.add || this.obj.run.btnrequest.mod ) != undefined },
        { id : 'cancel',    value : MneText.getText('#mne_lang#Abbrechen'),  show : ( this.obj.run.btnrequest.add || this.obj.run.btnrequest.mod ) != undefined },
        { id : 'add',       value : MneText.getText('#mne_lang#Hinzufügen'), show : ( this.obj.run.btnrequest.add != undefined ), space : 'before' },
        { id : 'detail',    value : MneText.getText('#mne_lang#Detail'),     show : ( this.initpar.detailweblet   != undefined ) },
        { id : 'del',       value : MneText.getText('#mne_lang#Löschen'),    show : ( this.obj.run.btnrequest.del != undefined ) },
        { id : 'detaildel', value : MneText.getText('#mne_lang#Löschen'),    show : ( this.initpar.detailweblet   != undefined ) },

        { id : 'print',     value :  MneText.getText('#mne_lang#Drucken'), space : (( this.initpar.report != undefined ) ? '' : 'before') , show : ( this.initpar.report != undefined ) } ,
        { id : 'export',    value :  MneText.getText('#mne_lang#Exportieren'), space : 'before' }
        ]

    this.obj.enablebuttons.buttons = ['ok', 'add', 'del', 'detaildel'];

    this.obj.enablebuttons.add    = [ 'ok', 'add' ];
    this.obj.enablebuttons.del    = [ 'add' ];
    this.obj.enablebuttons.value  = [ 'add' ];
    this.obj.enablebuttons.select = [ 'add', 'ok', 'del', 'detaildel' ];
    
    if ( this.initpar.delbutton )
      this.delbutton(this.initpar.delbutton);

    this.obj.cols = this.initpar.cols.split(',');
    this.obj.coltyp = new Array(this.obj.cols.length).fill('');
    this.obj.colhide = new Array(this.obj.cols.length).fill(false);

    var colhide;
    colhide = ( this.initpar.tablehidecols ) ?  this.initpar.tablehidecols : [];
    colhide = ( typeof colhide == 'string' ) ?  colhide.split(',') : colhide;

    var coltyp;
    coltyp = ( this.initpar.tablecoltype ) ?  this.initpar.tablecoltype : {};
    
    this.obj.cols.forEach((item,index) =>
    {
       var i;
       if ( colhide.indexOf(item) != -1 ) self.obj.colhide[index] = true;
       if ( coltyp[item] != undefined ) self.obj.coltyp[index] = coltyp[item];
    });
    
    this.obj.where = { wop : '', wcol : '', wval : '', modClear : () => {}, focus : () => {} };
    
    this.initpar.oktyps  = ( this.initpar.oktyps  != undefined ) ? this.initpar.oktyps  : this.initpar.tablecoltype;
    this.initpar.deltyps = ( this.initpar.deltyps != undefined ) ? this.initpar.deltyps : this.initpar.tablecoltype;

  }

  getViewPath() { return this.getView(import.meta.url); }
  getCssPath()  { return ((( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url)); }

  clear()
  {
    this.obj.tables.content.innerHTML = '';  
  }
  
  clearRows()
  {
    if ( this.obj.tbody )
        this.obj.tbody.innerHTML = '';
  }
  unselectRows()
  {
    var obj = this.obj.tbody.children;
    var i;
    for ( i =0; i<obj.length; i++)
      MneElement.clearClass(obj[i], 'active');
  }

  async mkRow(row)
  {
    if ( row.obj == undefined )
    {
      var i,j;
      this.obj  = Object.assign(this.obj, { inputs  : {}, outputs : {}, fields : [] });

      await this.findIO(row);
      row.obj = { inputs : this.obj.inputs, outputs : this.obj.outputs, fields : this.obj.fields }

      for ( j in this.obj.inputs )
      {
        var rr = this.obj.run.result.rids[j];
        this.obj.inputs[j].setTyp(this.obj.run.result.typs[rr], this.obj.run.result.regexps[rr], this.obj.run.result.formats[rr]);
        this.obj.inputs[j].setValue(row.values[rr]);
        if ( this.obj.run.result.rtabid[j] != undefined ) row.cells[this.obj.run.result.rtabid[j]].valueField = this.obj.inputs[j];
      }

      for ( j in this.obj.outputs )
      {
        var rr = this.obj.run.result.rids[j];
        this.obj.outputs[j].setTyp(this.obj.run.result.typs[rr], this.obj.run.result.regexps[rr], this.obj.run.result.formats[rr]);
        this.obj.outputs[j].setValue(row.values[rr]);
        if ( this.obj.run.result.rtabid[j] != undefined ) row.cells[this.obj.run.result.rtabid[j]].valueField = this.obj.outputs[j];
      }
    }
  }

  async selectRow(data, row, evt = {})
  {
    var i;
    var index;
    var obj = this.obj.tbody.children;

    while( row != null && row.style.display == 'none' ) row = row.nextSibling;

    if ( row == null )
    {
      this.unselectRows();
      this.obj.lastselect = 0;
      return;
    }

    await this.mkRow(row);

    index = row.rowIndex - (( this.obj.thead ) ? this.obj.thead.children.length : 0 );

    if ( this.obj.run.act_row == row && data.force != true ) return;
    this.obj.run.act_row = row;

    if ( this.initpar.selectsingle || ! evt.ctrlKey )
      this.unselectRows();

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
    
    this.enable(( data.type ) ? data.type : 'select');
    this.obj.run.okaction = row.okaction ?? 'mod';
    this.obj = Object.assign(this.obj, row.obj);
    
    for ( i = 0; i<this.obj.run.result.ids.length; ++i)
      this.obj.run.values[this.obj.run.result.ids[i]] = row.values[i];
    
    this.obj.lastselect = index;
    this.newselect = true;
  }

  get select()
  {
    var rows = this.obj.tbody.children;
    var i,j;
    var res = JSON.parse(JSON.stringify(this.obj.run.result))
    res.values = [];

    for ( i=0; i<rows.length; i++)
    {
      if ( MneElement.hasClass( rows[i], 'active'))
      {
        var inputs=rows[i].obj.inputs;

        res.values.push(rows[i].values.slice(0));
        for ( j in inputs ) res.values[res.values.length - 1][res.rids[j]] = inputs[j].getValue();
      }
    }
    return res;
  }
  
  get all()
  {
    var rows = this.obj.tbody.children;
    var i,j;
    var res = JSON.parse(JSON.stringify(this.obj.run.result))
    res.values = [];
    
    for ( i=0; i<rows.length; i++)
    {
      var inputs=rows[i].obj.inputs;
      
      res.values.push(rows[i].values.slice(0));
      for ( j in inputs ) res.values[i][res.rids[j]] = inputs[j].getValue();
    }

    return res;
  }
  
  arrow_down(evt)
  {
    evt.preventDefault();
    if ( ! this.initpar.selectsingle && evt.ctrlKey && this.obj.lastkey == "ArrowUp" )
      this.selectRow({}, this.obj.tbody.children[this.obj.lastselect], evt);
    else if ( this.obj.lastselect < ( this.obj.tbody.children.length - 1 ) ) 
      this.selectRow({}, this.obj.tbody.children[this.obj.lastselect + 1], evt);

    this.obj.lastkey = evt.key;
  }
  
  arrow_up(evt)
  {
    evt.preventDefault();
    if ( ! this.initpar.selectsingle && evt.ctrlKey && this.obj.lastkey == "ArrowDown" )
      this.selectRow({}, this.obj.tbody.children[this.obj.lastselect], evt);
    else if ( this.obj.lastselect > 0 ) 
      this.selectRow({}, this.obj.tbody.children[this.obj.lastselect - 1], evt);

    this.obj.lastkey = evt.key;
  }
  
  async loadview()
  {
    var self = this;

    await super.loadview();
    await super.getSelectLists();

    this.obj.container.content.addEventListener('contextmenu', function(evt) { evt.preventDefault(); }, false);
    this.obj.container.content.addEventListener('keyup', function(evt)
    {
      if ( evt.target.tagName != 'TABLE' ) return;
      evt.preventDefault();
    });

    this.obj.container.content.addEventListener('keydown', function(evt)
    {
      if ( evt.target.tagName != 'TABLE' ) return;
      if ( evt.shiftKey ) return;

      switch(evt.key)
      {
        case "ArrowDown" :
          self.arrow_down(evt);
          break;

        case  "ArrowUp" :
          self.arrow_up(evt);
          break;

        default:
          break;
      }
    });
  }
  
  async mkCol( col, value )
  {
    var typ    = ( this.obj.coltyp[col] ) ? this.obj.coltyp[col] : 'rd' + MneInput.getTyp(this.obj.run.result.typs[col]);
    var id     = this.obj.run.result.ids[col];
    var format = this.obj.run.result.formats[col];
    
    switch(typ)
    {
      case 'bool' : 
        return MneElement.getInput('checkbox', '<input type="checkbox" id="' + id + 'Input"' + ( ( MneInput.getValue(value, 'bool') ) ? ' checked="checked"' : '') + '/>');
      case 'selection' :
        value = MneInput.format(value, this.obj.run.result.typs[col], format);
        return MneElement.getSelect('<select id="' + id + 'Input">' + await this.getSelectListContent(id, value) + '</select>');
      case 'text' :
        value = MneInput.format(value, this.obj.run.result.typs[col], format);
        return MneElement.getSpan('<span id="' + id + 'Input" contenteditable="true" spellcheck="false"/>'+ value + '</span>');
      case 'mtext' :
        value = MneInput.format(value, this.obj.run.result.typs[col], format);
        return MneElement.getSpan('<span id="' + id + 'Input" class="multionfocus" aria-multiline="true" contenteditable="true" spellcheck="false">'+ value + '</span>');
      default :
        value = MneInput.format(value, this.obj.run.result.typs[col], format);
        return MneElement.getSpan('<span id="' + id + 'Output">'+ value + '</span>');
    }
  }

  async headclick(data, row, evt)
  {
    var scols =  evt.target.getAttribute('shortid');
    this.obj.run.readpar.scols = ( this.obj.run.readpar.scols == scols ) ?  this.obj.run.readpar.scols = '!' + scols : scols;
    return this.values();
  }

  async rowclick(data, row, evt)
  {
    if ( evt.detail < 2 ) 
    {
      if ( this.obj.run.act_row != row )
        return this.selectRow( data, row, evt);
    }
    else if ( evt.detail == 2 && evt.target.tagName != 'INPUT' && evt.target.contentEditable != true )
    {
      return this.dblclick();
    }
  }
  
  getTableParamAdd(p)
  {
    var i;
    p = super.getTableParamAdd(p);
    for ( i in this.obj.run.values)
      if ( ! p[i + "Input"] ) p[i + "Input"] = this.obj.run.values[i];

    
    return p;
  }
  
  getTableParamMod(p)
  {
    var i;
    var self = this;
    
    p = super.getTableParamMod(p);
    
    this.initpar.okids.forEach((value) =>  { p[ value + "Input.old"] = self.obj.run.values[value]; })
    this.initpar.modids.forEach((value) => { p[ value + "Input.old"] = self.obj.run.values[value]; })
      
    return p;
  }
  
  getTableParamDel(p)
  {
    var i;
    var self = this;
    
    p = super.getTableParamDel(p);
    this.initpar.okids.forEach((value) => { p[ value + "Input.old"] = ( self.obj.inputs[value] ) ? self.obj.inputs[value].getValue() : self.obj.run.values[value]; })
    this.initpar.delids.forEach((value) => { p[ value + "Input.old"] = ( self.obj.inputs[value] ) ? self.obj.inputs[value].getValue() : self.obj.run.values[value]; })
      
    return p;
  }

  async readvalues(request, p)
  {
    return MneRequest.fetch(request, p);
  }

  async values(param)
  {
    var i,j;
    var str = '';
    var self = this;

    this.obj.run.values = {};
    this.obj.run.act_row = undefined;
    
    var p = Object.assign(
        {
          cols     : this.initpar.cols,
          wcol     : (( this.initpar.wcol ) ? this.initpar.wcol + ( ( this.obj.where.wcol) ? ',' : '' ) : '' ) + this.obj.where.wcol,
          wop      : (( this.initpar.wop  ) ? this.initpar.wop  + ( ( this.obj.where.wop)  ? ',' : '' ): ''  ) + this.obj.where.wop,
          wval     : (( this.initpar.wcol ) ? this.initpar.wval + ( ( this.obj.where.wcol) ? ',' : '' ) : '' ) + this.obj.where.wval,

          lastquery : ( this.obj.lastquery ) ? '1' : '',
          sqlend   : 1
        }, this.obj.run.readpar);

    p = this.getParamShow(p);
    if ( p.value_not_found ) p.no_vals = '1';

    this.obj.run.result = Object.assign({}, await this.readvalues(this.obj.run.btnrequest.read, p));

//    str = '<table class="' + this.initpar.classname + ' disable-select relative" tabindex=1>';
    str = '<table class="' + this.initpar.classname + ' relative" tabindex=1>';

    if ( ! this.initpar.nohead )
    {
      str +='<thead><tr>'
        for ( i =0; i < this.obj.run.result.labels.length; ++i)
          if ( ! this.obj.colhide[i] ) str += '<td>' + (( this.initpar.labels[i] != undefined ) ? this.initpar.labels[i] : this.obj.run.result.labels[i]) + '</td>';
      str += '</tr></thead>';
    }

    str += '<tbody>';
    for ( i =0; ( this.obj.run.result.values && i < this.obj.run.result.values.length); ++i)
    {
      str += '<tr>'
        for ( j =0; j< this.obj.run.result.values[i].length; ++j)
          if ( ! this.obj.colhide[j] ) str += '<td>' + await this.mkCol(j, this.obj.run.result.values[i][j]) + '</td>';
      str += '</tr>'
    }
    str += '</tbody></table>';

    this.obj.tables.content.innerHTML = str;
    
    this.obj.run.result.rtabid = {};
    if ( ! this.initpar.nohead )
    {
      var head = this.obj.tables.content.firstChild.querySelector('thead tr');
      for ( i=j=0; i < this.obj.run.result.labels.length; ++i)
      {
        if ( ! this.obj.colhide[i] )
        {
          this.obj.run.result.rtabid[this.obj.run.result.ids[i]] = j;
          this.obj.labels[this.obj.run.result.ids[i]] = head.children[j];
          head.children[j++].setAttribute('shortid', this.obj.run.result.ids[i]);
        }
      }
      head.addEventListener('click', function(evt) { self.btnClick('headclick', {}, this, evt); }, true);
    }

    var rows = this.obj.tables.content.firstChild.querySelector('tbody').children;
    for ( i =0; i<rows.length; i++)
    {
      rows[i].values = this.obj.run.result.values[i];
      if ( this.initpar.mkrowdirect ) await this.mkRow(rows[i]);
      rows[i].addEventListener('click', function(evt) { self.btnClick('rowclick', {}, this, evt); }, true);
      rows[i].addEventListener('mousedown', function(evt) { self.mkRow(this) }, true);
    }

    this.obj.run.result.values = [];
    
    this.obj.lastselect = -1;
    this.obj.thead = this.obj.tables.content.firstChild.querySelector('thead');
    this.obj.tbody = this.obj.tables.content.firstChild.querySelector('tbody');
    this.obj.table = this.obj.tables.content.firstChild;
    if ( ! this.initpar.nofocus ) this.obj.table.focus()
    
    this.obj.where.modClear();
    this.enable('value');
    this.obj.run.okaction = 'add';
  }

  async refresh()
  {
  }
  
  async tab(data, obj, evt)
  {
    if ( this.obj.fields.length > 0 ) return super.tab(data, obj, evt);
    
    this.obj.where.focus();
    evt.preventDefault();
    evt.stopPropagation();
    
    return false;
  }
  
  async dblclick()
  {
  }
  
  async detaildel()
  {
  }
}

export default MneDbTableBasic;

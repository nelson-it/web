//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/db/table/basic.mjs
//================================================================================
'use strict';

import MneConfig    from '/js/basic/config.mjs'
import MneText      from '/js/basic/text.mjs'
import MneLog       from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneInput     from '/js/basic/input.mjs'

import MneDbView    from '../view.mjs'
import MneWeblet    from '/weblet/basic/weblet.mjs'


class MneDbTableBasic extends MneDbView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        classname : 'border padding top',
        labels    : [],
        cols      : '',
        
        detailvalues : {},
        detaildefvalues : {},
        
        selectsingle : false,
        mkrowdirect : false,
        
        rowselector : 'tbody tr',
        
        popupparent : parent,
        
        htmlcontent : '<div id="contentTable" style="white-space: nowrap;"></div>'
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  reset ()
  {
    var self = this;
    var i;
    
    super.reset();

    this.obj.run.btnrequest.add = ( this.obj.run.btnrequest.add ) ? this.obj.run.btnrequest.add : undefined;
    this.obj.run.btnrequest.mod = ( this.obj.run.btnrequest.mod ) ? this.obj.run.btnrequest.mod : undefined;
    this.obj.run.btnrequest.del = ( this.obj.run.btnrequest.del ) ? this.obj.run.btnrequest.del : undefined;
    
    this.obj.mkbuttons =
      [
        { id : 'select',       value : unescape("%uf0c9"), size : 'notset', classname : 'mobile', show : this.initpar.selectpopup },
        { id : 'refresh',      value : MneText.getText('#mne_lang#Aktualisieren'), space : 'behind' },
        
        { id : 'ok',           value : MneText.getText('#mne_lang#OK'),         show : ( this.obj.run.btnrequest.add != undefined ) || ( this.obj.run.btnrequest.mod != undefined ) },
        { id : 'cancel',       value : MneText.getText('#mne_lang#Abbrechen'),  show : ( this.obj.run.btnrequest.add != undefined ) || ( this.obj.run.btnrequest.mod != undefined ) },
        { id : 'add',          value : MneText.getText('#mne_lang#Hinzufügen'), show : ( this.obj.run.btnrequest.add != undefined ), },
        { id : 'detailscreen', value : MneText.getText('#mne_lang#Hinzufügen/Ändern'),     show : ( this.initpar.detailscreen   != undefined ) },
        { id : 'detail',       value : MneText.getText('#mne_lang#Hinzufügen/Ändern'),     show : ( this.initpar.detailweblet   != undefined ) },
        { id : 'del',          value : MneText.getText('#mne_lang#Löschen'),    show : ( this.obj.run.btnrequest.del != undefined ) },
        { id : 'detaildel',    value : MneText.getText('#mne_lang#Löschen'),    show : ( this.initpar.detailweblet   != undefined ) },

        { id : 'print',     value :  MneText.getText('#mne_lang#Drucken'), space : (( this.initpar.report != undefined ) ? '' : 'before') , show : ( this.initpar.report != undefined ) } ,
        { id : 'export',    value :  MneText.getText('#mne_lang#Exportieren'), space : 'before' }
        ]

    this.obj.enablebuttons.buttons = ['ok', 'add', 'detail', 'del', 'detaildel', 'detailscreen' ];

    this.obj.enablebuttons.add    = [ 'ok', 'add', 'detail', 'detailscreen'  ];
    this.obj.enablebuttons.del    = [ 'add', 'detail' ];
    this.obj.enablebuttons.values = [ 'add', 'detail', 'detailscreen'  ];
    this.obj.enablebuttons.select = [ 'ok', 'add', 'detail', 'detailscreen', 'del', 'detaildel' ];
    
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
    
    this.obj.colstyle = Object.assign({}, this.initpar.tablecolstyle ?? {} );
    this.obj.where = { wop : '', wcol : '', wval : '', modClear : () => {}, focus : () => {} };
    
    this.initpar.oktyps  = ( this.initpar.oktyps  != undefined ) ? this.initpar.oktyps  : this.initpar.tablecoltype;
    this.initpar.deltyps = ( this.initpar.deltyps != undefined ) ? this.initpar.deltyps : this.initpar.tablecoltype;
    
    this.initpar.primarykey = this.initpar.primarykey ?? this.initpar.okids;
    this.obj.run.selectedkeys = [];

  }

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

  primarykey()
  {
    var skey;
    if ( this.initpar.primarykey &&  this.initpar.primarykey.length )
    {
      skey = {};
      this.initpar.primarykey.forEach((item) =>
      {
        skey[item] = this.obj.run.values[item]; 
      })
    this.obj.run.selectedkeys.push(skey);
    }
  }

  unselectRows()
  {
    if ( this.obj.tbody )
    {
      var obj = this.obj.tbody.children;
      var i;
      for ( i =0; i<obj.length; i++)
        MneElement.clearClass(obj[i], 'active');
    }
    this.obj = Object.assign(this.obj, { inputs  : {}, outputs : {}, files : {}, fields : [] });
    this.obj.lastselect = undefined;
    this.obj.run.act_row = undefined;
    this.obj.run.values = this.parent.obj.run.values = Object.assign({}, this.parent.obj.run.origvalues);
    this.obj.run.selectedkeys = [];
  }

  mkRowStyle(rids, values)
  {
    if ( !  this.initpar.tablerowstyle ) return '';
    
    var str = ' class = "'
    this.initpar.tablerowstyle.forEach((item, index) =>
    {
       str += item + values[rids[this.initpar.tablerowstylecol[index]]] + " ";
    })
    
    return str + '" ';
  }
  
  async mkRow(row)
  {
    if ( row.obj == undefined )
    {
      var i,j;
      this.obj  = Object.assign(this.obj, { inputs  : {}, outputs : {}, files : {}, fields : [] });

      await this.findIO(row);
      row.obj = { inputs : this.obj.inputs, outputs : this.obj.outputs, files : this.obj.files, fields : this.obj.fields, observer : {} }
      row.obj.observer.row = new MutationObserver( (muts, server) =>
      {
        var i;
        for ( i=0; i<muts.length; i++)
        {
          if ( muts[i].target != row )
          {
            MneElement.mkClass(row, 'modify' + (( row.querySelector('.modifyok') == null ) ? 'no' : 'ok' ), true, 'modify')
            break;
          }
        }
      });
      row.obj.observer.row.observe(row, { subtree : true, attributes: true, attributeFilter : [ 'class' ] });

      this.obj.colhide.forEach((item, index) => 
      {
        if ( item )
        {
          var ele;
          row.appendChild(( ele = document.createElement('span')));
          ele.style.display = 'none';
          MneElement.mkClass(ele, 'ele-wrapper');
          this.mkOutput(this.obj.run.result.ids[index], ele);
          this.obj.outputs[this.obj.run.result.ids[index]] = ele;
        }
      });
      
      for ( j in this.obj.inputs )
      {
        var rr = this.obj.run.result.rids[j];
        this.obj.inputs[j].setTyp(this.obj.run.result.typs[rr], this.initpar.regexp[j] ?? this.obj.run.result.regexps[rr], this.obj.run.result.formats[rr]);
        this.obj.inputs[j].setValue(row.values[rr]);
        if ( this.obj.run.result.rtabid[j] != undefined ) row.cells[this.obj.run.result.rtabid[j]].valueField = this.obj.inputs[j];
      }

      for ( j in this.obj.outputs )
      {
        var rr = this.obj.run.result.rids[j];
        this.obj.outputs[j].setTyp(this.obj.run.result.typs[rr], this.initpar.regexp[j] ?? this.obj.run.result.regexps[rr], this.obj.run.result.formats[rr]);
        this.obj.outputs[j].setValue(row.values[rr]);
        if ( this.obj.run.result.rtabid[j] != undefined ) row.cells[this.obj.run.result.rtabid[j]].valueField = this.obj.outputs[j];
      }

      MneElement.mkClass(row, 'modify' + (( row.querySelector('.modifyok') == null ) ? 'no' : 'ok' ), true, 'modify')
    }
  }

  async selectRow(data, row, evt = {})
  {
    var i;
    var index;
    var obj = this.obj.tbody.children;

    while( row != null && ( row.style.display == 'none' || row.values == undefined ) ) row = row.nextSibling;

    if ( data.force != true && (row == null || this.obj.run.act_row == row) )
    {
      this.unselectRows();
      this.obj.lastselect = undefined;
      this.obj.run.act_row = undefined;
      this.getParamShow({});
      return;
    }

    index = row.rowIndex - (( this.obj.thead ) ? this.obj.thead.children.length : 0 );

    if ( this.obj.run.act_row == row && data.force != true ) return;

    if ( this.initpar.selectsingle || ( ! evt.ctrlKey && !evt.shiftKey ) )
      this.unselectRows();

    this.obj.run.act_row = row;
    if ( ! this.initpar.selectsingle && evt.shiftKey )
    {
      if ( ! this.obj.lastselect || this.obj.lastselect < index )
        for ( i = ( ! this.obj.lastselect ) ? 0 : this.obj.lastselect; i<=index; i++)
        {
          if ( obj[i].values != undefined ) 
          {
            await this.mkRow(obj[i]);
            MneElement.mkClass(obj[i], 'active');
          }
        }
      else
        for ( i = index; i <= this.obj.lastselect; i++)
        {
          if ( obj[i].values != undefined ) 
          {
            await this.mkRow(obj[i]);
            MneElement.mkClass(obj[i], 'active');
          }
        }
    } 
    else
    {
      await this.mkRow(row);
      MneElement.mkClass(row, 'active', ! MneElement.hasClass(row, 'active'));
    }
    
    this.enable(( data.type ) ? data.type : 'select');
    this.obj.run.okaction = row.okaction ?? 'mod';
    this.obj = Object.assign(this.obj, row.obj);
    
    for ( i = 0; i<this.obj.run.result.ids.length; ++i)
      this.parent.obj.run.values[this.obj.run.result.ids[i]] = this.obj.run.values[this.obj.run.result.ids[i]] = MneInput.getValue(row.values[i], this.obj.run.result.typs[i], true);
    
    this.primarykey();
    this.obj.lastselect = index;
    this.newselect = true;
  }

  isselected(row)
  {
      return MneElement.hasClass(row, 'active');  
  }
  
  fillres(rows)
  {
    var i,j;
    var res = JSON.parse(JSON.stringify(this.obj.run.result))
    res.values = [];
    
    for ( i=0; i<rows.length; i++)
    {
      var inputs=rows[i].obj.inputs;
      
      res.values.push(rows[i].values.slice(0));
      for ( j in inputs ) res.values[i][res.rids[j]] = inputs[j].getValue(false);
    }
    return res;
  }

  get select()
  {
    var rows = this.obj.tbody.querySelectorAll('tr.active');
    return this.fillres(rows);
  }
  
  get all()
  {
    var rows =  this.obj.tbody.children;
    return this.fillres(rows);
  }
  
  arrow_down(data, obj, evt)
  {
    evt.preventDefault();
    if ( ! this.initpar.selectsingle && evt.ctrlKey && this.obj.lastkey == "ArrowUp" )
      this.selectRow({type : 'arrow'}, this.obj.tbody.children[this.obj.lastselect], evt);
    else if ( this.obj.lastselect < ( this.obj.tbody.children.length - 1 ) ) 
      this.selectRow({type : 'arrow'}, this.obj.tbody.children[this.obj.lastselect + 1], evt);

    this.obj.lastkey = evt.key;
  }
  
  arrow_up(data, obj, evt)
  {
    evt.preventDefault();
    if ( ! this.initpar.selectsingle && evt.ctrlKey && this.obj.lastkey == "ArrowDown" )
      this.selectRow({type : 'arrow'}, this.obj.tbody.children[this.obj.lastselect], evt);
    else if ( this.obj.lastselect > 0 ) 
      this.selectRow({type : 'arrow'}, this.obj.tbody.children[this.obj.lastselect - 1], evt);

    this.obj.lastkey = evt.key;
  }
  
  async load()
  {
    await super.load();
    
    this.obj.observer.content.disconnect();
    delete this.obj.observer.content;
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
          self.btnClick('arrow_down', {}, this, evt);
          break;

        case  "ArrowUp" :
          self.btnClick('arrow_up', {}, this, evt);
          break;

        default:
          break;
      }
    });
  }
  
  mkColStyle(col, values)
  {
    var ids = this.obj.run.result.ids;
    var rids = this.obj.run.result.rids;
    
    if ( !  this.obj.colstyle || ! this.obj.colstyle[ids[col]]) return '';
    return ' class = "' + (( this.obj.colstyle[ids[col]][0] == '#' ) ? this.obj.colstyle[ids[col]].substr(1) : values[rids[this.obj.colstyle[ids[col]]]] ) + '"';
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
      case 'file' :
        value = MneInput.format(value, this.obj.run.result.typs[col], format);
        return MneElement.getInput('file', '<span id="' + id + 'Input" contenteditable="true" spellcheck="false"/>'+ value + '</span>');
      case 'edit' :
        value = MneInput.format(value, this.obj.run.result.typs[col], format);
        return MneElement.getEditor('<span id="' + id + 'Editor"/>'+ value + '</span>');
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
    if ( !evt || evt.detail < 2 ) 
    {
      if ( this.obj.run.act_row != row )
        await this.selectRow( data, row, evt);
      else
      {
        var i;
        this.obj = Object.assign(this.obj, row.obj);

        for ( i = 0; i<this.obj.run.result.ids.length; ++i)
          this.parent.obj.run.values[this.obj.run.result.ids[i]] = this.obj.run.values[this.obj.run.result.ids[i]] = MneInput.getValue(row.values[i], this.obj.run.result.typs[i], true);
        return false;
      }
    }
    else if ( evt.detail == 2 )
    {
      if ( evt.target.tagName != 'INPUT' && evt.target.isContentEditable != true )
       return await this.dblclick();
      else
        return false;
    }
    this.newvalues = false;
    return true;
  }
  
  getTableParamValue(i)
  {
    var ele = this.obj.inputs[i] ?? this.obj.outputs[i];
    return ( ele ) ? ele.getValue() : this.obj.run.values[i];
  }

  getTableParamAdd(p)
  {
    var cols = this.initpar.addcols ?? this.initpar.okcols ?? Object.keys(this.obj.run.values);
    cols.forEach((item) => { if ( ! p[item + "Input"] ) p[item + "Input"] = this.getTableParamValue(item) })
    return p;
  }
  
  getTableParamMod(p)
  {
    var cols = this.initpar.modcols ?? this.initpar.okcols ?? Object.keys(this.obj.run.values);
    cols.forEach((item) => { if ( ! p[item + "Input"] ) p[item + "Input"] = this.getTableParamValue(item) })

    this.initpar.okids.forEach((value) => { p[ value + "Input.old"] = this.obj.run.values[value]; })
    
    return p;
  }
  
  getTableParamDel(p)
  {
    this.initpar.delids.forEach((value) => { p[ value + "Input.old"] = this.obj.run.values[value]; })
    return p;
  }

  async readvalues(request, p)
  {
    return MneRequest.fetch(request, p);
  }

  async values(param = {})
  {
    var i,j;
    var str = '';
    var self = this;

    for ( i in this.obj.selectlists )
      if ( this.obj.selectlists[i].dynamic ) this.obj.selectlists[i].content = undefined;
    
    if ( this.initpar.defalias )
    {
      for ( i in this.initpar.defalias )
        this.obj.defvalues[i] = this.config.dependweblet.obj.run.values[this.initpar.defalias[i]];
    }

    this.obj.run.values = Object.assign({}, this.config.dependweblet.obj.run.values);
    this.obj.run.act_row = undefined;
    
    var p = Object.assign(
        {
          cols     : this.initpar.cols,
          wcol     : (( this.initpar.wcol ) ? this.initpar.wcol + ( ( this.obj.where.wcol) ? ',' : '' ) : '' ) + this.obj.where.wcol,
          wop      : (( this.initpar.wop  ) ? this.initpar.wop  + ( ( this.obj.where.wop)  ? ',' : '' ): ''  ) + this.obj.where.wop,
          wval     : (( this.initpar.wcol ) ? this.initpar.wval + ( ( this.obj.where.wcol) ? ',' : '' ) : '' ) + this.obj.where.wval,

          lastquery : ( this.parent.obj.lastquery || this.obj.lastquery ) ? '1' : '',
          sqlstart : 1,
          sqlend   : 1
        }, this.obj.run.readpar);

    p = this.getParamShow(p);
    if ( p.value_not_found ) p.no_vals = '1';
    
    for ( i in param ) p[i] = param[i];

    this.obj.run.result = Object.assign({}, await this.readvalues(this.obj.run.btnrequest.read, p));

    str = '<table class="' + this.initpar.classname + ' relative" tabindex=1>';

    if ( ! this.initpar.nohead )
    {
      str +='<thead><tr>'
        for ( i =0; i < this.obj.run.result.labels.length; ++i)
          if ( ! this.obj.colhide[i] ) str += '<th>' + (( this.initpar.labels[i] != undefined ) ? this.initpar.labels[i] : this.obj.run.result.labels[i]) + '</th>';
      str += '</tr></thead>';
    }

    str += '<tbody>';
    for ( i =0; ( this.obj.run.result.values && i < this.obj.run.result.values.length); ++i)
    {
      str += '<tr' + this.mkRowStyle(this.obj.run.result.rids, this.obj.run.result.values[i]) + '>'
        for ( j =0; j< this.obj.run.result.values[i].length; ++j)
          if ( ! this.obj.colhide[j] ) str += '<td ' + this.mkColStyle(j, this.obj.run.result.values[i]) +'>' + await this.mkCol(j, this.obj.run.result.values[i][j]) + '</td>';
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

    this.obj.run.okaction = 'add';
    this.obj.lastselect = undefined;

    var enable = 'values';
    if ( this.initpar.okids != this.initpar.showids )
      this.initpar.showids.forEach((item, index) =>
      {
        var val = ( this.initpar.showalias && this.initpar.showalias[index] ) ? this.initpar.showalias[index]() : this.config.dependweblet.obj.run.values[item];
        if ( val == undefined || val == null || val == '################') enable = '';
      });

    this.enable(enable, enable != '' );

    this.obj.tables.content.firstChild.querySelectorAll('tbody tr').forEach( ( item, index ) =>
    {
      item.addEventListener('click', function(evt) { if ( evt.shiftKey ) window.getSelection().removeAllRanges(); }, true);
      item.valueindex = index;
    });

    var selectedkeys = this.obj.run.selectedkeys;
    this.obj.run.selectedkeys = [];

    var rows = this.obj.tables.content.firstChild.querySelectorAll(this.initpar.rowselector);
    for ( i =0; i<rows.length; i++)
    {
      var equal = false;
      
      rows[i].values = this.obj.run.result.values[rows[i].valueindex];
      selectedkeys.forEach( (item) =>
      {
        var j;
        if ( equal == false )
        {
          var e = true;
          for ( j in item )  { if ( rows[i].values[this.obj.run.result.rids[j]] != item[j] ) { e = false; break } };
          if ( e ) equal = true;
        }
      });
      if ( rows.length < 50 || this.initpar.mkrowdirect || equal ) await this.mkRow(rows[i]);
      if ( equal )
        await this.selectRow({type : 'select'}, rows[i], { ctrlKey : true });

      rows[i].addEventListener('click', function(evt) { if ( evt.shiftKey ) window.getSelection().removeAllRanges(); self.btnClick('rowclick', {}, this, evt); }, true);
      rows[i].addEventListener('mousedown', function(evt) { self.mkRow(this) }, true);
    }
    
    this.obj.run.result.values = [];
    
    this.obj.thead = this.obj.tables.content.firstChild.querySelector('thead');
    this.obj.tbody = this.obj.tables.content.firstChild.querySelector('tbody');
    this.obj.table = this.obj.tables.content.firstChild;
    if ( ! this.initpar.nofocus ) this.obj.table.focus()
    
    this.obj.where.modClear();
  }

  async execute_selected(func)
  {
    var i,j;
    var rows = [];
    var retval = false;

    this.obj.run.selectedkeys = [];

    Array.from(this.obj.tbody.children).forEach((item) => { if ( this.isselected(item)) rows.push(item)});
    for ( i=0; i<rows.length; i++)
    {
      retval = true;
      await this.selectRow({force : true, type : 'ok' }, rows[i] )
      this.primarykey();
      await func();
    }
    return retval;
  }

  async execute_modified(func)
  {
    var i,j;
    var rows = [];
    var retval = false;

    this.obj.run.selectedkeys = [];

    Array.from(this.obj.tbody.children).forEach((item) => { if ( item.ismodify || item.querySelector('.modifyok') != null ) rows.push(item)});
    for ( i=0; i<rows.length; i++)
    {
      retval = true;
      await this.selectRow({force : true, type : 'ok' }, rows[i] )
      this.primarykey();
      await func();
    }
    return retval;
  }

  async refresh()
  {
    if ( this.initpar.primarykey  && this.obj.tbody )
    {
      var skey;
      var sel;
      try { sel = this.select } catch (e) { sel = { values : [] }; };
      this.obj.run.selectedkeys = [];
      skey = {};
      sel.values.forEach((val) => 
      {
        this.initpar.primarykey.forEach((item) =>
        {
          skey[item] = val[sel.rids[item]]; 
        })
        this.obj.run.selectedkeys.push(Object.assign({},skey));
      });
    }
    this.newvalues = true;
  }
  
  async tab(data, obj, evt)
  {
    if ( this.obj.fields.length > 0 && evt.target.fieldnum != undefined ) return super.tab(data, obj, evt);
    
    this.obj.where.focus();
    evt.preventDefault();
    evt.stopPropagation();
    
    return false;
  }
  
  async dblclick()
  {
  }
  
  async detail()
  {
    console.log('TableBasic: kein detail')
  }

  async detailscreen()
  {
    console.log('TableBasic: kein detail')
  }

  async detailadd()
  {
    console.log('TableBasic: kein detailadd')
  }

  async detailmod()
  {
    console.log('TableBasic: kein detailmod')
  }

  async detaildel()
  {
    console.log('TableBasic: kein detaildel')
  }
}

MneDbTableBasic.idcount = 0;

export default MneDbTableBasic;

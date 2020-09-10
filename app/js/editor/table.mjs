//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/editor/table.mjs
//================================================================================
'use strict';

import MneTheme    from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneRtePlugin from './plugin.mjs'

class MneRteTable extends MneRtePlugin
{
  constructor(editor)
  {
    var i;
    super(editor);

    this.buttonnames = [ 'table', 'table_delete', 'table_insert_col_before', 'table_insert_col_behind', 'table_delete_col', 'table_insert_row_before', 'table_insert_row_behind', 'table_delete_row',   ];
    this.help = 
    {
        table : '#mne_lang#Tabelle hinzufügen',
        table_delete : '#mne_lang#Tabelle löschen',
        table_insert_col_before :  '#mne_lang#Spalte vor die aktuelle Spalte hinzufügen',
        table_insert_col_behind : '#mne_lang#Spalte hinter die aktuelle Spalte hinzufügen',
        table_delete_col : '#mne_lang#aktuelle Spalte löschen',
        table_insert_row_before : '#mne_lang#Zeile vor die aktuelle Zeile hinzufügen',
        table_insert_row_behind : '#mne_lang#Zeile hinter die aktuelle Zeile hinzufügen',
        table_delete_row : '#mne_lang#aktuelle Zeile löschen'
    }
    this.classes = { border : 'mne_border', padding : 'mne_padding', };
    this.attrframe = document.createElement('div');
    this.attrframe.className = 'mne-rte-attr-frame mne-rte-attr-table';
    this.attrframe.innerHTML = '<div class="header"><span>#mne_lang#Tabelle</span></div>'
                             + '<div><span>#mne_lang#Rahmen#: </span>' + MneElement.getInput('checkbox', '<input id="rte-table-attr-border" type="checkbox"/>') + '</div>'
                             + '<div class="header"><span>#mne_lang#Spalte</span></div>'
                             + '<div><span>#mne_lang#Breite#: </span>' + MneElement.getInput('text', '<input id="rte-table-attr-width" size=2 type="text"/>') + '</div>'

    this.attr = { border : this.attrframe.querySelector("#rte-table-attr-border"), width : this.attrframe.querySelector("#rte-table-attr-width") };
    
    this.attr.border.observer = new MutationObserver( (muts) => { console.log(muts), this.setBorder(); });
    this.attr.border.observer.observe(this.attr.border, { attributes: true });
    
    this.attr.width.addEventListener('keyup', (evt) => { this.setWidth(); });
    
    this.editarea.addEventListener('click', (evt) => { this.showAttr(this.getSelection().focusInline); } );
    this.editarea.addEventListener('keydown', (evt) =>
    {
      switch(evt.key)
      {
        case "Tab":
          if ( evt.shiftKey )
            this.prevcol();
          else
            this.nextcol();
          evt.preventDefault();
      }
    }, true)

    editor.addKeypressType('TABLE', this);
  }
  
  keypress(evt, entercount)
  {
    switch(evt.key)
    {
      case "Enter":
        if ( entercount == 2 )
        {
          this.nextrow();
          evt.preventDefault();
          evt.stopImmediatePropagation();
        }

        if ( entercount == 3 )
        {
          var sel = this.getSelection();
          var tab = sel.focusInline.closest('table');
          if ( tab.nextSibling == null )
            this.newBlock(tab.parentNode, sel );
          this.moveCursor(tab.nextSibling.querySelector('span'));
          evt.preventDefault();
          evt.stopImmediatePropagation();
        }
        break;
      default:
    }
    return true;
  }

  showAttr(element)
  {
    if ( ( this.act_table = element.closest('.mne-rte-editarea table')) != null )
    {
      var w;
      this.editor.frame.appendChild(this.attrframe);
      this.attrframe.style.left = this.act_table.offsetLeft + "px";
      this.attrframe.style.top  = this.act_table.offsetTop + "px";
      
      this.attr.border.checked = MneElement.hasClass(this.act_table, this.classes.border);
      
      this.act_td = element.closest('.mne-rte-editarea td');
      this.attr.width.value = this.act_td.getAttribute('aria-relwidth');
    }
    else if ( this.attrframe.parentNode != null )
      this.attrframe.parentNode.removeChild(this.attrframe);

  }
  
  setBorder()
  {
    if ( this.act_table ) MneElement.mkClass(this.act_table, this.classes.border, this.attr.border.checked );
  }
  
  setWidth()
  {
    if ( this.act_td )
    {
      var cellnum = this.act_td.cellIndex;
      var tab = this.act_td.closest('tbody');

      tab.childNodes.forEach((tr) => 
      {
        tr.cells[cellnum].setAttribute('aria-relwidth', this.attr.width.value );
      });
    }
  }

  table(sel)
  {
    var newtab,newtd;

    var blocks = this.splitBlock(sel);
    newtab = document.createElement('table');
    newtab.innerHTML = '<tr><td></td></tr>';
    newtd = newtab.querySelector('td');

    blocks[1].forEach((item) => { newtd.appendChild(item)});

    if ( blocks[1].length == 0 )
      this.newBlock(newtd, sel);

    this.insertAfter(blocks[0], newtab);
    if ( blocks[0].textContent == '') blocks[0].parentNode.removeChild(blocks[0]);
    
    this.moveCursor(newtd.querySelector('span'), true);
  }

  table_delete(sel)
  {
    var tab = sel.focusInline.closest('.mne-rte-editarea table');
    if ( tab != null )
      tab.parentNode.removeChild(tab);
  }

  table_insert_row(sel, offset)
  {
    var tr = sel.focusInline.closest('.mne-rte-editarea tr');
    if ( tr != null )
    {
      var tab = tr.closest('tbody');
      var newtr = tab.insertRow(tr.rowIndex + offset);

      tr.childNodes.forEach((td) => 
      {
        var cell = newtr.insertCell();
        this.newBlock(cell, sel);
      });

      this.moveCursor(((offset ) ? tr.nextSibling : tr.previousSibling).querySelector('span'), true)
    }
  }

  table_insert_row_before(sel)
  {
    this.table_insert_row(sel, 0);
  }

  table_insert_row_behind(sel)
  {
    this.table_insert_row(sel, 1);
  }

  table_delete_row(sel)
  {
    var tr = sel.focusInline.closest('.mne-rte-editarea tr');
    if ( tr != null )
    {
      var tab = tr.closest('tbody');
      var newtr = tab.deleteRow(tr.rowIndex);
    }
  }

  table_insert_col(sel, offset)
  {
    var td = sel.focusInline.closest('.mne-rte-editarea td');
    if ( td != null )
    {
      var cellnum = td.cellIndex;
      var tab = td.closest('tbody');

      tab.childNodes.forEach((tr) => 
      {
        var cell = tr.insertCell(cellnum + offset);
        this.newBlock(cell, sel);
      });

      this.moveCursor((( offset ) ? td.nextSibling : td.previousSibling).querySelector('span'), true)
    }
  }

  table_insert_col_before(sel)
  {
    this.table_insert_col(sel, 0);
  }

  table_insert_col_behind(sel)
  {
    this.table_insert_col(sel, 1);
  }

  table_delete_col(sel, offset)
  {
    var td = sel.focusInline.closest('.mne-rte-editarea td');
    if ( td != null )
    {
      var cellnum = td.cellIndex;
      var tab = td.closest('tbody');

      tab.childNodes.forEach((tr) => 
      {
        var cell = tr.deleteCell(cellnum);
      });
    }
  }

  nextrow()
  {
    var sel = this.getSelection();
    var tr = sel.focusInline.closest('.mne-rte-editarea tr')
    if ( tr == null ) return;
    
    if ( tr.nextSibling != null )
      this.moveCursor(tr.nextSibling.querySelector('span'), true);
    else
      this.table_insert_row_behind(sel);

    this.clearNew();
  }

  nextcol()
  {
    var sel = this.getSelection();
    var td = sel.focusInline.closest('.mne-rte-editarea td');

    if ( td == null ) return;
    
    if ( td.nextSibling != null )
      this.moveCursor(td.nextSibling.querySelector('span'), true);
    else
      this.table_insert_col_behind(sel);

    this.clearNew();
  }
  
  prevcol()
  {
    var sel = this.getSelection();
    var td = sel.focusInline.closest('.mne-rte-editarea td');
    
    if ( td == null ) return;
    
    if ( td.previousSibling != null )
    {
      this.moveCursor(Array.from(td.previousSibling.querySelectorAll('span')).pop(), false);
      this.clearNew();
    }
    else
    {
      var tab = td.closest('.mne-rte-editarea table');
      if ( tab.previousSibling != null )
      {
        this.moveCursor(Array.from(tab.previousSibling.querySelectorAll('span')).pop(), false);
        this.clearNew();
      }
      else
      {
        var newblock = this.newBlock();
        tab.parentNode.insertBefore(newblock,tab);
        this.moveCursor(newblock.querySelector('span'));
      }
    }
  }

}

export default MneRteTable

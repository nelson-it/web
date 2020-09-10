//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/editor/list.mjs
//================================================================================
'use strict';

import MneTheme    from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneRtePlugin from './plugin.mjs'

class MneRteList extends MneRtePlugin
{
  constructor(editor)
  {
    super(editor);

    this.buttonnames = [ 'item', 'enum' ];
    this.help = 
    {
        item   : "#mne_lang#Aufzählung einfügen",
        'enum' : "#mne_lang#numerierte Aufzählung einfügen",
    }
    
    editor.addKeypressType('LI', this);
  } 

  keypress(evt, returncount)
  {
    if ( evt.key != 'Enter' || evt.shiftKey ) return true;

    var sel = this.getSelection();
    var li;
    if ( ( li = sel.focusBlock.parentNode).tagName == 'LI' )
    {
      var newli,pos = true;

      if ( returncount == 2 )
      {
        var b = this.newBlock(null, sel);
        this.insertAfter(li.parentNode, b);
        this.moveCursor(b.querySelector('span'), true);
        evt.preventDefault();
        evt.stopImmediatePropagation();
       return false;
      }

      var blocks = this.splitBlock(sel);

      if ( blocks[1].length > 0 )
      {
        this.insertAfter(li, ( newli = document.createElement('li')));
        blocks[1].forEach((item) => { newli.appendChild(item)});
        li = li.nextSibling;
      }
      
      this.insertAfter(li, ( newli = document.createElement('li')));
      newli.appendChild(blocks[2]);
      while ( blocks[2].nextSibling != null ) newli.appendChild(blocks[2].nextSibling);

      this.moveCursor(newli.querySelector('span'), pos)

      evt.preventDefault();
      evt.stopImmediatePropagation();
      return false;

    }
  }

  add(id, sel)
  {
    var newul;
    var newli;

    if ( sel == undefined ) return;

    var blocks = this.splitBlock(sel);
    
    newul = document.createElement(id);
    newul.appendChild((newli = document.createElement('li')));
    blocks[1].forEach((item) => { newli.appendChild(item)});
    
    if ( blocks[1].length == 0 )
      this.newBlock(newli, sel);
    
    this.insertAfter(blocks[0], newul);
    this.moveCursor(newli.querySelector('span'), true);
    
  }

  enum(selection)
  {
    this.add('ol', selection);
  }

  item(selection)
  {
    this.add('ul', selection);
  }

}

export default MneRteList

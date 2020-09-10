//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/editor/events.mjs
//================================================================================
'use strict';

import MneTheme    from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneRte from './editor.mjs'
import MneRtePlugin from './plugin.mjs'

class MneRteEvents extends MneRtePlugin
{
  constructor(editor)
  {
    super(editor);
    this.inherid = [];
    
    this.editarea.ondragenter = ( evt ) => {return false; };
    this.editarea.ondragleave = ( evt ) => {return false; };
    this.editarea.ondragover  = ( evt ) => {return false; };
    this.editarea.ondrop      = ( evt ) => {return false; };

    this.editarea.addEventListener('click',   (evt) => { editor.clearNew();  } );
    this.editarea.addEventListener('keydown', (evt) => { editor.keydown(evt) } );
    
    this.editarea.addEventListener('paste', (evt, data) => editor.paste(evt, data) );
    this.editarea.addEventListener('copy',  (evt, data) => editor.copy(evt) );

    this.observer = new MutationObserver( (muts) => { this.observ(editor, muts) } );
    this.observer.observe(this.editarea, { childList: true, characterData: true, subtree : true, characterDataOldValue : true} )
  }
  
  keydown(evt)
  {
    this.undo_add();

    var p = window.getSelection().focusNode;
    if ( p.tagName != undefined && p.tagName != 'SPAN' )
    {
      var node = p.querySelector('SPAN');
      node.appendChild(document.createTextNode(''));
      this.moveCursor(node, true);
    }
  }
  
  paste(evt, data)
  {
    let paste;
    
    var sel = this.getSelection();
    var mneclipbord  = (evt.clipboardData || window.clipboardData).getData('mne-rte-clipboard');

    if ( mneclipbord != '' )
    {
      var div = document.createElement('div');

      div.innerHTML = (evt.clipboardData || window.clipboardData).getData('text');
      if ( div.firstChild && div.firstChild.tagName == "SPAN" )
      {
        this.splitInline(sel);
        while ( div.firstChild != null ) this.insertBefore(sel.startInline, div.firstChild);
        this.moveCursor(sel.startInline.previousSibling, false);
      }
      else
      {
        var blocks = this.splitBlock(sel);
        while( div.firstChild != null ) this.insertBefore(blocks[2], div.firstChild);
        this.moveCursor(Array.from(blocks[2].previousSibling.querySelectorAll('span')).pop(), false);
      }
    }
    else
    {
      this.splitInline(sel);
      var inline = this.newInline(null, sel, (evt.clipboardData || window.clipboardData).getData('text'));
      this.insertBefore(sel.startInline, inline);
      this.moveCursor(inline, true);
    }
    evt.preventDefault();
  }
  
  copy(evt)
  {
    var sel = this.getSelection();
    var str = '';
    if ( sel.startInline == sel.endInline )
    {
      str = '<span class="' + sel.startInline.className + '">' + sel.startContainer.data.substring(sel.startOffset, sel.endOffset) + '</span>';
    }
    else
      Array.from(this.getSelection().range.cloneContents().children).forEach((child) =>
      {
        str += ( child.tagName == 'LI' ) ? child.innerHTML : child.outerHTML;
      });

    evt.clipboardData.setData('text', str);
    evt.clipboardData.setData('mne-rte-clipboard', 'true');
    evt.preventDefault();
 }
  
  observ(editor, muts) 
  {
    muts.forEach(function(mut) {
      Array.from(mut.addedNodes).forEach((item) =>
      {
        switch(item.tagName)
        {
          case "DIV":
          {
            if ( item.className == '' )
            {
              item.className = editor.blockclass;
              item.innerHTML = '<span class="' + editor.inlineclass + '"></span>'
                editor.moveCursor(item.firstChild);
            }
            break;
          }
          
          case undefined:
          {
            if ( mut.target.tagName != 'SPAN' )
            {
              var node = item.nextSibling;
              while ( node != null && node.tagName != 'SPAN') node = node.nextSibling;
              if ( node != null )
              {
                node.insertBefore(item, node.firstChild);
                editor.moveCursor(item);
              }
              else
              {
                node = mut.target.closest('div');
                editor.newInline(node, ( node.lastChild != null ) ? node.lastChild.className : editor.inlineclass )
              }
            }
            var newele = editor.editarea.querySelectorAll('.newelement');
            newele.forEach((ele) => { if ( ele.textContent != '' ) MneElement.clearClass(ele, 'newelement')})
          }
        }
      })
    });    
    editor.clearEmpty();
  }
}

export default MneRteEvents

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/editor/basic.mjs
//================================================================================
'use strict';

import MneTheme    from '/js/basic/theme.mjs'
import MneElement from  '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

class MneRteBasic
{
  constructor()
  {
  }
  
  clearEmpty()
  {
    var sel = this.getSelection();

    this.editarea.querySelectorAll('span > br').forEach((item) =>
    {
      if ( item.parentNode == sel.focusInline )
        MneElement.mkClass(item, 'newelement');
    });

    var emptys = this.editarea.querySelectorAll('*:not(.newelement):not(.fixed):empty');
    while(emptys.length != 0 )
    {
      emptys.forEach((item) => { item.parentNode.removeChild(item) });
      emptys = this.editarea.querySelectorAll('*:not(.newelement):not(.fixed):empty');
    }
    
    if ( this.editarea.childNodes.length == 0 )
      this.moveCursor(this.newBlock(this.editarea).querySelector('span'), true);
  }

  clearNew()
  {
    this.editarea.querySelectorAll('.fixed').forEach((ele) => { MneElement.clearClass(ele, 'fixed'); });
    this.editarea.querySelectorAll('td > div:first-child > span:empty').forEach((ele) =>
    {
        MneElement.mkClass(ele, 'fixed', ele.parentNode.parentNode.innerText == '');
    });
    this.editarea.querySelectorAll('.newelement').forEach((ele) => { MneElement.clearClass(ele, 'newelement')});
    this.clearEmpty();
  }
  
  moveCursor(ele, begin = false )
  {
    if ( ! ele ) return;
    
    var r = document.createRange();
    r.selectNodeContents(ele);
    r.collapse(begin);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(r);
    this.editor.showAttr(r.endContainer)
  }

  moveCursorSelect(sel)
  {
    if ( sel == null ) return;

    var r = document.createRange();
    r.setStart(sel.startContainer, sel.startOffset);
    r.setEnd(sel.endContainer, sel.endOffset);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    this.editor.showAttr(this.getElement(r.endContainer))
  }

  getElement(element)
  {
    return (( element.nodeType == 3 ) ? element.parentNode : element);
  }

  getSelection()
  {
    var result = new Object;
    var wsel = window.getSelection();

    if ( typeof wsel == 'undefined' || wsel == null || wsel.rangeCount == 0 ) return null;
    
    var s = wsel.getRangeAt(0);

    result.range = s;
    result.startContainer = s.startContainer;
    result.startOffset = s.startOffset;

    s = wsel.getRangeAt(wsel.rangeCount - 1);
    result.endContainer = s.endContainer;
    result.endOffset = s.endOffset;

    if (result.startContainer.nodeType != 3 && result.startContainer == result.endContainer && (result.endOffset - result.startOffset) == 1)
      result.endOffset--;
    while (result.startContainer.nodeType != 3 && result.startContainer.lastChild && result.startContainer.childNodes.length == result.startOffset)
    {
      result.startContainer = result.startContainer.lastChild;
      if (result.startContainer.nodeType == 3)
        result.startOffset = result.startContainer.length;
      else
        result.startOffset = result.startContainer.childNodes.length;
    }

    while (result.startContainer.nodeType != 3 && result.startContainer.childNodes[result.startOffset] != null)
    {
      result.startContainer = result.startContainer.childNodes[result.startOffset];
      result.startOffset = 0;
    }

    while (result.endContainer.nodeType != 3 && result.endContainer.lastChild != null && result.endContainer.childNodes.length == result.endOffset)
    {
      result.endContainer = result.endContainer.lastChild;
      if (result.endContainer.nodeType == 3)
        result.endOffset = result.endContainer.length;
      else
        result.endOffset = result.endContainer.childNodes.length;
    }

    while (result.endContainer.nodeType != 3 && result.endContainer.childNodes[result.endOffset] != null)
    {
      result.endContainer = result.endContainer.childNodes[result.endOffset];
      if ( result.endContainer.nodeType == 3 ) result.endOffset = result.endContainer.length; else result.endOffset = ( result.endContainer.childNodes.length - 1);
    }

    if (s.endContainer == wsel.focusNode)
      result.focusNode = result.endContainer;
    else
      result.focusNode = result.startContainer;
    
    result.startInline = result.startContainer.parentNode;
    result.endInline   = result.endContainer.parentNode;
    result.focusInline = result.focusNode.parentNode;
    
    result.startBlock = result.startInline.closest('.mne-rte-editarea div:not(.mne-rte-editarea)');
    result.endBlock   = result.endInline.closest('.mne-rte-editarea div:not(.mne-rte-editarea)');
    result.focusBlock = result.focusInline.closest('.mne-rte-editarea div:not(.mne-rte-editarea)');

    return result;
  }

  clearInline()
  {
    this.editarea.querySelectorAll('span').forEach((item) => { item.className = item.className.replace(new RegExp(' *$|^ *', 'g'), '')} );
    this.editarea.querySelectorAll('div span:first-child').forEach((item) =>
    {
      var first = item;
      var second = item.nextSibling;
      while ( second != null )
      {
        if ( this.isequalInline(first, second) )
        {
          first.textContent = first.textContent + second.textContent;
          second.textContent = '';
        }
        else
        {
          first = second;
        }
        second = second.nextSibling;
      }
    });
    this.clearEmpty();
  }
  
  newInline(ele, cl, text = '')
  {
    var newele = document.createElement('span');
    newele.className = cl + ' newelement';
    newele.appendChild(document.createTextNode(text));
    
    if ( ele != null ) ele.appendChild(newele);
    return newele;
  }
  
  isequalInline(ele1, ele2)
  {
    var c1, c2;
    c1 = ( ele1.className == undefined) ? "" : ele1.className.replace(new RegExp(' *$|^ *', 'g'), '' );
    c2 = ( ele2.className == undefined) ? "" : ele2.className.replace(new RegExp(' *$|^ *', 'g'), '' );

    return (ele1 != null && ele2 != null && c1 == c2 );
  };

  setInlineAttr(node, end, attr, value, sel)
  {
    var i;
    if (node.tagName == "SPAN")
    {
      MneElement.mkClass(node, attr, value);
      if (node.previousSibling != null && node.previousSibling.tagName == "SPAN" && this.isequalInline(node.previousSibling, node))
      {
        node.firstChild.data = node.previousSibling.firstChild.data + node.firstChild.data;
        if (sel.startContainer == node.firstChild) sel.startOffset += node.previousSibling.firstChild.data.length;
        else if (sel.startContainer == node.previousSibling.firstChild) sel.startContainer = node.firstChild;
        if (sel.endContainer == node.firstChild) sel.endOffset += node.previousSibling.firstChild.data.length;
        node.previousSibling.parentNode.removeChild(node.previousSibling);
      }
    }
    else
    {
      for (i = node.firstChild; i != null; i = i.nextSibling)
      {
        if (this.setInlineAttr(i, end, attr, value, sel) == true) return true;
      }
    }
    return node.firstChild == end;
  };

  setInline(attr, value, sel )
  {
    var pre, end;
    var span;
    var c1, found;

    if (sel.startOffset != 0)
    {
      pre = sel.startContainer.data.substring(0, sel.startOffset);
      sel.startContainer.data = sel.startContainer.data.substring(sel.startOffset);
      if (pre != '')
      {
        span = this.newInline(null, sel.startContainer.parentNode.className, pre);
        this.insertBefore(sel.startContainer.parentNode, span);
      }
      if (sel.startContainer == sel.endContainer)
      {
        if (sel.endOffset == sel.startOffset)
        {
          span = this.newInline(null, ( value ) ? attr : '');
          this.insertBefore(sel.startContainer.parentNode, span);

          sel.startContainer = sel.endContainer = span;
          sel.startOffset = sel.endOffset = 0;
          this.moveCursorSelect(sel);
          return span;
        }
      }
      sel.endOffset -= sel.startOffset;
      sel.startOffset = 0;
    }

    if (sel.endOffset != 0)
    {
      end = sel.endContainer.data.substring(sel.endOffset);
      sel.endContainer.data = sel.endContainer.data.substring(0, sel.endOffset);
      if (end != '')
      {
        span = this.newInline(null, sel.endContainer.parentNode.className, end);
        this.insertAfter(sel.endContainer.parentNode, span);
      }
      sel.endOffset = sel.endContainer.data.length;
    }

    c1 = sel.startContainer.parentNode;
    found = false;
    while (found == false && c1 != this.editarea)
    {
      found = this.setInlineAttr(c1, sel.endContainer, attr, value, sel);
      if (c1.nextSibling != null) c1 = c1.nextSibling;
      else
      {
        while (c1.parentNode.nextSibling == null && c1 != this.editarea)
          c1 = c1.parentNode;
        if (c1 != this.editarea) c1 = c1.parentNode.nextSibling;
      }
    }

    if (sel.endContainer.parentNode.nextSibling != null && sel.endContainer.parentNode.nextSibling.tagName == "SPAN" && this.isequalInline(sel.endContainer.parentNode.nextSibling, sel.endContainer.parentNode))
    {
      sel.endContainer.data = sel.endContainer.data + sel.endContainer.parentNode.nextSibling.firstChild.data;
      sel.endContainer.parentNode.nextSibling.parentNode.removeChild(sel.endContainer.parentNode.nextSibling);
    }

    this.moveCursorSelect(sel);
  }
  
  splitInline(sel)
  {
     if ( sel == undefined ) return;
     var newinline = sel.startInline.cloneNode(false);
     newinline.textContent = sel.startContainer.textContent.substring(0, sel.startOffset);
     this.insertBefore(sel.startInline, newinline);
     sel.endInline.textContent = sel.endInline.textContent.substring(sel.endOffset); 
  }
  
  splitBlock(sel)
  {
    var newblock;
    var newinline;
    var select;
    var retval = [null,[],null];
    
    if ( sel == undefined ) return retval;

    select = sel.range.cloneContents();
    
    if ( sel.startBlock == sel.endBlock )
    {
      newblock = sel.startBlock.cloneNode(false);
      newinline = this.newInline(newblock, sel.startInline.className );
      newinline.textContent = sel.startContainer.textContent.substring(0, sel.startOffset);
      while(sel.startInline.previousSibling != null ) this.insertBefore(newinline, sel.startInline.previousSibling);
      this.insertBefore( sel.startBlock, newblock );
      retval[0] = newblock;

      sel.startContainer.textContent = sel.startContainer.textContent.substring(sel.endOffset);
      MneElement.mkClass(sel.startInline, 'newelement');
      retval[2] = sel.startBlock;

      newblock = undefined;
      newinline = undefined;
      Array.from(select.childNodes).forEach((item) =>
      {
        if ( newblock == undefined ) retval[1].push((newblock = sel.startBlock.cloneNode(false)))
        if ( item.tagName == undefined )
        {
          if ( newinline == undefined ) newblock.appendChild((newinline = sel.startInline.cloneNode(false)));
          newinline.appendChild(item);
        }
        else
        {
          newblock.appendChild(item);
        }
      });
    }
    else
    {
      retval[0] = sel.startBlock;
      retval[2] = sel.endBlock;
      
      Array.from(select.childNodes).forEach((item) =>
      {
        if ( item.matches(this.editor.getBlockQuery()) )
          retval[1].push(item.cloneNode(true));
        else if ( item.matches('span') )
        {
          var block = sel.startBlock.clone(false);
          block.appendChild(item);
          retval[1].push(this.newBlock(null))
        }
        else 
          item.querySelectorAll(this.editor.getBlockQuery()).forEach((block) => { retval[1].push(block.cloneNode(true));} );
      });

      sel.range.deleteContents();
    }
    
    return retval;
  }

  newBlock(ele, sel)
  {
    var bclass = this.blockclass;
    var iclass = this.inlineclass;
    var newblock,newinline;
    
    if ( sel )
    {
      bclass = sel.focusBlock.className;
      iclass = sel.focusInline.className;
    }
    
    newblock = document.createElement('div');
    newblock.className = bclass;
    this.newInline(newblock, iclass)

    if ( ele != null ) ele.appendChild(newblock);
    return newblock;
  }
  
  insertAfter(node, newnode)
  {
    if ( node.nextSibling != null ) node.parentNode.insertBefore(newnode, node.nextSibling );
    else node.parentNode.appendChild(newnode);
  };
  
  insertBefore(node, newnode)
  {
    node.parentNode.insertBefore(newnode, node );
  };

}

export default MneRteBasic

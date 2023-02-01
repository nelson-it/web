//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/basic/element.mjs
//================================================================================
'use strict';
import MneTheme from './theme.mjs'

export class MneElement
{
  static mkClass(node, name, value, clear_name)
  {
    if ( node.nodeType == 3 ) return;
    
    if ( clear_name )
      MneElement.mkClass(node, clear_name + '[0-9,a-z,A-Z,_,\-]*', false);

    if ( value !== false )
    {
      if ( typeof node.className == 'undefined' )
        node.className = name;
      else if (  ! MneElement.hasClass(node, name) ) 
        node.className = node.className + " " + name;
    }
    else if ( node.className )
    {
      node.className = node.className.replace(new RegExp('^' + name + ' +| +' + name +' +| +' + name + '$|^' + name + '$', 'g'), ' ' ); 
      node.className = node.className.replace(new RegExp(' +', 'g'), ' ' ); 
    }
    node.className = node.className.replace(new RegExp(' *$|^ *', 'g'), '' ); 
  }
  
  static clearClass(node, name)
  {
    MneElement.mkClass(node, name, false )
  }

  static clearClassAll(node, name)
  {
    MneElement.mkClass(node,  name + '[0-9,a-z,A-Z,_,\-]*', false )
  }
  
  static hasClass(node, name )
  {
    return node && ( new RegExp('^' + name + ' +| +' + name +' +| +' + name + '$|^' + name + '$')).test(node.className);
  }
  
  static getLeft(obj, parent)
  {
    var oval = 0;
    var pval = 0;

    try { while ( obj ) { oval += ( obj.offsetLeft - obj.scrollLeft ); obj = obj.offsetParent; } } catch (e ) {}; 
    try { while ( parent ) { pval += ( parent.offsetLeft - parent.scrollLeft ); parent = parent.offsetParent; } } catch (e ) {}; 

    return oval - pval;

  }

  static getTop (obj, parent )
  {
    var oval = 0;
    var pval = 0;

    try { while ( obj    ) { oval += ( obj.offsetTop - obj.scrollTop ); obj = obj.offsetParent; } } catch (e ) {}; 
    try { while ( parent ) { pval += ( parent.offsetTop - parent.scrollTop ); parent = parent.offsetParent; } } catch (e ) {}; 

    return oval - pval;
  }

  static getWidth( obj )
  {
    if ( ! obj || ! obj.offsetWidth ) return 0;
    return obj.offsetWidth;
  }

  static getHeight( obj )
  {
    if ( ! obj || ! obj.offsetHeight ) return 0;
    return obj.offsetHeight;
  }
  
  static getRight(obj)
  {
    return MneElement.getLeft(obj) + MneElement.getWidth(obj);
  }
  
  static getBottom(obj)
  {
    return MneElement.getTop(obj) + MneElement.getHeight(obj);
  }
  
  /*
  static setTop(obj, ref, parent )
  {
    obj.style.top = MneElement.getTop(ref, parent )
  }
  */
  static insertAfter( neu, node)
  {
    if ( node.nextSibling == null ) node.parentNode.appendChild(neu);
    else node.parentNode.insertBefore(neu, node.nextSibling);
  }
  
  static getEditor(str)
  {
    return '<span class="ele-wrapper contain-span contain-editor">' + str + '</span>';
  }

  static getSpan(str)
  {
    return '<span class="ele-wrapper contain-span">' + str + '</span>';
  }

  static getInput(type, str)
  {
    switch(type)
    {
      case 'password':
      case 'text':
        return '<div class="ele-wrapper input-wrapper contain-text">' + str + '</div>'
        break;

      case 'checkbox':
        return '<div class="ele-wrapper input-wrapper contain-checkbox">' + str + '<label onclick="var ele = this.previousSibling; ele.checked=!ele.checked; ele.setAttribute(\'checked\', ele.checked)"></label></div>';
        break;

      case 'file':
          return '<span class="ele-wrapper contain-span contain-file">' + str + '<label><input type="file"/></label></span>'
        break;
      default:
        return str;
    }
  }
  
  static getSelect(str)
  {
    return '<div class="ele-wrapper input-wrapper contain-select">' + str + '</div>' 
  }

}

export default MneElement

// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: js/basic/element.mjs
//================================================================================
'use strict';
import MneTheme from './theme.mjs'

MneTheme.loadCss('element.css');

export class MneElement
{
  static mkClass(node, name, value, clear_name)
  {
    if ( node.nodeType == 3 ) return;
    
    if ( clear_name )
      MneElement.mkClass(node, clear_name + '[a-z,A-Z,_,\-]*', false);

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
      node.className = node.className.replace(new RegExp(' *$|^ *', 'g'), '' ); 
      node.className = node.className.replace(new RegExp(' +', 'g'), ' ' ); 
    }
  }
  
  static clearClass(node, name)
  {
    MneElement.mkClass(node, name, false )
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

    try { while ( obj ) { oval += ( obj.offsetTop - obj.scrollTop ); obj = obj.offsetParent; } } catch (e ) {}; 
    try { while ( prt ) { pval += ( parent.offsetTop - parent.scrollTop ); parent = parent.offsetParent; } } catch (e ) {}; 

    return oval - pval;
  };

  static getWidth( obj )
  {
    if ( ! obj || ! obj.offsetWidth ) return 0;
    return obj.offsetWidth;
  };

  static getHeight( obj )
  {
    if ( ! obj || ! obj.offsetHeight ) return 0;
    return obj.offsetHeight;
  };
  
  static insertAfter( neu, node)
  {
    if ( node.nextSibling == null ) node.parentNode.appendChild(neu);
    else node.parentNode.insertBefore(neu, node.nextSibling);
  };

  static mkElements( frame )
  {
    MneElement.mkSelects(frame);
    MneElement.mkInputs(frame);
    MneElement.mkSpans(frame);
    MneElement.mkTextareas(frame);
  }

  static mkSelects( frame )
  {
    var i;
    var obj = frame.querySelectorAll('select');

    for ( i=0; i<obj.length; ++i )
      MneElement.mkSelectsSingle(obj[i]);
  }

  static mkInputs( frame )
  {
    var i;
    var obj = frame.querySelectorAll('input');

    for ( i=0; i<obj.length; ++i )
        MneElement.mkInputsSingle(obj[i]);
  }

  static mkSpans( frame )
  {
    var i;
    var obj = frame.querySelectorAll('span');

    for ( i=0; i<obj.length; ++i )
        MneElement.mkSpansSingle(obj[i]);
  }

  static mkTextareas( frame )
  {
    var i;
    var obj = frame.querySelectorAll('textarea');

    for ( i=0; i<obj.length; ++i )
      MneElements.mkTextareasSingle(obj[i]);
  }

  static mkSelectsSingle( obj )
  {
      if ( typeof obj.wrapper == 'undefined'  ) 
      {
        var ele = document.createElement('div');
        ele.className = 'ele-wrapper input-wrapper contain-select';
        if ( obj.parentNode ) obj.parentNode.insertBefore(ele, obj.nextSibling);
        ele.appendChild(obj);
        obj.wrapper = ele;
        obj.cleared = true;
      }
  }

  static mkInputsSingle( ele )
  {
      if ( typeof ele.wrapper != 'undefined' )
        return;
      
      switch(ele.type)
      {
        case 'password':
        case 'text':
          var wrapper = document.createElement('div');
          wrapper.className = 'ele-wrapper input-wrapper contain-text';
          if ( ele.parentNode ) ele.parentNode.insertBefore(wrapper, ele.nextSibling);
          wrapper.appendChild(ele);
          if ( ele.type == 'text' ) ele.type = "text";
          ele.wrapper = wrapper;
          ele.valuefield = ele;
          break;

        case 'checkbox':
          var wrapper = document.createElement('div');
          wrapper.className = 'ele-wrapper input-wrapper contain-checkbox';
          if ( ele.parentNode ) ele.parentNode.insertBefore(wrapper, ele.nextSibling);
          wrapper.appendChild(ele)
          wrapper.appendChild(document.createElement('label'))
          wrapper.lastChild.addEventListener('click', function(evt) { var ele = this.previousSibling; ele.checked=!ele.checked; ele.setAttribute('checked', ele.checked)})

          wrapper.firstChild.wrapper = wrapper;
          wrapper.firstChild.valuefield = wrapper.firstChild;
          break;

        default:
          ele.wrapper = ele;
          break;
      }
  }
  
  static mkSpansSingle( ele )
  {
    ele.cleared = false;
    if ( ele.wrapper == undefined )
    {
      ele.wrapper = ele;
      MneElement.mkClass(ele, 'ele-wrapper contain-span');
    }
  }

  static mkTextareasSingle( obj )
  {
      if ( typeof obj.wrapper == 'undefined'  ) 
      {
        var ele = document.createElement('div');
        ele.className = 'ele-wrapper textarea-wrapper contain-textarea';
        if ( obj.parentNode ) obj.parentNode.insertBefore(ele, obj.nextSibling);
        ele.appendChild(obj);
        obj.wrapper = ele;
        obj.cleared = true;
      }
  }
}

export default MneElement

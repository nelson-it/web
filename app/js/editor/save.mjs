//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/editor/save.mjs
//================================================================================
'use strict';

import MneTheme    from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneRte from './editor.mjs'
import MneRtePlugin from './plugin.mjs'

class MneRteSave extends MneRtePlugin
{
  constructor(editor)
  {
    super(editor);
    this.inherid = [];

    editor.undoit = new Array();
    editor.undonum = -1;
    
    this.buttonnames = ( editor.config.output ) ?  [ 'save', 'undo', 'redo' ] : [  'undo', 'redo' ];
    this.help = 
    {
        save : "#mne_lang#Sichern",
        undo : "#mne_lang#Änderung rückgängig machen",
        redo : "#mne_lang#Änderung wieder herstellen",
    }
  } 

  setValue(str)
  {
    if ( str == undefined ) return;
    this.editarea.innerHTML = str;
    if ( str == '' ) this.newBlock(this.editarea);
    this.editor.plugins.forEach( (item) => { item.setValue(); });
    this.moveCursor(Array.from(this.editarea.lastChild.querySelectorAll('span')).pop());
  }

  getValue(plain)
  {
    if ( plain || this.editor.plain )
      return this.editarea.innerHTML.replace(/ *newelement */g, ' ')
                                    .replace(/ *mne-rte-active */g, ' ')
                                    .replace(/class="([^"]*)"/g, (match, p1) => { return 'class="' + p1.trim() + '"'; })
                                    .replace(/<br[^>]*>/g, '');
    else
      return this.save_xml("", this.editarea);
  }

  undo_add(sel)
  {
    var u = new Object;
    var s;
    var obj, objnum;
    var html;
    var i;

    try 
    {
      this.undo_need = false;
      if ( typeof sel == 'undefined' ) s = this.getSelection(); else s = sel;

      html = this.editarea.innerHTML;
      u.html = html;

      if (  this.undonum >= 0 && this.undoit[this.undonum].html == html ) return false;

      if ( this.undonum != this.undoit.length-1 )
        for ( i=this.undoit.length-2; i >= this.undonum; i-- ) this.undoit[this.undoit.length] = this.undoit[i];
      this.undonum = this.undoit.length - 1;

      if ( s != null )
      {
        try
        {
          obj = s.startContainer;
          objnum = new Array();

          while ( obj != this.editarea )
          {
            var i;
            for ( i=0; i<obj.parentNode.childNodes.length; i++ ) if ( obj == obj.parentNode.childNodes[i] ) break;
            objnum[objnum.length] = i;
            obj = obj.parentNode;
          }

          u.start = objnum;
          u.startOffset = s.startOffset;

          obj = s.endContainer;
          objnum = new Array();

          while ( obj != this.editarea )
          {
            var i;
            for ( i=0; i<obj.parentNode.childNodes.length; i++ ) if ( obj == obj.parentNode.childNodes[i] ) break;
            objnum[objnum.length] = i;
            obj = obj.parentNode;
          }

          u.end = objnum;
          u.endOffset = s.endOffset;
        }
        catch(e)
        {
          u.start = u.end = null;
        }
      }
      else
      {

        u.start = u.end = null;
      }

      this.undonum++;
      this.undoit[this.undonum] = u;
      return true;
    }
    catch(e)
    {
      console.log(e.message + "\n" + e.stack);
    }
  }

  undo_setCursor(ele)
  {
    var i;
    var obj;
    var sel = new Object;

    if ( ele.start == null ) return;

    try { 
      obj = this.editarea;
      for ( i=ele.start.length -1; i>=0; i-- )
      { obj = obj.childNodes[ele.start[i]];}

      sel.startContainer = obj;
      sel.startOffset = ele.startOffset;

      obj = this.editarea;
      for ( i=ele.end.length -1; i>=0; i-- )
      { obj = obj.childNodes[ele.end[i]]; }

      sel.endContainer = obj;
      sel.endOffset = ele.endOffset;
      this.moveCursorSelect(sel);
    } catch(e) { console.log("#mne_lang#kann Cursor nach undo nicht setzen" + "\n" + e.message + " " + e.stack); }

  };

  undo_undo()
  {
    if ( this.undoit.length == 0 ) return;

    if ( this.undonum > 0 )
    {
      this.undonum--;
      this.editarea.innerHTML = this.undoit[this.undonum].html;
      if ( this.undoit[this.undonum].start != null )
        this.undo_setCursor(this.undoit[this.undonum]);
    }
  }

  undo_redo()
  {
    if ( this.undonum + 1 < this.undoit.length )
    {
      this.undonum++;
      this.editarea.innerHTML = this.undoit[this.undonum].html;
      this.undo_setCursor(this.undoit[this.undonum]);
      this.buttons.setModify(true);
    }
  }
  
  save_xml(iv, parent)
  {
    var i,j;
  var tag;
  var str;
  var endtag;
  var v = iv;
  
  for ( i=0; i<parent.childNodes.length; i++ )
  {
    tag = parent.childNodes[i];
    endtag = "";
    
    switch(tag.tagName)
    {
      case "SPAN":
      str = "<text";
      if ( tag.className.indexOf("mne_bold") >= 0  ) str += ' weight="bold"';
      if ( tag.className.indexOf("mne_italic") >=0 ) str += ' style="italic"';
          if ( tag.className.indexOf("mne_font")   >= 0 ) str = str + ' size="' + tag.className.match(/mne_font[^ ]*/).toString().substr(8) + '"'; else str += ' size="n"';
      str += ">";
      
      var t = tag.textContent;
          t = t.replace(/>/g, "&gt;");
          t = t.replace(/</g, "&lt;");
      
      v = v + str + t + "</text>";
      break;
      
     case "DIV":
          str = "<part";
          if ( tag.className.indexOf("mne_alignc") >= 0 ) str += ' align="center"';
          if ( tag.className.indexOf("mne_alignr") >= 0 ) str += ' align="right"';
          if ( tag.className.indexOf("mne_alignl") >= 0 ) str += ' align="left"';
      str += ">";
      v = v + str;
      endtag = "</part>";
      break;
      
     case "UL":
       v = v + "<itemize>";
     endtag = "</itemize>";
     break;

     case "OL":
       v = v + "<enumerate>";
     endtag = "</enumerate>";
     break;

     case "LI":
       v = v + "<item>";
     endtag = "</item>";
     break;

     case "TABLE":
       str = "<table";
         if ( tag.className.indexOf("mne_border") >= 0 ) str += ' border="1"'; else str += ' border="0"';
         if ( tag.className.indexOf("mne_padding") >= 0 ) str += ' padding="1"'; else str += ' padding="0"';
         if ( tag.className.indexOf("mne_alignc") >= 0 ) str += ' align="center"';
         if ( tag.className.indexOf("mne_alignr") >= 0 ) str += ' align="right"';
         if ( tag.className.indexOf("mne_alignl") >= 0 ) str += ' align="left"';

         str += ">";
          v = v + str;

     endtag = "</table>";
     break;
     case "TR":
       v = v + "<tr>";
     endtag = "</tr>";
     break;
     
     case "TD":
       {
       var w;
       str = "<td";
       if ( tag.getAttribute('aria-relwidth')) str += ' relwidth="' + tag.getAttribute('aria-relwidth') + '"';
       if ( tag.className.indexOf("mne_padding") >= 0 ) str += ' padding="1"'; else str += ' padding="0"';
       if ( tag.className.indexOf("mne_valignt") >= 0 ) str += ' valign="top"';
       if ( tag.className.indexOf("mne_valignm") >= 0 ) str += ' valign="middle"';
       if ( tag.className.indexOf("mne_valignb") >= 0 ) str += ' valign="bottom"';
       str += ">";
       v = v + str;
     endtag = "</td>";
     break;
       }
    }
    
    if ( tag.tagName != "SPAN" ) v = this.save_xml(v, tag) + endtag;
    }
  return v;
  };
  
  save ()
  {
    if ( ! this.editor.config.output ) return;

    this.clearInline();
    this.editor.output.value = this.save_xml("", this.editarea);
  }

  undo(sel)
  {
    this.editor.undo_undo(sel);
  }

  redo(sel)
  {
    this.editor.undo_redo(sel);
  }

}

export default MneRteSave

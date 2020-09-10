//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/editor/text.mjs
//================================================================================
'use strict';

import MneTheme    from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneRtePlugin from './plugin.mjs'

class MneRteText extends MneRtePlugin
{
  constructor(editor)
  {
    super(editor);

    this.buttonnames = [ 'font,xxs,xs,s,n,l,xl,xxl', 'bold', 'italic' ];
    this.help = 
    {
        bold        : "#mne_lang#Text fett schreiben",
        italic      : "#mne_lang#Text kursiv schreiben",
        font        : "normal,sehr klein,klein,schmal,normal,gross,sehr gross,extra gross",
    }
    this.classes = { bold : 'mne_bold', italic : 'mne_italic', font : 'mne_font' };

    this.editarea.addEventListener('click', (evt) => { this.showAttr( this.getSelection().focusInline ); } );
    this.editarea.addEventListener('keyup', (evt) => { this.showAttr( this.getSelection().focusInline ); })
    
    editor.inlineclass = this.classes.font + 'n';
  } 

  showAttr(element)
  {
    if ( element.tagName == 'SPAN' )
    {
      var i;
      for ( i in this.buttons )
      {
        if ( this.buttons[i].tagName == 'DIV') 
        {
          MneElement.mkClass(this.buttons[i], 'active', MneElement.hasClass(element, this.classes[i]));
        }
        else
        {
          var start = element.className.indexOf(this.classes[i]) + this.classes[i].length;
          var end;
          if ( start != -1 ) this.buttons[i].value = element.className.substring(start, (( end = element.className.indexOf(' ', start)) == -1 ) ? undefined : end).trim();
        }
      }
    }
  }

  setAttr(button, id, selection)
  {
    if ( selection == undefined ) return;
    
    var active = ! MneElement.hasClass(button, 'active');
    MneElement.mkClass(button, 'active', active);
    this.setInline(this.classes[id], active, selection);
  }

  bold(selection)
  {
    this.setAttr(this.buttons.bold, 'bold', selection);
  }

  italic(selection)
  {
    this.setAttr(this.buttons.italic, 'italic', selection);
  }

  font(selection)
  {
    var font = this.classes['font'] + this.buttons.font.value;
    this.setInline(this.classes['font'] + '[a-z,A-Z,_,\-]*', false, selection)
    this.setInline(font, true, this.getSelection())
  }
}

export default MneRteText

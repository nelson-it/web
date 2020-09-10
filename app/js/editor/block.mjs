//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/editor/block.mjs
//================================================================================
'use strict';

import MneTheme    from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneRte from './editor.mjs'
import MneRtePlugin from './plugin.mjs'

class MneRteBlock extends MneRtePlugin
{
  constructor(editor)
  {
    super(editor);

    this.buttonnames = [ 'alignl', 'alignr', 'alignc' ]
    this.help = 
    {
        alignl : "#mne_lang#Abschnitt links justiert formatieren",
        alignr : "#mne_lang#Abschnitt rechts justiert formatieren",
        alignc : "#mne_lang#Abschitt zentrieren"
    }
    this.classes = {  align : 'mne_align', alignl : 'mne_alignl', alignr : 'mne_alignr', alignc : 'mne_alignc' };
    this.keypressType = {};
    this.keypressQuery = '';

    this.blockquery = 'div, table';
    this.blockclosest = '.mne-rte-editarea div, .mne-rte-editarea table';

    this.returncount = 0;
    this.act_block = null;
    
    this.editarea.addEventListener('click', (evt) => { this.returncount = 0; this.showAttr(this.getSelection().focusBlock)} );
    this.editarea.addEventListener('keyup', (evt) =>
    {
      switch(evt.key)
      {
        case "Escape":
          this.act_block = (( this.act_block == null ) ? this.getSelection().focusBlock : this.act_block).parentNode.closest(this.blockclosest);
          this.showAttr(this.act_block);
          break;
        default:
          this.showAttr( this.getSelection().focusBlock );
        break;
      }
    });
    
    this.editarea.addEventListener('keypress', (evt) =>
    {
      var b;
      var notcancel = true;
      var sel = this.getSelection();

      this.returncount = ( evt.key == 'Enter' && evt.shiftKey == false  ) ? ++this.returncount : 0;
      
      if ( ( b = sel.focusBlock.closest(this.keypressQuery)) != null && this.keypressType[b.tagName] != undefined )
        notcancel = this.keypressType[b.tagName].keypress(evt, this.returncount);

      if ( notcancel === true )
        this.keypress(evt);

    }, true);
    
    editor.blockclass = this.classes.align + 'j';
    editor.getBlockQuery = () => { return this.blockquery; };
    editor.addKeypressType = (typ, obj) => { this.addKeypressType(typ, obj) };
  } 

  keypress(evt)
  {
    switch(evt.key)
    {
      case "Enter":
        this.splitBlock(this.getSelection());
        evt.stopImmediatePropagation();
        evt.preventDefault();
        break;
      default:
        break;
    }
  }


  addKeypressType(typ, obj)
  {
    this.keypressType[typ]  = obj;
    this.keypressQuery = this.keypressQuery + (( this.keypressQuery != '' ) ? ',' : '' ) + '.mne-rte-editarea ' + typ;
  }
  
  showAttr(element) 
  {
    var i;
    if ( element == null ) return;
    
    this.editarea.querySelectorAll('.mne-rte-active').forEach((item) => { MneElement.clearClass(item, 'mne-rte-active'); } );
    MneElement.mkClass(element, 'mne-rte-active');
    
    for ( i in this.buttons )
    {
      if ( this.buttons[i].tagName == 'DIV') 
        MneElement.mkClass(this.buttons[i], 'active', MneElement.hasClass(element, this.classes[i]));
    }
  }

  setAttr(id, selection)
  {
    var i, active;
    var element = ( this.act_block == null ) ? selection.focusBlock : this.act_block;

    active = MneElement.hasClass(element, this.classes[id]);
    MneElement.mkClass(element, this.classes['align'] + '[a-z,A-Z,_,\-]*', false );
    MneElement.mkClass(element, ( active ) ? this.classes['align'] + 'j' : this.classes[id], true);
    
    this.moveCursorSelect(selection)
    this.act_block = null;
  }

  alignl(selection)
  {
    this.setAttr('alignl', selection)
  }

  alignr(selection)
  {
    this.setAttr('alignr', selection)
  }

  alignc(selection)
  {

    this.setAttr('alignc', selection)
  }
}

export default MneRteBlock

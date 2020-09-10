//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/editor/plugin.mjs
//================================================================================
'use strict';

import MneRteBasic from './basic.mjs'

class MneRtePlugin extends MneRteBasic
{
  constructor(editor)
  {
    super(editor);
    
    this.editor = editor;
    this.editarea = editor.editarea;
    
    this.buttonnames = [];
    this.buttons = {};
    this.help = {}
    this.classes = {};
  } 
  
  showAttr(element)
  {
  }
  
  setValue()
  {
  }
}

export default MneRtePlugin

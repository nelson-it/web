//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/editor/editor.mjs
//================================================================================
'use strict';

import MneTheme    from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'


import MneRteBasic  from './basic.mjs'
import MneRteEvents from './events.mjs'
import MneRteSave   from './save.mjs'
import MneRteText   from './text.mjs'
import MneRteBlock  from './block.mjs'
import MneRteList   from './list.mjs'
import MneRteTable  from './table.mjs'

class MneRte extends MneRteBasic
{
    constructor( config = {}, initpar = {} )
    {
      super();
      
      document.execCommand = function() { console.log('execCommand')}
      this.initpar = JSON.parse(JSON.stringify(initpar));
      this.config = Object.assign({}, config);
      this.plugins = [];
      this.editor = this;
      
      MneTheme.loadCss('editor.css');
      
      this.frame = this.config.frame;
      MneElement.mkClass(this.frame, 'mne-rte');
      if ( this.config.buttonframe )
      {
        this.buttonframe = this.config.buttonframe;
        this.frame.innerHTML = '<div class="mne-rte-editarea"><div class="mne_justify</div>';
        this.editarea = this.frame.firstChild;
      }
      else
      {
        this.frame.innerHTML = '<div class="mne-rte-buttonframe"></div><div class="mne-rte-editarea"></div>';
        this.buttonframe = this.frame.firstChild; 
        this.editarea = this.frame.lastChild; 
      }

      this.editarea.contentEditable = true;
      
      this.add_plugin(MneRteSave);
      this.add_plugin(MneRteEvents);
      this.add_plugin(MneRteText);
      this.add_plugin(MneRteBlock);
      this.add_plugin(MneRteList);
      this.add_plugin(MneRteTable);
      
      this.mkButtons();
    }
    
    showAttr(element)
    {
      if ( element ) this.plugins.forEach((item) => { item.showAttr(element) });
    }
    
    add_plugin(Plugin)
    {

      var plugin = new Plugin(this);
      this.plugins.push(plugin);
      
      let copyProps = (target, source) =>
      {
          Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source)).forEach((prop) =>
          {
              if (prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/))
                  return;

              if ( plugin.inherid.length > 0 && ! plugin.inherid[prop] )
                  return;
              
             Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop))
          })
      }
      
      if ( plugin.inherid ) copyProps(MneRte.prototype, Plugin.prototype);
      
    }

    
    mkButtons()
    {
      var str = '';
      
      this.plugins.forEach((plugin, index) =>
      {
        if ( plugin.buttonnames.length == 0 ) return;
        
        str += '<div class="mne-rte-buttongroup">'
        plugin.buttonnames.forEach((name) =>
        {
          name = name.split(',');
          var item = name[0];
          if ( name.length > 1 )
          {
            var s = '<select aria-click="' + item + '" aria-plugin="' + index + '" class="' + item + '">';
            var h = plugin.help[item].split(',')
            for ( var i=1; i<name.length; ++i)
              s += '<option value="' + name[i] + '"' + (( h[0] == h[i] ) ? "selected" : "" ) + '>' + h[i] + '</option>';
            s += '</select>';

            str += MneElement.getSelect(s)
          }
          else
            str += '<div aria-click="' + item + '" aria-plugin="' + index + '" class=" mne-rte-button ' + item + '"><div class="mne-rte-hint">' + plugin.help[item] + '</div></div>'
        });
        str += '</div>'
      });

      this.buttonframe.innerHTML = str;
      var buttons = this.buttonframe.querySelectorAll('div.mne-rte-button:not(.seperator), select')

      Array.from(buttons).forEach((item,index) =>
      {
        this.plugins[item.getAttribute('aria-plugin')].buttons[item.getAttribute('aria-click')] = item;
        item.addEventListener('mousedown', () => { this.act_selection = this.getSelection() });
        item.addEventListener('click', () =>
        {
          var clickid = item.getAttribute('aria-click');
          if ( clickid != 'undo' && clickid != 'redo' ) this.undo_add(this.act_selection);
          this.plugins[item.getAttribute('aria-plugin')][clickid](this.act_selection)
        });
      })
    }
}

export default MneRte;

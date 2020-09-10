//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/message.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneView    from './view.mjs'

class MneMessage extends MneView
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      super(parent, frame, id, Object.assign(initpar, { notitle : true, nowebletframe : true }), config )
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    getCssPath() { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }
    
    reset()
    {
      super.reset();
      
      this.config.label = MneText.getText("#mne_lang#Meldungen");
      this.obj.mkbuttons = [];
    }

    async load()
    {
      var self = this;
      
      await super.load();
      this.obj.buttons.clear.value = MneText.getText('#mne_lang#Löschen');

      MneLog.setMessageClient(this);
      document.addEventListener('keyup', (evt) => { if ( evt.key == 'Escape') { self.clear(); self.close();} })
    }

    async clear(evt)
    {
      this.obj.container.meldungen.innerHTML = '';
      return false;
    }
    
    print(typ, str, notimestamp)
    {
      var i;
      var meldungen = str.toString().split('\n');
      var ntsframe = document.createElement('div');
      
      ntsframe.className = 'print_ntsframe';
      for ( i=meldungen.length; i>0; )
      { 
        i--;

        var text = document.createElement("div");
        if ( i == 0 )
        {
          text.className = "print_row print_" + typ;
          text.innerHTML = '<div class="print_timestamp">' + ( ( notimestamp != true ) ? MneText.getTimestamp() : "" ) + '</div><div id="text" class="print_text" ></div>';
          text.querySelector('#text').textContent = meldungen[i];
          this.obj.container.meldungen.insertBefore(text, this.obj.container.meldungen.firstChild);
          text.lastChild.appendChild(ntsframe);
          text.ntsframe = ntsframe;
          text.popup = this.popup;
          text.style.cursor = 'pointer';
          text.onclick = function() { MneElement.mkClass(this.ntsframe, 'print_ntsframe_show', ! MneElement.hasClass(this.ntsframe,'print_ntsframe_show')); };
        }
        else
          {
          text.appendChild(document.createElement('div'));
          text.lastChild.textContent = meldungen[i];
          ntsframe.insertBefore(text, ntsframe.firstChild);
          }
      }
      this.show();
    }
    
    line(str)    { this.print('line', str, true); }
    message(str) { this.print('message', str); }
    warning(str) { this.print('warning', str)} 
    error(str)   { this.print('error', str) }

    exception(info, e)
    {
      var message = info + ': ';
      message += ( typeof e == 'string' ) ? e : e.message;
      if ( e != undefined && e.stack != undefined ) message += "\n" + e.stack;
      this.error(message);
    }
 }

export default MneMessage;

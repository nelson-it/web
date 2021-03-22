//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/etc/color.mjs
//================================================================================
'use strict';

import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'
import MneMutex    from '/js/basic/mutex.mjs'

import MneElement from '/weblet/basic/element.mjs'
import MneView    from '/weblet/basic/view.mjs'


class MneDialog extends MneView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      nowebletframe : true,
      hinput : false,
    };

    var frame = document.createElement('div');
    frame.className = 'modal';
    document.body.appendChild(frame);
    
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  reset()
  {
    super.reset();
    MneElement.mkClass(this.frame, 'modal');
  }

  async load()
  {
    await super.load();

    this.obj.buttons.ok.addEventListener('click', () => { if ( this.obj.unlock ) { this.obj.value = this.obj.inputs.value.getValue(); this.obj.unlock(); } });
    this.obj.buttons.cancel.addEventListener('click', () => { if ( this.obj.unlock ) { this.obj.value = null; this.obj.unlock(); } });
    this.obj.inputs.value.addEventListener('keypress', (evt) => { if ( evt.key == 'Enter' && this.obj.unlock ) { this.obj.value = this.obj.inputs.value.getValue(); this.obj.unlock(); } });

    if ( this.initpar.label ) this.obj.labels.value.setValue(this.initpar.label);
    if ( this.initpar.passwd ) this.obj.inputs.value.type = 'password';
  }
  
  getViewPath() { return this.getView(import.meta.url) }
  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  async prompt( title, value )
  {
    MneElement.mkClass(this.frame, "display");
    
    if ( title != undefined ) this.title = title;
    this.obj.inputs.value.setValue( value ?? '' );
    this.obj.inputs.value.focus();
    
    var mutex = new MneMutex();
    this.obj.unlock = await mutex.lock();
    await mutex.lock();

    this.obj.unlock = undefined;
    MneElement.clearClass(this.frame, "display");

    return this.obj.value;
  }

  async cancel()
  {
    return false;
  }

  async ok()
  {
    return false;
  }
  
  async enter()
  {
    return false;
  }
  
  async values()
  {
  }
}

export default MneDialog;

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/etc/selectdate.mjs
//================================================================================
'use strict';

import MneConfig   from '/js/basic/config.mjs'
import MneText     from '/js/basic/text.mjs'
import MneInput    from '/js/basic/input.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneElement from '/weblet/basic/element.mjs'
import MneView  from '/weblet/basic/view.mjs'

class MneAllgSelectDate extends MneView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      notitleframe : true,
      hinput : false
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getViewPath() { return this.getView(import.meta.url) }
  //getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }
  
  reset()
  {
    super.reset();
    this.obj.mkbuttons = [];
  }
  
  async load()
  {
    await super.load();
    this.obj.inputs.day.setTyp('long', MneInput.checktype.ok, '');
    this.obj.inputs.month.setTyp('long', MneInput.checktype.ok, '');
    this.obj.inputs.year.setTyp('long', MneInput.checktype.ok, '');
    this.obj.inputs.month.addEventListener('change', (evt) => { this.btnClick('month', this.obj.inputs.month, evt)});
  }
  
  async month()
  {
    this.obj.date = new Date(this.obj.inputs.year.getValue(), this.obj.inputs.month.getValue(), this.obj.inputs.day.getValue());
    if ( this.obj.date.getTime() < Date.now() )
      d = new Date(this.obj.inputs.year.getValue() + 1, this.obj.inputs.month.getValue());
    
    this.obj.inputs.day.setValue(this.obj.date.getDate());
    this.obj.inputs.month.setValue(this.obj.date.getMonth());
    this.obj.inputs.year.setValue(this.obj.date.getFullYear());
 
    this.obj.run.values.start = (new Date(this.obj.date.getFullYear(), this.obj.date.getMonth(), this.obj.date.getDate() ).getTime() / 1000);
    this.obj.run.values.end = (new Date(this.obj.date.getFullYear(), this.obj.date.getMonth() + 1, this.obj.date.getDate() ).getTime() / 1000);
    
    this.newselect = true;
  }

  async prev()
  {
    this.obj.date = new Date(this.obj.inputs.year.getValue(), this.obj.inputs.month.getValue() - 1, this.obj.inputs.day.getValue());
    this.obj.inputs.day.setValue(this.obj.date.getDate());
    this.obj.inputs.month.setValue(this.obj.date.getMonth());
    this.obj.inputs.year.setValue(this.obj.date.getFullYear());
 
    this.obj.run.values.start = (new Date(this.obj.date.getFullYear(), this.obj.date.getMonth(), this.obj.date.getDate() ).getTime() / 1000);
    this.obj.run.values.end = (new Date(this.obj.date.getFullYear(), this.obj.date.getMonth() + 1, this.obj.date.getDate() ).getTime() / 1000);
    
    this.newselect = true;
  }
  
  async next()
  {
    this.obj.date = new Date(this.obj.inputs.year.getValue(), this.obj.inputs.month.getValue() + 1, this.obj.inputs.day.getValue());
    this.obj.inputs.day.setValue(this.obj.date.getDate());
    this.obj.inputs.month.setValue(this.obj.date.getMonth());
    this.obj.inputs.year.setValue(this.obj.date.getFullYear());
 
    this.obj.run.values.start = (new Date(this.obj.date.getFullYear(), this.obj.date.getMonth(), this.obj.date.getDate() ).getTime() / 1000);
    this.obj.run.values.end = (new Date(this.obj.date.getFullYear(), this.obj.date.getMonth() + 1, this.obj.date.getDate() ).getTime() / 1000);
    
    this.newselect = true;
  }
  
  async enter()
  {
    this.obj.date = new Date(this.obj.inputs.year.getValue(), this.obj.inputs.month.getValue(), this.obj.inputs.day.getValue());
    this.obj.inputs.day.setValue(this.obj.date.getDate());
    this.obj.inputs.month.setValue(this.obj.date.getMonth());
    this.obj.inputs.year.setValue(this.obj.date.getFullYear());
 
    this.obj.run.values.start = (new Date(this.obj.date.getFullYear(), this.obj.date.getMonth(), this.obj.date.getDate() ).getTime() / 1000);
    this.obj.run.values.end = (new Date(this.obj.date.getFullYear(), this.obj.date.getMonth() + 1, this.obj.date.getDate() ).getTime() / 1000);
    
    this.newselect = true;
     
  }
  
  async values()
  {
    if ( ! this.obj.date )
    {
      this.obj.date = new Date();
      this.obj.date.setTime(this.obj.date.getTime() - 864000000 )
      this.obj.inputs.day.setValue(this.obj.date.getDate());
      this.obj.inputs.month.setValue(this.obj.date.getMonth());
      this.obj.inputs.year.setValue(this.obj.date.getFullYear());

      this.obj.run.values.start = (new Date(this.obj.date.getFullYear(), this.obj.date.getMonth(), this.obj.date.getDate() ).getTime() / 1000);
      this.obj.run.values.end = (new Date(this.obj.date.getFullYear(), this.obj.date.getMonth() + 1, this.obj.date.getDate() ).getTime() / 1000);
      this.obj.run.values.year = this.obj.date.getFullYear();
    }
  }

}

export default MneAllgSelectDate;

//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/etc/selectday.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'
import MneInput    from '/js/basic/input.mjs'

import MneDbView   from '/weblet/db/view.mjs'

class MneCalendarSelectDay extends MneDbView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        url : '',
        modurl : 'dummy',
        
        delbutton: [ 'add', 'del'],
        selectlists : { month : 'monthname' }
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getViewPath() { return this.getView(import.meta.url) }
  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  reset()
  {
    super.reset();
    this.obj.mkbuttons.push({ id : 'today', value : MneText.getText('#mne_lang#Heute#'), space : 'before' } );
  }
  showMonth = function(month, year, day)
  {
    var m = new Date(year, month, 1, 0, 0, 0);
    var i,j,k;
    var jc,kc;
    var str;
    
    this.obj.run.values.year = year;
    this.obj.run.values.month = month;
    this.obj.run.values.day = day;
    
    this.obj.inputs.month.setValue(month);
    this.obj.inputs.year.setValue(year);
    
    str = '<table class="border padding"><thead><tr><td>' + MneText.getText('#mne_lang#So') + '</td><td>' + MneText.getText('#mne_lang#Mo') + '</td><td>' + MneText.getText('#mne_lang#Di') + '</td><td>' + MneText.getText('#mne_lang#Mi') + '</td><td>' + MneText.getText('#mne_lang#Do') + '</td><td>' + MneText.getText('#mne_lang#Fr') + '</td><td>' + MneText.getText('#mne_lang#Sa') + '</td></tr></thead>';
    
    str += '<tbody><tr>'
    for ( i=0; i<m.getDay(); i++ )
        str = str + '<td></td>';
    
    k = 0;
    j = m.getDay();
    for ( i=0; i<31 && m.getMonth() == month; i++)
    {
      var act_day;
      act_day = m.getDate();
      
      str += '<td id="day' + act_day + '" class="day">' + act_day + '</td>';
      
      if ( act_day == day )
      {
        jc = j;
        kc = k;
        this.obj.run.values.date = m.getTime() / 1000;
        this.obj.run.values.daytext = MneInput.format("" + (parseInt(m.getDay()) + 1), 'day'); 
      }
 
      m.setTime(m.getTime() + 86400000);
      while ( m.getDate() == act_day ) m.setTime(m.getTime() + 3600);
      j++;
      
      if ( m.getDay() == 0 )
      {
        str += '</tr>';
        if ( i<31 && m.getMonth() == month ) str += '<tr>';
        k++;
        j = 0;
      }
    }
    
    for ( i = m.getDay(); i != 7; i++)
      str += '<td></td>';
    
    str += '</tr></tbody></table>';
    
    this.obj.tables.month.innerHTML = str;
    this.obj.tables.month.querySelectorAll('td.day').forEach((item) => { item.addEventListener('click',  (evt) => {  this.btnClick('day', {}, evt.target, evt); this.btnClick('ok', {}, this.obj.buttons.ok, evt) }) });
    MneElement.mkClass(this.obj.tables.month.querySelector('td#day' + day), 'active');
    
  }

  async load()
  {
      await super.load();
      this.obj.inputs.month.addEventListener('change', (evt) => { this.btnClick('month', {}, evt.target, evt)});
      this.obj.inputs.year.addEventListener('keypress', (evt) => {  if ( evt.key == 'Enter' ) { evt.preventDefault(); this.btnClick('year', {}, evt.target, evt); }});
  }
  
  async cancel()
  {
    await this.close();
    return false;
  }
  
  async enter()
  {
  }
  
  async ok()
  {
    var res = {
        ids     : [ 'date', 'daytext' ],
        rids    : { 'date' : 0 , 'daytext' : 1},
        labels  : [ 'date', 'daytext' ],
        typs    : [ '4', '2' ],
        formats : [ '', '' ],
        regexps : [ [ '', '', ''],  [ '', '', ''] ], 
        values  : [[ this.obj.run.values.date, this.obj.run.values.daytext ]]
    }

    if ( this.initpar.selectok)
      await this.initpar.selectok(res);
    return this.cancel();
  }
  
  async today()
  {
    return this.values();
  }
  
  async mprev()
  {
    this.obj.run.values.month--;
    if ( this.obj.run.values.month < 0 )
    {
      this.obj.run.values.month = 11;
      this.obj.run.values.year--;
    }
    this.showMonth(this.obj.run.values.month, this.obj.run.values.year, this.obj.run.values.day);
    return false;
  }

  async mnext()
  {
    this.obj.run.values.month++;
    if ( this.obj.run.values.month > 11 )
    {
      this.obj.run.values.month = 0;
      this.obj.run.values.year++;
    }
    this.showMonth(this.obj.run.values.month, this.obj.run.values.year, this.obj.run.values.day);
    return false;
  }
  
  async yprev()
  {
    this.obj.run.values.year--;
    this.showMonth( this.obj.run.values.month, this.obj.run.values.year, this.obj.run.values.day);
    return false;
  }
  
  async ynext()
  {
    this.obj.run.values.year++;
    this.showMonth( this.obj.run.values.month, this.obj.run.values.year, this.obj.run.values.day);
    return false;
  }
  
  async day(data, obj, evt)
  {
    this.obj.run.values.day = obj.innerText;
    var d = new Date(this.obj.run.values.year, this.obj.run.values.month, this.obj.run.values.day );

    this.obj.run.values.date = d.getTime() / 1000;
    this.obj.run.values.daytext = MneInput.format("" + (parseInt(d.getDay()) + 1), 'day'); 
    
    this.showMonth( this.obj.run.values.month, this.obj.run.values.year, this.obj.run.values.day);
  }
  
  async month ()
  {
    this.obj.run.values.month = this.obj.inputs.month.getValue();
    this.showMonth( this.obj.run.values.month, this.obj.run.values.year, this.obj.run.values.day)
    return false;
  }
  
  async year()
  {
    this.obj.run.values.year = this.obj.inputs.year.getValue();
    this.showMonth( this.obj.run.values.month, this.obj.run.values.year, this.obj.run.values.day);
    return false;
  }
  
  async values()
  {
    var date = new Date();
    this.showMonth(date.getMonth(), date.getFullYear(), date.getDate());
  }
}

export default MneCalendarSelectDay;

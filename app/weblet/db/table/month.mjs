//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/db/table/month.mjs
//================================================================================
'use strict';

import MneConfig   from '/js/basic/config.mjs'
import MneText     from '/js/basic/text.mjs'
import MneInput    from '/js/basic/input.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'
import MneTheme    from '/js/basic/theme.mjs'

import MneElement from '/weblet/basic/element.mjs'
import MneDbView  from '/weblet/db/view.mjs'

class MneTableMonth extends MneDbView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      wcol : '',
      wval : '',
      wop  : '',
      
      slotstartschema : 'mne_personnal',
      slotstarttable  : 'timemanagement_param',
      slotcols        : 'slotstart,slotsize,slotcount',
 
      hinput : false
    };
    
    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  reset()
  {
    super.reset();
    
      this.obj.slotstart = 28800;
      this.obj.slotsize  = 7200;
      this.obj.slotcount = 4;
      
      this.obj.htmlcontent = '<input type="hidden" id="startInput"><input type="hidden" id="durationInput"><div id="contentTable"></div>'
                           + '<div id="dataviewContainer" class="dataview"></div>'
                           + '<div id="datapicContainer" class="datapic"></div>'
                           + '<div id="buttonFrame"><div id="buttonContainer"></div></div>';
      this.obj.mkbuttons = 
        [
          { id : 'cancel', value : MneText.getText('#mne_lang#Abbrechen')},
          { id : 'del',    value : MneText.getText('#mne_lang#Löschen'), space : 'after' },
        ];

      if ( this.initpar.detail ) this.obj.mkbuttons.push( { id : 'detail', value : MneText.getText('#mne_lang#Detail'), before : 'cancel'});

  }

  async readvalues(request, p)
  {
    return MneRequest.fetch(request, p);
  }
  
  async findIOParam()
  {
    this.obj.inputs.start.noautoread = true;
    this.obj.inputs.duration.noautoread = true;

    this.obj.inputs.start.setTyp('datetime', MneInput.checktype.ok, '');
    this.obj.inputs.duration.setTyp('interval', MneInput.checktype.ok, '');
    
    return super.findIOParam();
  }
  
  async load()
  {
    await super.load();
    var param =
    {
        "schema" : this.initpar.slotstartschema,
        "table"  : this.initpar.slotstarttable,
        "cols"   : this.initpar.slotcols,

        sqlstart : 1,
        sqlend   : 1
    };

    var res = await MneRequest.fetch("/db/utils/table/data.json",  param );
    
    if ( res.values.length > 0 )
    {
      this.obj.slotstart = parseInt(res.values[0][0]);
      this.obj.slotsize  = parseInt(res.values[0][1]);
      this.obj.slotcount = parseInt(res.values[0][2]);
    }
    
    this.obj.styles.push(MneTheme.createStyle());

    this.obj.container.dataview.obj = this.getFindIOObject();
    this.obj.contextmenu = this.frame.querySelector('#buttonFrame');
    this.obj.container.content.setAttribute('draggable', false);
  }

  dataview(slot, data)
  {
    var i;
    var str;
    
    data = data ?? slot.obj;
    
    if ( ! data.values )
    {
      MneElement.mkClass(this.obj.container.dataview, 'display', false);
      return;
    }

    this.dataselect(slot, data );
    
    str = '<div class="inputarea"><div class="inputgroup">';
    for ( i in data.values )
    {
      if ( data.result.hides.indexOf(data.result.ids[i]) == -1 && data.values[i] != '' )
        str += '<div class="inputsingle"><span id="' + data.result.ids[i] + 'Label">' + data.result.labels[i] + '</span><span id="' + data.result.ids[i] + 'Output">' + MneInput.format(data.values[i], data.result.typs[i], data.result.formats[i]) + '</span></div>'; 
    }
    str += '</div></div>';

    this.obj.container.dataview.innerHTML = str;
    MneElement.mkElements(this.obj.container.dataview);
    this.findIO(this.obj.container.dataview, this.obj.container.dataview.obj)

    this.obj.container.dataview.obj.outputs.start.setTyp('datetime',MneInput.checktype.notempty, '');
    this.obj.container.dataview.obj.outputs.duration.setTyp('interval',MneInput.checktype.notempty, '');
    
    this.obj.container.dataview.obj.outputs.start.setValue(data.values[data.result.rids.start]);
    this.obj.container.dataview.obj.outputs.duration.setValue(data.values[data.result.rids.duration]);
    
    this.obj.container.datapic.setAttribute('data-slotwidth', (( data.slots ) ? data.slots.length : data.slotcount) );
    MneElement.mkClass(this.obj.container.datapic, 'active' + data.values[data.result.rids.id], true, 'active');
    
    MneElement.mkClass(this.obj.container.dataview, 'display');
    MneElement.mkClass(this.obj.container.datapic, 'display');
    
    if ( ! slot.obj.slots || slot.obj.slots.indexOf(this.obj.slotcontext) == -1 ) MneElement.clearClass(this.obj.contextmenu, 'display');
    
  }
  
  dataselect(slot, data)
  {
    var row = slot.closest('tr');
    data = data ?? slot.obj;
    
    Array.from(row.slots).forEach(( item, index) => { MneElement.clearClass(item, 'selected', false ); });
    if ( data.slots ) data.slots.forEach(( item, index) => { MneElement.mkClass(item, 'selected' ); });
  }

  dataunselect()
  {
    this.obj.tbody.querySelectorAll('.slot.selected').forEach(( item, index) => { MneElement.clearClass(item, 'selected'); });
    this.obj.tbody.querySelectorAll('.slot.active').forEach(( item, index)   => { MneElement.clearClass(item, 'active' ); });
    this.obj.tbody.querySelectorAll('.slot').forEach( (item) => { item.setAttribute('draggable', true)});

    MneElement.clearClass(this.obj.container.dataview, 'display');
    MneElement.clearClass(this.obj.container.datapic, 'display');

    this.obj.container.dataview.innerHTML = '';
    this.obj.container.dataview.style.top = '';
    this.obj.container.dataview.style.left = '';

    this.obj.run.act_row = undefined;
    this.obj.run.act_time = undefined;
    this.obj.slotdown = undefined;
    this.obj.slotdrag = undefined;
    
    this.obj.inputs.start.modClear()
    this.obj.inputs.duration.modClear();
  }
  
  setPosition(view, slot)
  {
    var left = ((MneElement.getLeft(slot, view.offsetParent ) + view.offsetWidth + 20 ) > view.offsetParent.offsetWidth );
    MneElement.mkClass(view, 'displayleft', left );

    view.style.top  = 'var(--titleheight)'
    view.style.left = MneElement.getLeft(slot, view.offsetParent) + (( left ) ? 0 : 20 ) + 'px';
  }
  
  dragend(evt)
  {
    this.dataunselect();
  }
  
  async readtimevalues(id)
  {
    
  }
  
  async readtime(row)
  {
    var res = await this.readtimevalues(row.obj.id);
    var start = res.rids.start;
    var end = res.rids.end;

    Array.from(row.slots).forEach(( item, index) =>
    {
      MneElement.clearClassAll(item, 'active');
      MneElement.clearClass(item, 'selected');
      MneElement.clearClass(item, 'slotfirst');
    });
    
    res.values.forEach( ( item ) =>
    {
      if ( ! Array.from(this.obj.styles[0].sheet.cssRules).find(ele => ele.selectorText.indexOf(item[res.rids.timetyp] + '_' + item[res.rids.id]) >= 0 ) )
        MneTheme.insertRule(this.obj.styles[0], 'div.weblet' + this.config.webletnum + ' .active_' + item[res.rids.timetyp] + '_' + item[res.rids.id] + ' { background-color: #' + item[res.rids.color] + ' !important }');
    })

    var i = 0;
    var starttime = ( i < res.values.length ) ? MneInput.getValue(res.values[i][start], 'datetime', true) : this.obj.lasttime;
    var endtime   = ( i < res.values.length ) ? MneInput.getValue(res.values[i][end], 'datetime', true) : this.obj.lasttime;
    var lastslot;
    var firstslot;
    var slots = [];
    
    Array.from(row.slots).forEach(( item, index) =>
    {
        
      var time = MneInput.getValue(item.dataset.time, 'datetime', true);
      while ( time >= endtime )
      {
        i++;
        starttime = ( i < res.values.length ) ? MneInput.getValue(res.values[i][start], 'datetime', true) : this.obj.lasttime;
        endtime   = ( i < res.values.length ) ? MneInput.getValue(res.values[i][end], 'datetime', true) : this.obj.lasttime;
        if ( slots.length )
        {
          MneElement.mkClass(lastslot.obj.slots[0], 'slotfirst');
          lastslot.obj.slots[lastslot.obj.slots.length - 1].obj.lastslot = true;
          lastslot = undefined;
        }
          
        slots = [];
      }

      item.obj = {};
      
      if ( time >= starttime )
      {
        slots.push(item);

        MneElement.mkClass(item, 'active_' + res.values[i][res.rids.timetyp] + '_' + res.values[i][res.rids.id]);
        item.obj.values = res.values[i];
        item.obj.result = res;
        item.obj.slots = slots;
        item.obj.row = row;
        
        lastslot = item;
      }
    });

    if ( lastslot && lastslot.obj.slots )
    {
      MneElement.mkClass(lastslot.obj.slots[0], 'slotfirst');
      lastslot.obj.slots[lastslot.obj.slots.length - 1].obj.lastslot = true;
    }
    res.values = undefined;
  }
  
  addCol(date)
  {
    Array.from(this.obj.thead.children).forEach((item) =>
    {
      var th;
      item.appendChild((th = document.createElement('th')));
      th.className = 'day' + date.getDay();
      th.innerHTML = date.getDate();
    });
    
    Array.from(this.obj.tbody.children).forEach((item) =>
    {
      var i;
      var td;
      var str = '<div class="slotcontainer">';
      
      for ( i =0; i < this.obj.slotcount; i++)
      {
        var starttime = this.obj.slotstart + this.obj.slotsize * i;
        var startday = parseInt(date.getTime() / 1000);
        var time = startday + starttime;
        
        str += '<div tabindex=0 class="slot slot' + i + ((( Date.now() / 1000 ) > time ) ? ' slotpast' : ' ' ) + '" data-time="' + time + '" data-startday="' + startday + '" data-starttime ="' + starttime + '" draggable="true"></div>';
      }
      str += '</div>';
      
      item.appendChild((td = document.createElement('td'))); 
      td.className = 'day' + date.getDay();
      td.innerHTML = str;
      
      Array.from(td.firstChild.children).forEach((slot) =>
      {
        item.slots.push(slot);
        slot.obj = {};

        slot.addEventListener('contextmenu', (evt) =>
        {
          evt.preventDefault();

          MneElement.clearClass(this.obj.container.dataview, 'display');
          MneElement.clearClass(this.obj.container.datapic,  'display');

          MneElement.mkClass(this.obj.contextmenu,  'display');
          MneElement.mkClass(this.obj.contextmenu, 'displayleft', ((MneElement.getLeft(slot, this.obj.contextmenu.offsetParent ) + this.obj.contextmenu.offsetWidth ) > this.obj.contextmenu.offsetParent.offsetWidth ) );
          MneElement.mkClass(this.obj.contextmenu, 'displaytop', ((MneElement.getTop(slot, this.obj.contextmenu.offsetParent ) + this.obj.contextmenu.offsetHeight  ) > this.obj.contextmenu.offsetParent.offsetHeight ) );

          this.obj.contextmenu.style.top = MneElement.getTop(slot, this.obj.contextmenu.offsetParent) + 'px';
          this.obj.contextmenu.style.left = MneElement.getLeft(slot, this.obj.contextmenu.offsetParent) + 'px';
          this.obj.slotcontext = slot;

          if ( slot.obj.values )
          {
            this.obj.run.result = slot.obj.result;
            this.obj.run.values = {};
            this.obj.run.result.ids.forEach((id, index) => { this.obj.run.values[id] = MneInput.getValue(slot.obj.values[index], slot.obj.result.typs[index], slot.obj.result.formats[index], true); });
          }
          else
          {
            var i;
            
            this.obj.run.result = item.obj.result;
            this.obj.run.values = {};
            this.obj.run.result.ids.forEach((id, index) => { this.obj.run.values[id] = MneInput.getValue(item.obj.values[index], item.obj.result.typs[index], item.obj.result.formats[index], true); });
            
            for ( i in slot.dataset )
            this.obj.run.values[i] = parseInt(slot.dataset[i]);
          }
        });

        slot.addEventListener('mouseup', (evt) =>
        {
          if ( this.obj.slotdown )
          {
            this.obj.run.result  = this.obj.slotdown.obj.result;
            this.obj.run.values = {};
            this.obj.run.result.ids.forEach((item,index) => { this.obj.run.values[item] = MneInput.getValue(this.obj.slotdown.obj.values[index], this.obj.run.result.typs[index], true) });

            try
            {
              this.obj.inputs.start.modValue(this.obj.container.dataview.obj.outputs.start.getValue());
              this.obj.inputs.duration.modValue(this.obj.container.dataview.obj.outputs.duration.getValue());
            }
            catch(e)
            {
              this.dataunselect();
              return;
            }

            this.dataunselect();
            this.obj.run.okaction = 'mod',
            this.obj.act_row = item;
            this.btnClick('ok');
          }
        });

        slot.addEventListener('mousedown', (evt) => 
        {
          if ( MneElement.hasClass(slot,'resize') && evt.button == 0 )
          {
            this.obj.slotdown = slot;
            slot.closest('tr').querySelectorAll('.slot').forEach( (item) => { item.setAttribute('draggable', false)});

            this.dataview(slot);
            this.setPosition(this.obj.container.dataview, slot);
          }
        });

        slot.addEventListener('mousemove', (evt) =>
        {
          if ( ! this.obj.slotdown && ! this.obj.slotdrag )
            MneElement.mkClass(slot, 'resize', !! slot.obj.lastslot && ( evt.offsetX > slot.offsetWidth / 2 ));
        });

        slot.addEventListener('mouseenter', (evt) => 
        {
          if ( this.obj.slotdown )
          {
            var islot = item.slots.indexOf(this.obj.slotdown.obj.slots[0]);
            var lslot = item.slots.indexOf(slot);
            var i;
            var val;

            this.setPosition(this.obj.container.dataview, slot);

            if ( this.obj.slotdown.obj.row != item ) return;
            
            for ( i = islot; i<=lslot; i++)
            {
              if ( this.obj.slotdown.obj.slots.indexOf(item.slots[i]) == -1 && item.slots[i].obj.values )
                break;
              MneElement.mkClass(item.slots[i], 'resize');
              MneElement.mkClass(item.slots[i], 'active');
            }

            this.obj.container.dataview.obj.outputs.duration.modValue( (( val = (i - islot) * this.obj.slotsize ) == 0 ) ? '' : val );
            while ( i < item.slots.length && MneElement.hasClass(item.slots[i], 'resize') )
            {
              MneElement.clearClass(item.slots[i], 'resize');
              MneElement.clearClass(item.slots[i], 'active');
              i++;
            }
            return;
          }
          else if ( ! this.obj.slotdrag )
          {
            if ( ! slot.obj.values )
            {
              this.dataunselect();
              return;
            }
            else
            {
              this.dataview(slot);
              this.setPosition(this.obj.container.dataview, slot);
            }
          }
        });

        slot.addEventListener('dragstart', (evt) =>
        {
          
          if ( ! slot.obj.values ) 
          {
            evt.preventDefault();
            return;
          }

          this.obj.slotdrag = slot;
          
          this.dataview(slot);
          this.setPosition(this.obj.container.dataview, slot);
 
          evt.dataTransfer.setDragImage(this.obj.container.datapic, 0, 0);
          evt.dataTransfer.effectAllowed = 'move';
        });
        
        slot.addEventListener('dragend', (evt) => { this.dataunselect(); }); 
        
        slot.addEventListener('dragover', (evt) => 
        {
          var data;
          
          if ( this.obj.slotdrag )
          {
            var dragslots = this.obj.slotdrag.obj.slots;

            if ( evt.target.closest('tr').obj.id == dragslots[0].closest('tr').obj.id )
            {
              var time = MneInput.getValue(evt.target.dataset.time, 'datetime', true);
              var islot = item.slots.indexOf(slot);
              var i;
              var dropok = true;

              item.slots.forEach( (item) => { MneElement.clearClass(item, 'active')});

              for ( i =0; i<dragslots[0].obj.slots.length; i++)
              {
                MneElement.mkClass(item.slots[islot + i],'active');
                if ( dragslots.indexOf(item.slots[islot + i]) == -1 && item.slots[islot + i].obj.values )
                  dropok = false;
              }

              this.setPosition(this.obj.container.dataview, slot);
              if ( ! dropok || time < (new Date()).getTime() / 1000 )
              {
                this.obj.container.dataview.obj.outputs.start.setValue('');
                return;
              }

              this.obj.container.dataview.obj.outputs.start.modValue(evt.target.dataset.time);
              evt.dataTransfer.setDragImage(document.body, 0, 0);
              evt.preventDefault();
            }
            else
            {
              this.setPosition(this.obj.container.dataview, slot);
              this.obj.container.dataview.obj.outputs.start.modValue('');
            }
          }
          else if ( !! ( data = evt.dataTransfer.getData(this.initpar.dragid))  )
          {
            if ( document.mnedragend && document.mnedragend.indexOf(this) == -1 ) document.mnedragend.push(this);

            data = JSON.parse(data);

            data.rids.start = data.ids.length;
            data.ids.push("start");
            data.typs.push("datetime");
            data.formats.push("");
            data.labels.push("#mne_lang#Startzeit");
            data.values.push(0);
            data.slotcount = parseInt(parseInt( parseInt(data.values[data.rids.timeneeded]) + this.obj.slotsize - 1 ) / this.obj.slotsize);
            data.slotcount = ( data.slotcount <= 0 ) ? 1 : data.slotcount;
            
            this.dataview( slot, { result : data, values : data.values } );
            this.setPosition(this.obj.container.dataview, slot);

            item.slots.forEach( (item) => { MneElement.clearClass(item, 'active')});

            var islot = item.slots.indexOf(slot);
            var time = MneInput.getValue(evt.target.dataset.time, 'datetime', true);
            var i;

            for ( i=0; time > (new Date()).getTime() / 1000 && item.slots[i] && ! item.slots[i+islot].obj.values && i < data.slotcount; i++ )
              MneElement.mkClass(item.slots[islot + i], 'active');
            
            if ( i ) evt.preventDefault();

            this.obj.container.dataview.obj.outputs.start.modValue(evt.target.dataset.time);
            this.obj.container.dataview.obj.outputs.duration.modValue(i * this.obj.slotsize );
            
            evt.dataTransfer.effectAllowed = 'move';
          }
        });

        slot.addEventListener('drop', (evt) => 
        {
          var data;
          
          if ( this.obj.slotdrag )
          {
            this.obj.run.result  = this.obj.slotdrag.obj.result;
            this.obj.run.values = {};
            this.obj.run.result.ids.forEach((item,index) => { this.obj.run.values[item] = MneInput.getValue(this.obj.slotdrag.obj.values[index], this.obj.run.result.typs[index], true) });

            try
            {
              this.obj.inputs.start.modValue(this.obj.container.dataview.obj.outputs.start.getValue());
              this.obj.inputs.duration.modValue(this.obj.container.dataview.obj.outputs.duration.getValue());
            }
            catch(e)
            {
              this.dataunselect();
              return;
            }

            this.dataunselect();
            this.obj.run.okaction = 'mod',
            this.obj.act_row = item;
            this.btnClick('ok');
          }
          else if ( !! ( data = evt.dataTransfer.getData(this.initpar.dragid))  )
          {
            data = JSON.parse(data);
            this.obj.run.result = data;
            this.obj.run.values = {};
            this.obj.run.result.ids.forEach((item, index) => { this.obj.run.values[item] = data.values[index] });
            this.obj.run.values.id = item.obj.id;
            
            this.obj.inputs.start.modValue(this.obj.container.dataview.obj.outputs.start.getValue());
            this.obj.inputs.duration.modValue(this.obj.container.dataview.obj.outputs.duration.getValue());

            this.dataunselect();
            this.obj.run.okaction = 'add',
            this.obj.act_row = item;
            this.btnClick('ok');
          }
        });
      });
      item.addEventListener('dragleave', (evt) => { if ( evt.relatedTarget != null && evt.relatedTarget.closest('tr') != item ) item.slots.forEach( (item) => { MneElement.clearClass(item, 'active')});  });
    });
  }
  
  async detail()
  {
    await this.openpopup(this.initpar.detail);

    var w = this.obj.weblets[this.initpar.detail];
    if ( w.config.depend.indexOf(this) == -1 )
    {
      w.config.depend.push(this);
      w.config.depend.push(this.initpar.infoweblet);
    }
    
    MneElement.clearClass(this.obj.contextmenu, 'display');
    return false;
  }

  async cancel()
  {
    MneElement.clearClass(this.obj.contextmenu, 'display');
    return false;
  }
  
  async del()
  {
    if ( this.initpar.infoweblet )
      this.initpar.infoweblet.setInfo(this.obj.run.values[this.initpar.infoid]);

    MneElement.clearClass(this.obj.contextmenu, 'display');

    var data = this.obj.slotcontext.obj;
    if ( ! data.values ) return false;
    
    this.obj.run.result  = data.result;
    this.obj.run.values = {};
    this.obj.run.result.ids.forEach((item,index) => { this.obj.run.values[item] = MneInput.getValue(data.values[index], this.obj.run.result.typs[index], true) });
    this.obj.act_row = this.obj.slotcontext.closest('tr');
    
    return super.del();
  }
  
  async ok()
  {
    if ( this.initpar.infoweblet )
      this.initpar.infoweblet.setInfo(this.obj.run.values[this.initpar.infoid]);
    return super.ok();
  }
  
  setInfo(value)
  {
    this.obj.run.updateid = value;
    this.newvalues = true;
  }
  
  async values(param)
  {
    var p = [];
    
    if ( this.obj.run.dependweblet == this )
      return this.readtime(this.obj.act_row);

    if ( this.obj.run.updateid )
    {
      var rows = Array.from(this.obj.tbody.rows);
      rows.forEach((item) => { if ( item.obj.id == this.obj.run.updateid ) p.push(this.readtime(item))} );
      this.obj.run.updateid = undefined;
      return Promise.all(p);
    }

    this.obj.run.result = Object.assign({}, this.initpar.rowweblet.obj.run.result );
    
    var t = '<table class="border padding relative top"><thead><tr class="center">';
    t += '</tr></thead><tbody>';
    Array.from(this.initpar.rowweblet.obj.tbody.children).forEach((item) => { t += '<tr></tr>'});
    t += '</tbody></table>';
    
    this.obj.tables.content.innerHTML = t;
    
    this.obj.thead = this.obj.container.content.querySelector('thead');
    this.obj.tbody = this.obj.container.content.querySelector('tbody');
    
    this.obj.tbody.querySelectorAll('tr').forEach( ( item) => { item.slots = []});
    
    var d = new Date();
    if ( this.config.dependweblet ) d.setTime(this.config.dependweblet.obj.run.values.start * 1000 );
    
    var act_y = d.getFullYear();
    var act_m = d.getMonth();
    var m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var i = 0;
    var size = 0;
    var w = this.obj.tables.content.firstChild.offsetWidth;
    
    this.obj.firsttime = m.getTime() / 1000;
    while ( ( ( m.getMonth() + (m.getFullYear() - act_y) * 12 ) - act_m ) < 2 && this.obj.tables.content.firstChild.offsetWidth + size < this.obj.tables.content.offsetWidth)
    {
      if ( size == 0 )
        size = this.obj.tables.content.firstChild.offsetWidth - w;
      this.addCol(m);
      m.setDate(m.getDate() + 1);
    }
    this.obj.lasttime = m.getTime() / 1000;
    
    var rows = Array.from(this.obj.tbody.rows);
    var p = [];
    MneTheme.deleteRules(this.obj.styles[0]);
    rows.forEach((item, index) => 
    {
      var row = this.initpar.rowweblet.obj.tbody.children[index];
      item.obj = { id : row.values[0], color : row.values[1], result : this.initpar.rowweblet.obj.run.result, values : row.values };
      p.push(this.readtime(item))
      
      item.addEventListener('mouseleave', (evt) => { this.dataunselect() });
      
    });

    return Promise.all(p);
  }
  
}

export default MneTableMonth;

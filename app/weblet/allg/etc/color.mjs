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

import MneElement from '/weblet/basic/element.mjs'
import MneDbView  from '/weblet/db/view.mjs'

class MneColor extends MneDbView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      notitle : true,

      modurl   : 'dummy',
      delbutton: [ 'add', 'del'],

      hinput : false,
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  getViewPath() { return this.getView(import.meta.url) }
  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  async findIO()
  {
    var container = this.frame.querySelector('#contentContainer');
    this.initpar.showids.forEach( (item) => 
    {
      var ele = document.createElement('input');
      ele.id = item + "Input";
      ele.type = "hidden";
      ele.className = 'ele-wrapper';
      container.insertBefore(ele, container.firstChild);
    });
    await super.findIO();
  }
  
  async findIOParam()
  {
    var i,j;
    
    this.obj.inputs.red.noautoread = true;
    this.obj.inputs.blue.noautoread = true;
    this.obj.inputs.green.noautoread = true;
    
    await super.findIOParam();
    
    [ 'red', 'green', 'blue'].forEach( (item) =>
    {      
      this.obj.observer[item] = new MutationObserver((muts) =>
      {
        muts.forEach((mut) =>
        {
          var func = ( mut.attributeName == 'newvalue' ) ? 'modValue' : 'setValue';
          if ( mut.oldValue != mut.target.getAttribute(mut.attributeName) || this.obj.inputs[item].getValue() != mut.oldValue )
          {
            this.setColor(this.obj.sliders.red.getValue().toString(16).padStart(2,0) + this.obj.sliders.green.getValue().toString(16).padStart(2,0) + this.obj.sliders.blue.getValue().toString(16).padStart(2,0), ( mut.attributeName == 'newvalue' ));
            this.obj.inputs[item][func](this.obj.sliders[item].getAttribute(mut.attributeName))
          }
        });
      });
      this.obj.observer[item].observe(this.obj.sliders[item], { childList: false, subtree: false, attributes : true, attributeOldValue: true, attributeFilter: [ 'newvalue', 'oldvalue' ] } );
    });
    
    var colorcontent = '<table class="border"><tbody>'
    for ( i=0; i<8; i++)
    {
      colorcontent += '<tr>';
      for ( j=0; j<8; j++)
        colorcontent += '<td><div class="colorshow"></div></td>';
      colorcontent += '</tr>';
    }
    colorcontent += '</tbody></table>';
    this.obj.tables.content.innerHTML = colorcontent;
    
    var colorval = new Array("00", "55", "AA", "FF");
    var body = this.obj.tables.content.querySelector('tbody');
    
    var b,r,g;
    b = r = g = 0;
    r = 0;
    for ( g = 0; g < 4; g++)
    {
      for ( b = 0; b < 4; b++)
      {
        var color = colorval[g] + colorval[r] + colorval[b];
        body.rows[b].cells[g].style.backgroundColor = "#" + color;
        body.rows[b].cells[g].colorval = color;
      }
    }
    r = 1;
    for ( g = 0; g < 4; g++)
    {
      for ( b = 0; b < 4; b++)
      {
        color = colorval[g] + colorval[r] + colorval[b];
        body.rows[b].cells[4 + g].style.backgroundColor = "#" + color;
        body.rows[b].cells[4 + g].colorval = color;
      }
    }
    r = 2;
    for ( g = 0; g < 4; g++)
    {
      for ( b = 0; b < 4; b++)
      {
        color = colorval[g] + colorval[r] + colorval[b];
        body.rows[4 + b].cells[g].style.backgroundColor = "#" + color;
        body.rows[4 + b].cells[g].colorval = color;
     }
    }
    r = 3;
    for ( g = 0; g < 4; g++)
    {
      for ( b = 0; b < 4; b++)
      {
        color = colorval[g] + colorval[r] + colorval[b];
        body.rows[4 + b].cells[4 + g].style.backgroundColor = "#" + color;
        body.rows[4 + b].cells[4 + g].colorval = color;
      }
    }
    
    this.obj.tables.content.querySelectorAll('td').forEach( ( item) =>
    {
      item.addEventListener('click', (evt) =>
      {
        this.setColor(item.colorval, true);
        if ( evt.detail == 2 ) this.btnClick('ok', undefined, evt.target, evt);
      });
    });

  }

  setColor(val, mod)
  {
    this.obj.run.values.color = val;

    var func = ( mod ) ? "modValue" : "setValue";
    var rgb = /^#?([A-Fa-f\d]{2})([A-Fa-f\d]{2})([A-Fa-f\d]{2})$/.exec('#' + val);
    if ( rgb )
    {
      this.obj.sliders.red[func](parseInt(rgb[1], 16));
      this.obj.sliders.green[func](parseInt(rgb[2], 16));
      this.obj.sliders.blue[func](parseInt(rgb[3], 16));

      if ( ! mod )
      {
        this.obj.inputs.red[func](parseInt(rgb[1], 16));
        this.obj.inputs.green[func](parseInt(rgb[2], 16));
        this.obj.inputs.blue[func](parseInt(rgb[3], 16));
      }

      this.obj.outputs.color[func](val);
    }
    else
    {
      this.obj.sliders.red[func](0);
      this.obj.sliders.green[func](0);
      this.obj.sliders.blue[func](0);

      if ( ! mod )
      {
        this.obj.inputs.red[func](0);
        this.obj.inputs.green[func](0);
        this.obj.inputs.blue[func](0);
      }

      this.obj.outputs.color[func]('000');
    }
  }
  
  async ok()
  {
    var res = {
        ids     : [ 'color', ],
        rids    : { 'color' : 0 },
        labels  : [ 'color', ],
        typs    : [ '2', ],
        formats : [ '', '' ],
        regexps : [ [ '', '', ''],  [ '', '', ''] ], 
        values  : [[ this.obj.run.values.color ]]
    }

    if ( this.initpar.selectok)
      await this.initpar.selectok(res);
    return this.cancel();
  }

  async cancel()
  {
    await this.close();
    return false;
  }

  async values()
  {
    await super.values({cols : 'color'});
    this.initpar.showids.forEach ( (item) =>
    {
      this.obj.inputs[item].setValue(this.config.dependweblet.obj.run.values[item]);
    });
    
    this.setColor( this.obj.run.values.color, false);
  }
}

export default MneColor;

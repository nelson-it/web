//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/vcard/import.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneView   from '/weblet/basic/view.mjs'
import MneWeblet from '/weblet/basic/weblet.mjs'

class MneVcardImport extends MneView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      delbutton : [ 'ok', 'del', 'cancel', 'add'],
      hinput : false
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  reset()
  {
    super.reset();
    this.setbuttonpar('ok', 'value', MneText.getText("#mne_lang#Import#")); 

    eval("this.obj.map = { " + this.initpar.map + "}" );
    
    this.obj.read = [];
    this.obj.read["VERSION"] = function(label, value)
    {
      if ( value != "3.0") MneLog.warning("#mne_lang#Vcard Version ist unbekannt - es kann zu Fehlern kommen");
    };

    this.obj.read["N"] = function(label, value)
    {
      var vals = value.split(';');
      var name      = ( vals.length > 0 ) ? vals[0] : "";
      var firstname = ( vals.length > 1 ) ? vals[1] : "";
      var midname   = ( vals.length > 2 ) ? " " + vals[2] : "";
      
      this.setImport("Name", { lastname : name, firstname : firstname + midname } );
    };
    
    this.obj.read["FN"] = function( label, value )
    {
      this.setImport("Fullname", { fullname : value } );
    };
    
    this.obj.read["ADR"] = async function(label, value)
    {
      var labs = label.split(';');
      var i,j;
      var fillin = false;

      for ( i = 0; i<labs.length; i++ )
      { 
        if ( ( j = labs[i].indexOf("type=")) >= 0 ) labs[i] = labs[i].substring(j+5);
        if ( labs[i].toUpperCase() == 'WORK' || typeof this.obj.addr == 'undefined' ) { fillin = true; break; } 
      }

      var vals = value.split(';');
      var p1       = ( vals.length > 0 ) ? vals[0] : "";
      var p2       = ( vals.length > 1 ) ? " " + vals[1] : "";
      var strasse  = ( vals.length > 2 ) ? vals[2] : "";
      var ort      = ( vals.length > 3 ) ? vals[3] : "";
      var plz      = ( vals.length > 5 ) ? vals[5] : "";

      if ( fillin )
      {
        var param =
        { 
            schema : 'mne_crm',
            table : 'city',
            cols : 'cityid',
            "cityInput.old" : ort,
            "postcodeInput.old" : plz,
            "sqlend" : 1
        };

        var res = await MneRequest.fetch("/db/utils/table/data.json", param);
        if ( res.values.length == 0 )
          await MneRequest.fetch( "/db/utils/table/insert.json",  { schema : 'mne_crm', table : 'city', nameInput : ort, postcodeInput : plz, cityidInput: '################', sqlend : 1 } );

        res = await MneRequest.fetch( "/db/utils/table/data.json",  param)

        if ( res.values.length > 0 ) 
          this.setImport ("Adresse", { postbox : p1 + p2, street : strasse, city : ort, postcode : plz, cityid : res.values[0][0] } );
        else
          this.setImport ("Adresse", { postbox : p1 + p2, street : strasse, city : ort, postcode : plz } );
      }
    }

    this.obj.read["EMAIL"] = function(label, value)
    {
      this.setImport("Email", { email : value } );
    };

    this.obj.read["TEL"] = function(label, value)
    {
      var labs = label.split(';');
      var i,j;
      
      for ( i = 0; i<labs.length; i++ )
      { 
        if ( ( j = labs[i].indexOf("type=")) >= 0 ) labs[i] = labs[i].substring(j+5);
        if ( labs[i].toUpperCase() == 'WORK' || labs[i].toUpperCase() == 'VOICE')  this.setImport("Telwork",  { telwork : value } );
        if ( labs[i].toUpperCase() == 'HOME' )  this.setImport("Telhome",  { telhome : value } );
        if ( labs[i].toUpperCase() == 'CELL' )  this.setImport("Telnatel", { telnatel : value} );
      }
    };
    
    this.obj.read["URL"] = function(label, value )
    {
      this.setImport("Http", { http : value } );
    };

    this.obj.dragstart = (evt) => { evt.stopImmediatePropagation(); evt.dataTransfer.setData("text", evt.target.innerText); evt.dataTransfer.items.add(this, 'id') };
    this.obj.dragend   = (evt) => { if ( MneWeblet.dropok ) MneElement.mkClass(evt.target, 'dropok' ) };

  }

  getViewPath() { return this.getView(import.meta.url) }
  //getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  async load ()
  {
     await super.load();
     this.obj.container.data.addEventListener('dragstart', (evt) => { evt.preventDefault() });
     this.obj.files.file.addEventListener('change', (evt) => { this.ok(); }, false);
  }
  
  newtabline(name, value)
  {
    this.obj.datatab.appendChild(document.createElement('div'));
    this.obj.datatab.lastChild.className = "inputsingle";
    this.obj.datatab.lastChild.innerHTML = '<span class="label">' + name + '</span><span class="output" draggable="true">' + value + '</span><span class="label">' + MneText.getText('#mne_lang#ignorieren') + '</span><span>' + MneElement.getInput('checkbox', '<input id="ignore" type="checkbox" />') + '</span>';
    
    this.obj.datatab.lastChild.children[1].addEventListener('dragstart', this.obj.dragstart );
    this.obj.datatab.lastChild.children[1].addEventListener('dragend',   this.obj.dragend   );
    
    var datafield = this.obj.datatab.lastChild.children[1];
    this.obj.datatab.lastChild.querySelector('#ignore + label').addEventListener('click',  (evt) => { MneElement.mkClass(datafield, 'dropok', evt.target.previousSibling.checked )});
  }
  
  setImport = function(typ, value )
  {
    var i = null;
    
      var inputs = this.parent.obj.inputs;
      
      for ( i in value )
      {
        if ( typeof this.obj.map[i] != 'undefined' )
        {
          if ( this.obj.map[i] != ''  )
          {
            if ( typeof inputs[this.obj.map[i]] != 'undefined' && inputs[this.obj.map[i]].value == '' )
            {
              var v = value[i];
              delete value[i];
              inputs[this.obj.map[i]].modValue( v );
            }
          }
          else
          {
            delete value[i];
          }
        }
        else if ( typeof inputs[i] != 'undefined' && inputs[i].value == '' )
        {
          var v = value[i];
          delete value[i];
          inputs[i].modValue(v);
        }
      }
      if ( typeof this.parent.setVcard == 'function' )
      {
        for ( i in value )
        {
          var v = value[i];
          if ( this.parent.setVcard(i, v) == true )
            delete value[i];
        }  
      }

    for ( i in value )
      this.newtabline(i,value[i]);
  }
 
  async addline (str)
  {
    var i;
    var elements = str.replace('\\:', '####################').split(":");
    var group,label;
    
    elements.forEach((item,index) => { elements[index] = item.replace('####################', ':') });
    
    var vals = elements[0].split(";");
    if ( ( i = vals[0].indexOf('.')) >= 0 )
    {
      group = vals[0].substr(0,i-1);
      label = vals[0].substr(i + 1);
    }
    else
    {
      label = vals[0];
      group = "";
    }

    if ( this.obj.read[label.toUpperCase()] )
    {
      if ( group == "" || this.obj.group != group )
        await this.obj.read[label.toUpperCase()].call(this, elements[0], elements[1], elements[2], elements[4]);
    }
    else
    {
      if ( group == "" || this.obj.group != group )
        this.newtabline(elements[0], elements[1]);
    }

    this.obj.group = group;
  }

  async ok()
  {
    var reader = new FileReader();
    this.obj.container.data.className = "inputarea";
    this.obj.container.data.innerHTML = '<div class="inputgroup"></div>';
    this.obj.datatab = this.obj.container.data.firstChild;
    
    reader.addEventListener('load', async (evt) =>
    {
      console.log(evt.target.result);
      try {
        var i;
        var e,ee;
        var elements;
        
        elements = evt.target.result.split("\r\n");
        
        if ( elements.length < 2 ) elements = evt.target.result.split("\n");
        if ( elements.length < 2 ) elements = evt.target.result.split("\r");

        for ( i = 0; i<elements.length; i++)
          if ( elements[i].toUpperCase().indexOf("BEGIN:VCARD") != -1 ) break;

        for ( i++; i<elements.length; i++)
        {
          if ( elements[i].toUpperCase() == "END:VCARD") break;
          e = elements[i];
          while ( i+1 < elements.length && ( elements[i+1][0] == ' ' || elements[i+1][0] == '\t' ) )
          { 
            ee = elements[i+1];
            while( ee[0] == ' ' || ee[0] == '\t' ) ee = ee.substr(1);
            e = e + ee;
            i++;
          }
          await this.addline(e);
        }
      }
      catch(e)
      {
        MneLog.exception("MneVard::dataread:", e);
      }

    });
    reader.readAsText(this.obj.files.file.files[0]);
}

  async values()
  {
  }
}

export default MneVcardImport;

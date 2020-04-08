// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: weblet/basic/view.mjs
//================================================================================
'use strict';

import MneConfig  from '/js/basic/config.mjs'
import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'
import MneTheme   from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'
import MneInput   from '/js/basic/input.mjs'

import MneWeblet  from './weblet.mjs'

class MneViewWeblet extends MneWeblet
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
        {
          showids : [],
          title   : {}
        }
      super(parent, frame, id, Object.assign(ivalues, initpar), config )
    }
    
    getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }
    getViewPath() { return '' }

    reset()
    {
      super.reset();
      this.obj  = Object.assign(this.obj, { defvalues : {}, labels : {}, inputs  : {}, outputs : {}, buttons : {}, tables : {}, title : {}, container : {} });
      
      this.obj.mkbuttons = 
      [
          { id : 'ok',     value : MneText.getText('Ok')},
          { id : 'cancel', value : MneText.getText('#mne_lang#Abbrechen')},
          { id : 'add',    value : MneText.getText('#mne_lang#Hinzufügen')},
          { id : 'del',    value : MneText.getText('#mne_lang#Löschen'), space : 'after' },
      ];
      
      if ( this.initpar.report )
          this.obj.mkbuttons.push({ id : 'print',  value : this.txtGetText('#mne_lang#Drucken')});
      
      if ( this.initpar.delbutton )
        this.delbutton(this.initpar.delbutton);

    }
    
    set title(title)
    {
      if ( this.obj.title.left )
        this.obj.title.left.innerHTML = title;

      if ( this.initpar.popup )
        this.initpar.popup.setTitle(title);
    }
    
    
    async mkLabel (id, obj )
    {
      var self = this;
      this.obj.labels[id] = obj;
      
      MneElement.mkClass(obj, 'label');
      obj.setText = function(text) { this.innerText = text };
    }

    async mkOutput(id, obj )
    {
      var self = this;
      this.obj.outputs[id] = obj;
      
      MneElement.mkClass(obj, 'output');
      obj.regexp = { reg : new RegExp('.+|^$'), help : '' };
      obj.setTyp = function(dpytype, regexp, format)
      {
        this.dpytype = MneInput.getInputTyp(dpytype);
        this.regexp = regexp; 
        this.format = format;
        this.setValue(this.innerText);
      };
      
      obj.checkInput = function( ok = 'ok')
      {
        if ( this.innerText == this.getAttribute("oldvalue") ) ok = 'no';
        
        var r = this.innerText.match(this.regexp.reg);
        if ( ! r || r.length != 1 || r[0] != this.innerText )
          MneElement.mkClass(this.wrapper, 'modifywrong', true, 'modify');
        else
          MneElement.mkClass(this.wrapper, 'modify' + ok, true, 'modify');
      }
      
      obj.setValue = function(value)
      {
        this.innerText = value;
        this.setAttribute("oldvalue", value);
      }
      
      obj.modValue = function(value)
      {
        this.innerText = value;
      }
      
      obj.modClear = function()
      {
        this.setValue(this.value);
      }
 
      obj.getValue = function()
      {
        return this.innerText;
      }
      
      obj.getModify = function()
      {
        return ( this.value != this.oldvalue );
      }

      obj.observer = new MutationObserver((mut) => 
      {
        var i;
        for ( i =0; i<mut.length; ++i )
          obj.checkInput( ( mut[i].type == "attributes" ) ? 'no' : 'ok');
       });
      obj.observer.observe(obj, { childList: true, subtree: true, attributes : true, attributeFilter: [ 'oldvalue' ] } );
    }

    async mkInput (id, obj )
    {
      this.obj.inputs[id] = obj;

      obj.regexp = { reg : new RegExp('.+|^$'), help : '' };
      
      obj.setValue = function(value)
      {
        this.value = this.oldvalue = value;
        this.setAttribute('value', value)
        this.setAttribute('oldvalue', value)
        
        if ( this.type == "checkbox" )
          this.checked = ( value == MneText.getText("#mne_lang#wahr"))
      }
      
      obj.modValue = function(value)
      {
        this.value = value;
        this.setAttribute('value', value);
      }
      
      obj.modClear = function()
      {
        this.setValue(this.value);
      }

      obj.getValue = function()
      {
        if ( MneElement.hasClass(this.wrapper, 'modifywrong') )
        {
          var l = this.obj.labels[this.id];
          throw new Error(MneText.sprintf(MneText.getText("#mne_lang#Bitte einen Wert für <$1> angeben"), ( l ) ? label.innerText : this.id ));
        }
        switch(this.type)
        {
          case "checkbox":
            return ( this.checked ) ? 1 : 0;
            break;

          default:
            return this.value;
            break;
        }
      }
      
      obj.getModify = function()
      {
        return ( this.value != this.oldvalue );
      }
      
      
      if ( this['mkInput' + obj.tagName] ) return this['mkInput' + obj.tagName](id, obj);
    }

    async mkInputINPUT (id, obj )
    {
      if ( this.initpar.hinput && obj.type == 'hidden') { obj.type = "text";}

      obj.setTyp = function(dpytype, regexp, format)
      {
        this.dpytype  = MneInput.getInputTyp(dpytype);
        this.format   = format;

        switch(this.type)
        {
          case "checkbox":
            break;

          default:
            this.regexp   = regexp;
          this.pattern  = regexp.reg.toString();
          this.pattern  = this.pattern.substring(1, this.pattern.length - 1)
          this.required = ( ! regexp.reg.test('') );
          break;
        }
        
        this.oldvalue = this.value
      };

      obj.checkInput = function(mut)
      {
        if ( mut.attributeName == 'checked' ) this.value = ( this.checked ) ? MneText.getText('#mne_lang#wahr') : MneText.getText('#mne_lang#falsch');
        MneElement.mkClass(obj.wrapper, ( this.value == this.oldvalue ) ? 'modifyno' : 'modifyok', true, 'modify')
      }
      
      obj.addEventListener('input', () => { obj.checkInput({}); })
      
      obj.observer = new MutationObserver((mut) => 
      {
        var i;
        for ( i =0; i<mut.length; ++i )
          obj.checkInput(mut[i]);
       });
      obj.observer.observe(obj, { childList: true, subtree: true, attributes : true, attributeFilter: [ 'value', 'checked' ] } );

    }

    async mkInputSELECT (id, obj)
    {
      obj.setTyp = function(dpytype, regexp, format)
      {
        this.dpytype  = MneInput.getInputTyp(dpytype);
        this.format   = format;

        this.regexp   = regexp;
        this.oldvalue = this.value
      };

      obj.checkMutation = function(mut)
      {
        var i;
        var r;
        
        for ( i=0; i<this.options.length; ++i)
          if ( this.options[i].value == this.value ) break;

        MneElement.mkClass(this.wrapper, 'modifyno', true, 'modify')
        if ( i == this.options.length || ( r = this.value.match(this.regexp.reg) ) == null || r.length != 1 )
        {
          MneElement.mkClass(this.wrapper, 'modifywrong', true, 'modify')
        }
      }

      obj.checkInput = function()
      {
        var r;
        
        if ( ( r = this.value.match(this.regexp.reg) ) == null || r.length != 1 )
          MneElement.mkClass(this.wrapper, 'modifywrong', true, 'modify')
        else
          MneElement.mkClass(this.wrapper, ( this.value == this.oldvalue ) ? 'modifyno' : 'modifyok', true, 'modify')
      }

      obj.observer = new MutationObserver((mut) => { obj.checkMutation(mut) });
      obj.observer.observe(obj, { childList: true, subtree: true, attributes : true, attributeFilter: [ 'value', 'oldvalue' ]} );
      
      obj.addEventListener('change', () => { obj.checkInput(); })
    }

    async mkSlider(id, obj )
    {
      return this.mkInput(id, obj);
    }

    async mkButton (id, obj, data = {}, clickid )
    {
      var self = this;

      clickid = ( clickid ) ? clickid : id;
      this.obj.buttons[id] = obj;
      obj.addEventListener('click', (evt) => { self.btnClick(clickid, data, obj, evt); });
    }


    findIO()
    {
      var i;
      var obj;
      var self = this;
      var p = [];
      
      var frame = this.frame

      obj = frame.querySelectorAll("[id$='Label']");
      for ( i = 0; i< obj.length; i++)
        p.push(this.mkLabel(obj[i].id.substr(0, obj[i].id.indexOf("Label")), obj[i]));

      obj = frame.querySelectorAll("[id$='Output']");
      for ( i = 0; i< obj.length; i++)
        p.push(this.mkOutput(obj[i].id.substr(0, obj[i].id.indexOf("Output")), obj[i]));
        
      obj = frame.querySelectorAll("[id$='Input']");
      for ( i = 0; i< obj.length; i++)
        p.push(this.mkInput(obj[i].id.substr(0, obj[i].id.indexOf("Input")), obj[i]));

      obj = frame.querySelectorAll("[id$='Slider']");
      for ( i = 0; i< obj.length; i++)
        p.push(this.mkSlider(obj[i].id.substr(0, obj[i].id.indexOf("Slider")), obj[i]));
        
      obj = frame.querySelectorAll("[id$='Button']");
      for ( i = 0; i< obj.length; i++)
        p.push(this.mkButton(obj[i].id.substr(0, obj[i].id.indexOf("Button")), obj[i], {}));

      obj = frame.querySelectorAll("[id$='Link']");
      for ( i = 0; i< obj.length; i++)
        p.push(this.mkButton(obj[i].id.substr(0, obj[i].id.indexOf("Link")), obj[i], {} ));
        
      obj = frame.querySelectorAll("[id$='Table']");
      for ( i = 0; i< obj.length; i++)
      {
        this.obj.tables[obj[i].id.substr(0, obj[i].id.indexOf("Table"))] = obj[i];
      }

      obj = frame.querySelectorAll("[id$='Container']");
      for ( i = 0; i< obj.length; i++)
        this.obj.container[obj[i].id.substr(0, obj[i].id.indexOf("Container"))] = obj[i];
      
      return Promise.all(p);
    }
    
    async modClear()
    {
      var i;
      for ( i in this.obj.inputs ) this.obj.inputs[i].modClear();
      for ( i in this.obj.outputs ) this.obj.outputs[i].modClear();
    }
    
    getModify()
    {
      var i;
      for ( i in this.obj.inputs ) if ( this.obj.inputs[i].getModify() ) return true;
      for ( i in this.obj.outputs ) if ( this.obj.outputs[i].getModify() ) return true;
      
      return false;
    }
    
    delbutton(ids)
    {
      var i,j;
      var b = this.obj.mkbuttons;
      var id;

      if ( typeof ids == 'string') ids = ids.split(',');

      for ( j = 0; j<ids.length; j++)
      {
        id = ids[j];
        for ( i=0; i<b.length; i++)
        {
          if ( b[i].id == id )
          {
            b.splice(i,1);
            break;
          }
        }
      }
    }

    async loadbutton()
    {
      var i;
      var b = this.obj.mkbuttons;
      var eb = [];
      var bsize = 0;

      if ( ! this.obj.container.button ) return;
      
     for ( i=0; i<b.length; i++)
      {
        if ( b[i].show != false )
        {
          var id = b[i].id;
          var value = b[i].value;
          var ele;
          var behind = this.obj.container.button.querySelector('#' + b[i].behind + "Button");
          if ( behind != null ) behind = behind.nextSibling;
          else behind = this.obj.container.button.querySelector('#' + b[i].before + "Button");

          eb.push(id);

          if ( b[i].space == 'before' )
          {
            ele = document.createElement('div');
            ele.className = 'webletbutton';
            this.obj.container.button.insertBefore(ele, behind);
            behind = ele.nextSibling;
          }

          ele = document.createElement('input');
          ele.type = 'button';
          ele.className = 'webletbutton';
          if ( b[i].font ) ele.style.fontFamily = b[i].font;

          this.obj.buttons[id] = ele;
          ele.id = id + "Button";
          this.mkButton(id, ele )
          ele.value = value;
          ele.disabled = b[i].disable;
          MneElement.mkInputsSingle(ele);
          MneElement.mkClass(ele.wrapper, id );
          if ( b[i].classname ) MneElement.mkClass(ele.wrapper, b[i].classname );
          this.obj.container.button.insertBefore(ele, behind);
          behind = ele.nextSibling;
          if ( b[i].size != 'nosize'  && bsize < parseInt(ele.scrollWidth) ) bsize = parseInt(ele.scrollWidth);

          if ( b[i].space == 'behind' )
          {
            ele = document.createElement('div');
            ele.className = 'webletbutton';
            this.obj.container.button.insertBefore(ele, behind);
          }
        }
      }
      if ( typeof this.obj.enablebuttons == 'undefined' ) this.obj.enablebuttons = eb;
 
    }
    
    async loadview()
    {
        if ( ! MneWeblet.contentframe )
          MneWeblet.contentframe = await MneRequest.fetch('/view/basic/view.html');

        if ( this.initpar.nowebletframe )
        {
          this.obj.container.content = this.frame;
        }
        else
        {
          this.frame.innerHTML = MneWeblet.contentframe;

          this.obj.container.content = this.frame.querySelector('#contentContainer');
          this.obj.container.title   = this.frame.querySelector('#titleContainer');
          this.obj.container.button  = this.frame.querySelector('#buttonContainer');
          
          this.obj.title.left       = this.obj.container.title.querySelector("#weblettitleleft");
          this.obj.title.middle     = this.obj.container.title.querySelector("#weblettitlemiddle");
          this.obj.title.right      = this.obj.container.title.querySelector("#weblettitleright");

          this.title = ( this.config.label ) ? this.config.label : this.id;
          MneElement.mkClass(this.obj.container.title, 'notitle', this.initpar.notitle == true );
        }

        if ( this.getViewPath() != '' )
        {
          var data = await MneRequest.fetch('view/' + this.getViewPath());
          this.obj.container.content.innerHTML = data;
        }
        
        MneElement.mkElements(this.frame);

        await this.findIO();
    }
    
    async load()
    {
      await super.load();
      
      this.obj.run.title =
      {
        add : ( this.initpar.title.add ) ? this.initpar.title.add : (( MneConfig.language == 'en' ) ? MneText.getText("#mne_lang#hinzufügen") + " " : '' ) + this.config.label + (( MneConfig.language != 'en' ) ? " " + MneText.getText("#mne_lang#hinzufügen") : '' ),
        mod : ( this.initpar.title.mod ) ? this.initpar.title.mod : (( MneConfig.language == 'en' ) ? MneText.getText("#mne_lang#bearbeiten") + " " : '' ) + this.config.label + (( MneConfig.language != 'en' ) ? " " + MneText.getText("#mne_lang#bearbeiten") : '' )
      } 
      await this.loadview();
      await this.loadbutton();
    }
    
    async reload()
    {
      await this.parent.reloadWeblet(this.id)
    }

 }
 



export default MneViewWeblet;

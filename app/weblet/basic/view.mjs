//================================================================================

//Copyright: M.Nelson - technische Informatik
//Die Software darf unter den Bedingungen 
//der APGL ( Affero Gnu Public Licence ) genutzt werden

//datei: weblet/basic/view.mjs
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

export class MneViewContainer extends MneWeblet
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        title   : {},
        
        showids : []
    }

    super(parent, frame, id, Object.assign(ivalues, initpar), config )
  }

  getViewPath() { return ''; }

  reset()
  {
    super.reset();
    Object.assign(this.obj, { title : {}, buttons : {}, container : {}})
    this.obj.run.title =
    {
        add : ( this.initpar.title.add ) ? this.initpar.title.add : (( MneConfig.language == 'en' ) ? MneText.getText("#mne_lang#hinzufügen") + " " : '' ) + this.config.label + (( MneConfig.language != 'en' ) ? " " + MneText.getText("#mne_lang#hinzufügen") : '' ),
        mod : ( this.initpar.title.mod ) ? this.initpar.title.mod : (( MneConfig.language == 'en' ) ? MneText.getText("#mne_lang#bearbeiten") + " " : '' ) + this.config.label + (( MneConfig.language != 'en' ) ? " " + MneText.getText("#mne_lang#bearbeiten") : '' )
    }

    if ( this.initpar.showalias )
    {
      var self = this;
      var alias = this.initpar.showalias;
      var dw = () => { return self.config.dependweblet };

      this.initpar.showalias = {};
      alias.forEach((item, index) =>
      {
        try { alias[index] = eval(item) } catch (e) { alias[index] = item }; 
        if ( typeof alias[index] != 'function' )
        {
          var val = alias[index];
          var fval;
          if ( val[0] == '#' )
            fval = () => { return val.substring(1); };
          else if ( val[0] == '?')
            fval = () => { return dw().obj.inputs[val].getValue(); };
          else
            fval = () => { return dw().obj.run.values[val]; } ;

          this.initpar.showalias[index] = fval;
        }
      });
    }
    
    this.initpar.okids  = this.initpar.okids  ?? this.initpar.showids;
    this.initpar.modids = this.initpar.modids ?? this.initpar.okids ?? this.initpar.showids;
    this.initpar.delids = this.initpar.delids ?? this.initpar.okids ?? this.initpar.showids;

  }

  async mkButton (id, obj, data = {}, clickid )
  {
    var self = this;

    clickid = ( clickid ) ? clickid : id;
    this.obj.buttons[id] = obj;
    if ( this.initpar.buttonlabel && this.initpar.buttonlabel[id]) obj.value = this.initpar.buttonlabel[id];

    obj.addEventListener('click', (evt) => { self.btnClick(clickid, data, obj, evt); });
    obj.setAttribute('shortid', id);
  }

  async findIO(frame)
  {
    var i;
    var obj;
    var p = [];

    frame = ( frame ) ? frame : this.frame;

    obj = frame.querySelectorAll("[id$='Container']");
    for ( i = 0; i< obj.length; i++)
      this.obj.container[obj[i].id.substr(0, obj[i].id.indexOf("Container"))] = obj[i];
   
    if ( this.obj.container.title )
    {
      this.obj.title.left       = this.obj.container.title.querySelector("#weblettitleleft");

      this.obj.title.middle     = this.obj.container.title.querySelector("#weblettitlemiddle");
      this.obj.title.right      = this.obj.container.title.querySelector("#weblettitleright");

      this.title = ( this.config.label ) ? this.config.label : this.id;
      MneElement.mkClass(this.obj.container.title, 'notitle',      this.initpar.notitle == true );
      MneElement.mkClass(this.obj.container.title, 'notitleframe', this.initpar.notitleframe == true );
    }

    if ( this.initpar.nobuttonframe )
        this.obj.container.button = undefined;
   

    obj = frame.querySelectorAll("[id$='Button']");
    for ( i = 0; i< obj.length; i++)
      p.push(this.mkButton(obj[i].id.substr(0, obj[i].id.indexOf("Button")), obj[i], {}));
    
    return Promise.all(p);
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

      this.obj.container.weblet  = this.frame.querySelector('#webletmain');
      this.obj.container.content = this.frame.querySelector('#contentContainer');
     
      if ( this.initpar.drop ) this.adddrop(this.frame);
    }

    if ( this.getViewPath() != '' )
    {
      var data = await MneRequest.fetch('view/' + this.getViewPath());
      this.obj.container.content.innerHTML = data;
    }

    MneElement.mkElements(this.frame);
    return this.findIO();
  }
  
  set title(title)
  {
    if ( this.obj.title.left ) this.obj.title.left.textContent = title;
  }

  async load()
  {
    await super.load();
    return this.loadview();
  }


}

export class MneView extends MneViewContainer
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
    }
    super(parent, frame, id, Object.assign(ivalues, initpar), config )
  }

  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  reset()
  {
    var self = this;

    super.reset();
    this.obj  = Object.assign(this.obj, { defvalues : {}, labels : {}, fields : [], inputs  : {}, outputs : {},  tables : {},  enablebuttons : {} });

    this.obj.mkbuttons = 
      [
        { id : 'ok',     value : MneText.getText('#mne_lang#Ok')},
        { id : 'cancel', value : MneText.getText('#mne_lang#Abbrechen')},
        { id : 'add',    value : MneText.getText('#mne_lang#Hinzufügen')},
        { id : 'del',    value : MneText.getText('#mne_lang#Löschen'), space : 'after' },
        ];

    this.obj.enablebuttons.buttons = [];
    this.obj.mkbuttons.forEach( function(item){
      self.obj.enablebuttons.buttons.push(item.id);
    });

    this.obj.enablebuttons.value = this.obj.enablebuttons.buttons.slice(0);
    this.obj.enablebuttons.add = ['ok', 'cancel', 'add']

    if ( this.initpar.report )
      this.obj.mkbuttons.push({ id : 'print',  value : MneText.getText('#mne_lang#Drucken')});

    if ( this.initpar.delbutton )
      this.delbutton(this.initpar.delbutton);

    Object.assign(this.obj.defvalues, this.initpar.defvalues );
  }

  async mkLabel (id, obj )
  {
    var self = this;
    this.obj.labels[id] = obj;

    MneElement.mkClass(obj, 'label');
    obj.setAttribute('shortid',id);
    obj.setText = function(text) { this.textContent = text };
  }

  async mkOutput(id, obj )
  {
    var self = this;
    this.obj.outputs[id] = obj;

    MneElement.mkClass(obj, 'output');

    obj.setAttribute('shortid',  id);
    obj.setAttribute('newvalue', '');
    obj.setAttribute('oldvalue', '');
    obj.regexp = MneInput.checktype.ok;
    obj.dpytype = 'char';
    obj.format = '';

    obj.setTyp = function(dpytype, regexp, format)
    {
      this.dpytype =  MneInput.getTyp( dpytype );
      this.regexp = regexp; 
      this.format = format;
    };

    Object.defineProperty(obj, 'valuetyp', { get: function() { return this.dpytype; } });

    obj.checkInput = function( ok = 'ok')
    {
      if ( this.getAttribute('newvalue') == this.getAttribute("oldvalue") ) ok = 'no';

      var r = this.textContent.match(this.regexp.reg);
      if ( ! r || r[0] != this.textContent )
        MneElement.mkClass(this.closest('.ele-wrapper'), 'modifywrong', true, 'modify');
      else
        MneElement.mkClass(this.closest('.ele-wrapper'), 'modify' + ok, true, 'modify');
    }

    obj.setValue = function(value)
    {
      this.setAttribute("newvalue", value);
      this.setAttribute("oldvalue", value);
      this.innerHTML = MneInput.format(value, this.dpytype);
    }

    obj.modValue = function(value)
    {
      this.setAttribute("newvalue", value);
      this.innerHTML = MneInput.format(value, this.dpytype);
    }

    obj.modClear = function()
    {
      this.setValue(this.getAttribute('newvalue'));
    }

    obj.getValue = function( error = true )
    {
      if ( MneElement.hasClass(this.closest('.ele-wrapper'), 'modifywrong') )
      {
        if ( error ) 
        {
          var l = self.obj.labels[this.getAttribute('shortid')];
          throw new Error(MneText.sprintf(MneText.getText('#mne_lang#Bitte einen Wert für \<$1\> angeben'), ( l ) ? l.textContent : this.id ));
        }
        return undefined;
      }

      return this.getAttribute('newvalue');
    }

    obj.getModify = function()
    {
      return ( this.getAttribute('newvalue') != this.getAttribute('oldvalue') );
    }

    obj.observer = new MutationObserver((mut) => 
    {
      var i;
      for ( i =0; i<mut.length; ++i )
        obj.checkInput( ( mut[i].type == "attributes" ) ? 'no' : 'ok');
    });
    obj.observer.observe(obj, { childList: true, subtree: true, attributes : true, attributeFilter: [ 'oldvalue',  'newvalue' ] } );
  }

  async mkInput (id, obj )
  {
    var self = this;

    this.obj.inputs[id] = obj;
    if ( obj.type != 'hidden' && obj.type != 'checkbox' )
    {
      obj.fieldnum = this.obj.fields.length;
      this.obj.fields.push(obj);
    }
    
    if ( obj.type == 'hidden' )
      obj.placeholder = id;

    MneElement.mkClass(obj, 'input');

    obj.setAttribute('shortid',  id);
    obj.setAttribute('newvalue', '');
    obj.setAttribute('oldvalue', '');
    obj.regexp = MneInput.checktype.ok;
    obj.dpytype = 'char';
    obj.format = '';

    Object.defineProperty(obj, 'valuetyp', { get: function() { return this.dpytype; } });

    obj.setValue = function(value)
    {
      if ( this.type == "checkbox" )
      {
        this.checked = MneInput.getValue(value, 'bool');
        this.setAttribute('newvalue', this.checked);
        this.setAttribute('oldvalue', this.checked);
      }
      else
      {
        this.value = MneInput.format(value, this.dpytype, this.format );
        this.setAttribute('newvalue', value);
        this.setAttribute('oldvalue', value);
      }
    }

    obj.modValue = function(value)
    {
      if ( this.type == "checkbox" )
      {
        this.checked = MneInput.getValue(value, 'bool');
        this.setAttribute('newvalue', this.checked);
      }
      else
      {
        this.value = MneInput.format(value, this.dpytype, this.format );
        this.setAttribute('newvalue', this.value);
      }
    }

    obj.modClear = function()
    {
      this.setValue(this.value);
    }

    obj.getValue = function(error = true)
    {
      if ( MneElement.hasClass(this.closest('.ele-wrapper'), 'modifywrong') )
      {
        if ( error ) 
        {
          var l = self.obj.labels[this.getAttribute('shortid')];
          throw new Error(MneText.sprintf(MneText.getText('#mne_lang#Bitte einen Wert für \<$1\> angeben'), ( l ) ? l.textContent : this.id ));
        }
        return undefined;
      }

      switch(this.type)
      {
        case "checkbox":
          return ( this.checked ) ? 1 : 0;
          break;

        default:
          return MneInput.getValue(this.getAttribute('newvalue'), this.dpytype );
        break;
      }
    }

    obj.getModify = function()
    {
      return ( this.getAttribute('newvalue') != this.getAttribute('oldvalue') );
    }


    if ( this['mkInput' + obj.tagName] ) return this['mkInput' + obj.tagName](id, obj);
  }

  async mkInputSPAN ( id, obj)
  {
    var self = this;
    var ele = document.createElement('span');
    
    obj.contentEditable = 'true';  
    obj.spellcheck = false;

    obj.setTyp = function(dpytype, regexp, format)
    {
      this.dpytype = MneInput.getTyp(dpytype);
      this.regexp = ( MneInput.checktype[MneInput.getRegexptyp(this.dpytype)] != undefined  && regexp.reg.toString() == MneInput.checktype.ok.reg.toString() ) ? MneInput.checktype[MneInput.getRegexptyp(this.dpytype)] : regexp;
      this.format = format;

      if ( this.regexp.help )
      {
        this.help = document.createElement('span');
        this.help.className='hint';
        this.help.textContent=this.regexp.help;

        this.parentNode.insertBefore(this.help, this.nextSibling);
      }
      else if ( this.help )
      {
        this.help.parentNode.removeChild(this.help);
        this.help = undefined;
      }
    };

    obj.checkInput = function( ok = 'ok')
    {
      if ( this.getAttribute('newvalue') == this.getAttribute('oldvalue') ) ok = 'no';

      var r = this.innerText.match(this.regexp.reg);
      if ( ! r || r[0] != this.innerText )
        MneElement.mkClass(this.closest('.ele-wrapper'), 'modifywrong', true, 'modify');
      else
      {
        MneElement.mkClass(this.closest('.ele-wrapper'), 'modify' + ok, true, 'modify');
      }
    }

    obj.setValue = function(value)
    {
      this.innerText = String(MneInput.format(value, this.dpytype, this.format)).replace(/ /g, "\u00A0");
      this.setAttribute("newvalue", value);
      this.setAttribute("oldvalue", value);
    }

    obj.modValue = function(value)
    {
      this.innerText = String(MneInput.format(value, this.dpytype, this.format)).replace(/ /g, "\u00A0");
      this.setAttribute("newvalue", value);
    }

    obj.modClear = function()
    {
      this.setAttribute('oldvalue', this.getAttribute('newvalue'));
    }

    obj.getValue = function(error)
    {
      if ( MneElement.hasClass(this.closest('.ele-wrapper'), 'modifywrong') )
      {
        if ( error ) 
        {
          var l = self.obj.labels[this.getAttribute('shortid')];
          throw new Error(MneText.sprintf(MneText.getText('#mne_lang#Bitte einen Wert für \<$1\> angeben'), ( l ) ? l.innerText : this.id ));
        }
        return undefined;
      }
      return MneInput.getValue(this.getAttribute('newvalue').replace(/\u00A0/g,' '), this.dpytype );
    }

    obj.getModify = function()
    {
      return ( this.getAttribute('newvalue') != this.getAttribute('oldvalue') );
    }

    obj.observer = new MutationObserver((mut) => { obj.checkInput(); });
    obj.observer.observe(obj, { characterData: true, attributes: true, childList: false, subtree: false, characterDataOldValue : false, attributeFilter: [ 'newvalue', 'oldvalue' ] } );

    obj.addEventListener('paste', (evt, data) =>
    {
      let paste = (evt.clipboardData || window.clipboardData).getData('text');
      paste = ( obj.getAttribute('aria-multiline') != undefined ) ? paste : paste.replace(/[\n\r]/g, '');
   
      const selection = window.getSelection();
      if (!selection.rangeCount) return false;
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(paste));
      selection.getRangeAt(0).collapse(false);
      evt.preventDefault();
      
      obj.setAttribute('newvalue', MneInput.getValue(obj.innerText, obj.dpytype ));
  });

    obj.addEventListener('input', function (evt)
    {
      this.setAttribute('newvalue', MneInput.getValue(this.innerText, this.dpytype ));
    });

    obj.addEventListener('keypress', (evt) => { if ( ! obj.getAttribute('aria-multiline') && evt.key == 'Enter') evt.preventDefault(); });
  }

  async mkInputINPUT (id, obj )
  {
    if ( this.initpar.hinput && obj.type == 'hidden') { obj.type = "text";}

    obj.setTyp = function(dpytype, regexp, format)
    {
      this.dpytype  = MneInput.getTyp(dpytype);
      this.format   = format;

      this.regexp = ( MneInput.checktype[MneInput.getRegexptyp(this.dpytype)] != undefined  && regexp.reg.toString() == MneInput.checktype.ok.reg.toString() ) ? MneInput.checktype[MneInput.getRegexptyp(this.dpytype)] : regexp;
      if ( this.regexp.help  && this.type != 'checkbox' )
      {
        this.help = document.createElement('span');
        this.help.className='hint';
        this.help.textContent=this.regexp.help;

        this.parentNode.insertBefore(this.help, this.nextSibling);
      }
      else if ( this.help )
      {
        this.help.parentNode.removeChild(this.help);
        this.help = undefined;
      }
    };

    obj.checkInput = function( ok = 'ok')
    {
      if ( this.type == 'checkbox' )
        this.setAttribute('newvalue', this.checked );

      var r = this.value.match(this.regexp.reg);
      if ( this.type != 'checkbox'  && (! r || r[0] != this.value) )
        MneElement.mkClass(this.closest('.ele-wrapper'), 'modifywrong', true, 'modify');
      else
        MneElement.mkClass(this.closest('.ele-wrapper'), 'modify' + (( this.getAttribute('newvalue') == this.getAttribute('oldvalue') ) ? 'no' : ok ), true, 'modify');
    }

    obj.addEventListener('input', function() { this.setAttribute('newvalue', MneInput.getValue(this.value, this.dpytype)); })

    obj.observer = new MutationObserver((mut) => { obj.checkInput(); });
    obj.observer.observe(obj, { childList: false, subtree: false, attributeOldValue: true, attributes : true, attributeFilter: [ (( obj.type == 'checkbox' ) ? 'checked' : 'newvalue' ), 'oldvalue' ] } );

  }

  async mkInputSELECT (id, obj)
  {
    obj.setTyp = function(dpytype, regexp, format)
    {
      this.dpytype  = dpytype;
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

      MneElement.mkClass(this.closest('.ele-wrapper'), 'modify' + (( this.getAttribute('newvalue') == this.getAttribute('oldvalue') ) ? 'no' : 'ok'), true, 'modify')
      if ( i == this.options.length || ( r = this.value.match(this.regexp.reg) ) == null || r.length != 1 )
        MneElement.mkClass(this.closest('.ele-wrapper'), 'modifywrong', true, 'modify')
    }

    obj.observer = new MutationObserver((mut) => { obj.checkMutation(mut) });
    obj.observer.observe(obj, { childList: true, subtree: true, attributes : true, attributeFilter: [ 'newvalue', 'oldvalue' ]} );

    obj.addEventListener('change', function() { this.setAttribute('newvalue', this.value); })
  }

  async mkSlider(id, obj )
  {
    return this.mkInput(id, obj);
  }


  async findIO(frame)
  {
    var i;
    var obj;
    var self = this;
    var p = [];

    frame = ( frame ) ? frame : this.frame;

    p.push(super.findIO(frame));

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

    obj = frame.querySelectorAll("[id$='Link']");
    for ( i = 0; i< obj.length; i++)
      p.push(this.mkButton(obj[i].id.substr(0, obj[i].id.indexOf("Link")), obj[i], {} ));

    obj = frame.querySelectorAll("[id$='Table']");
    for ( i = 0; i< obj.length; i++)
    {
      this.obj.tables[obj[i].id.substr(0, obj[i].id.indexOf("Table"))] = obj[i];
    }

    await Promise.all(p);
  }

  modClear()
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
  
  getValue(id)
  {
    if ( this.obj.inputs[id] ) return this.obj.inputs[id].getValue();
    return this.obj.run.values[id];
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
        MneElement.mkClass(ele.closest('.ele-wrapper'), id );
        if ( b[i].classname ) MneElement.mkClass(ele.closest('.ele-wrapper'), b[i].classname );
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
  }

  enable( id, enable = true )
  {
    var i;

    var self = this;

    var all     = this.obj.enablebuttons.buttons;
    var buttons = this.obj.enablebuttons[id];

    if ( buttons )
    {
      all.forEach( (item) => 
      {
        try { self.obj.buttons[item].disabled = true; } catch (e) {}       
      });
      buttons.forEach( (item) => 
      {
        try { self.obj.buttons[item].disabled = ! enable; } catch (e) {}       
      });
    }
    else
    {
      all.forEach( (item) => 
      {
        try { self.obj.buttons[item].disabled = ! enable; } catch (e) {}       
      });
    }
  }

  async load()
  {
    await super.load();

    var self = this;
    this.obj.container.content.addEventListener('keydown',  async (evt) => { if ( ! evt.target.getAttribute('aria-multiline') && evt.target.tagName != 'TEXTAREA' &&  evt.key == 'Tab') { await self.btnClick('tab', {}, self.obj.container.content, evt ); } });
    this.obj.container.content.addEventListener('keypress', async (evt) => { if ( ! evt.target.getAttribute('aria-multiline') && evt.target.tagName != 'TEXTAREA' &&  evt.key == 'Enter') { await self.btnClick('enter', {}, self.obj.container.content, evt ); } });

    await this.loadbutton();
  }

  async enter()
  {
    return this.ok();
  }

  async tab(data, obj, evt )
  {
    evt.preventDefault();
    evt.stopPropagation();

    if ( evt.target.fieldnum != undefined )
    {
      var field = evt.target.fieldnum + 1;
      this.obj.fields[ ( field < this.obj.fields.length ) ? field : 0].focus();
    }

    return false;
  }

  async ok()
  {
  }
}

export default MneView;

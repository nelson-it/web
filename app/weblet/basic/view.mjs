//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/view.mjs
//================================================================================
'use strict';

import MneConfig  from '/js/basic/config.mjs'
import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'
import MneTheme   from '/js/basic/theme.mjs'
import MneElement from '/weblet/basic/element.mjs'
import MneInput   from '/js/basic/input.mjs'
import MneRte     from '/js/editor/editor.mjs'

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
    Object.assign(this.obj, { title : {}, buttons : {}, container : {}, htmlcontent : '' })
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
        try { this.initpar.showalias[index] = eval(item) } catch (e) {}; 
        if ( typeof this.initpar.showalias[index] != 'function' )
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
    this.initpar.delids = this.initpar.delids ?? this.initpar.okids ?? this.initpar.showids;

  }

  async mkButton (id, obj, data = {}, clickid )
  {
    var self = this;

    clickid = ( clickid ) ? clickid : id;
    this.obj.buttons[id] = obj;
    if ( this.initpar.buttonlabel && this.initpar.buttonlabel[id]) obj.value = this.initpar.buttonlabel[id];

    obj.mne_data = data;
    obj.addEventListener('click', (evt) => { self.btnClick(clickid, data, obj, evt);});
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
    else
      {
      this.obj.container.content.innerHTML = this.obj.htmlcontent;
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
  
  async view(data, obj, evt)
  {
    var config = this.config;
    this.reset();
    this.config = config;
    this.obj.run.viewnum = ( obj.checked ) ? "1" : "2";
    await this.load();
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
    this.obj  = Object.assign(this.obj, { defvalues : {}, labels : {}, fields : [], inputs  : {}, outputs : {},  tables : {},  sliders : {}, checkboxs : {},  files : {}, enablebuttons : {} });

    this.obj.mkbuttons = 
      [
        { id : 'ok',     value : MneText.getText('#mne_lang#Ok')},
        { id : 'cancel', value : MneText.getText('#mne_lang#Abbrechen')},
        { id : 'add',    value : MneText.getText('#mne_lang#Hinzufügen')},
        { id : 'del',    value : MneText.getText('#mne_lang#Löschen'), space : 'after' },
        ];

    if ( this.initpar.report )
      this.obj.mkbuttons.push({ id : 'print',  value : MneText.getText('#mne_lang#Drucken')});

    this.obj.enablebuttons.buttons = [];
    this.obj.mkbuttons.forEach( function(item){
      self.obj.enablebuttons.buttons.push(item.id);
    });

    this.obj.enablebuttons.value = this.obj.enablebuttons.buttons.slice(0);
    this.obj.enablebuttons.add = ['ok', 'cancel', 'add']

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
    obj.setValue = obj.modValue = function(text) { this.textContent = text };
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
      MneElement.mkClass(obj, "dpytype" + this.dpytype, true, "dpytype");
    };

    Object.defineProperty(obj, 'valuetyp', { get: function() { return this.dpytype; } });

    obj.checkInput = ( ok = 'ok') =>
    {
      if ( obj.getAttribute('newvalue') == obj.getAttribute("oldvalue") ) ok = 'no';

      var r = obj.textContent.match(obj.regexp.reg);
      if ( ! r || r[0] != obj.textContent )
      {
        MneElement.mkClass(obj.closest('.ele-wrapper'), 'modifywrong', true, 'modify');
        if ( obj.dpytype == 'color' && this.obj.labels[obj.getAttribute('shortid')] ) MneElement.mkClass(this.obj.labels[obj.getAttribute('shortid')].closest('.ele-wrapper'), 'modifywrong', true, 'modify');
      }
      else
      {
        MneElement.mkClass(obj.closest('.ele-wrapper'), 'modify' + ok, true, 'modify');
        if ( obj.dpytype == 'color' && this.obj.labels[obj.getAttribute('shortid')] ) MneElement.mkClass(this.obj.labels[obj.getAttribute('shortid')].closest('.ele-wrapper'), 'modify' + ok, true, 'modify');
      }
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

    obj.clearValue = function()
    {
      this.setValue(this.getAttribute('oldvalue'));
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
        return this.getAttribute('newvalue');
      }

      return MneInput.getValue(this.getAttribute('newvalue'), this.dpytype, true );
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
      
      if ( obj.dpytype == 'color')
      {
        obj.style.background = '';
        obj.style.background = '#' + obj.getAttribute('newvalue');
      }
    });
    obj.observer.observe(obj, { childList: true, subtree: true, attributes : true, attributeFilter: [ 'oldvalue',  'newvalue' ] } );
  }
  
  async mkLink(id, obj)
  {
    await this.mkLabel(id, obj);
    MneElement.mkClass(obj, 'link');
    obj.addEventListener('click', (evt) =>
    {
      if ( this.initpar.links[id] )
      {
        var values = {};
        Object.keys(this.initpar.links[id].values).forEach( ( item ) => { values[item] = this.obj.run.values[this.initpar.links[id].values[item]] ?? this.obj.defvalues[this.initpar.links[id].values[item]] })
        this.showweblet(this.initpar.links[id].name, values)
      }
    });
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
        this.setAttribute('newvalue', value);
      }
    }

    obj.clearValue = function()
    {
      this.setValue(this.getAttribute('oldvalue'));
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
        return this.getAttribute('newvalue');
      }

      switch(this.type)
      {
        case "checkbox":
          return ( this.checked ) ? 1 : 0;
          break;

        default:
          return MneInput.getValue(this.getAttribute('newvalue'), this.dpytype, true );
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
    var file;
    
    obj.contentEditable = 'true';  
    obj.spellcheck = false;

    obj.setTyp = function(dpytype, regexp, format)
    {
      this.dpytype = MneInput.getTyp(dpytype);
      this.regexp = ( MneInput.checktype[MneInput.getRegexptyp(this.dpytype)] != undefined  && regexp.reg.toString() == MneInput.checktype.ok.reg.toString() ) ? MneInput.checktype[MneInput.getRegexptyp(this.dpytype)] : regexp;
      this.format = format;
      MneElement.mkClass(obj, "dpytype" + this.dpytype, true, "dpytype");

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

    obj.checkInput = ( ok = 'ok') =>
    {
      if ( obj.getAttribute('newvalue') == obj.getAttribute('oldvalue') ) ok = 'no';

      var text = obj.innerText.replace(/\n$/,'');
      var r = text.match(obj.regexp.reg);
      if ( ! r || r[0] != text )
      {
        MneElement.mkClass(obj.closest('.ele-wrapper'), 'modifywrong', true, 'modify');
        if ( obj.dpytype == 'color' && this.obj.labels[obj.getAttribute('shortid')] ) MneElement.mkClass(this.obj.labels[obj.getAttribute('shortid')].closest('.ele-wrapper'), 'modifywrong', true, 'modify');

      }
      else
      {
        MneElement.mkClass(obj.closest('.ele-wrapper'), 'modify' + ok, true, 'modify');
        if ( obj.dpytype == 'color' && this.obj.labels[obj.getAttribute('shortid')] ) MneElement.mkClass(this.obj.labels[obj.getAttribute('shortid')].closest('.ele-wrapper'), 'modify' + 'ok', true, 'modify');

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

    obj.clearValue = function()
    {
      this.setValue(this.getAttribute('oldvalue'));
    }

    obj.modClear = function()
    {
      this.setAttribute('oldvalue', this.getAttribute('newvalue'));
    }

    obj.getValue = function( error = true )
    {
      if ( MneElement.hasClass(this.closest('.ele-wrapper'), 'modifywrong') )
      {
        if ( error ) 
        {
          var l = self.obj.labels[this.getAttribute('shortid')];
          throw new Error(MneText.sprintf(MneText.getText('#mne_lang#Bitte einen Wert für \<$1\> angeben'), ( l ) ? l.innerText : this.id ));
        }
        return this.getAttribute('newvalue').replace(/\u00A0/g,' ');
      }
      return MneInput.getValue(this.getAttribute('newvalue').replace(/\u00A0/g,' '), this.dpytype, true );
    }

    obj.getModify = function()
    {
      return ( this.getAttribute('newvalue') != this.getAttribute('oldvalue') );
    }
    
    file = obj.closest('.ele-wrapper').querySelector('input[type="file"]');
    if ( file != null )
    {
      this.obj.files[id] = file;
      file.mne_output = obj;
      file.addEventListener('change', (evt) =>
      {
        if ( file.ignoredefaultlistener ) return;
        
        var f = '';
        Array.from(evt.target.files).forEach((item) => { f+= item.name + ';'});
        
        obj.modValue(f.replace(/;$/, ''));
      }, false);
    }

    obj.observer = new MutationObserver((mut) => { obj.checkInput(); });
    obj.observer.observe(obj, { characterData: true, attributes: true, childList: false, subtree: false, characterDataOldValue : false, attributeFilter: [ 'newvalue', 'oldvalue' ] } );

    obj.addEventListener('paste', (evt, data) =>
    {
      var node;
      
      let paste = (evt.clipboardData || window.clipboardData).getData('text');
      paste = ( obj.getAttribute('aria-multiline') != undefined ) ? paste : paste.replace(/[\n\r]/g, '');
      paste = paste.split('\n');
      
      if ( paste.length == 0 ) return;
      
      const selection = window.getSelection();
      if (!selection.rangeCount) return false;
      selection.deleteFromDocument();
      paste.forEach((item) =>
      {
        var n;
        if ( !node ) selection.getRangeAt(0).insertNode( ( n = document.createTextNode(item)));
        else node.parentNode.insertBefore(( n = document.createTextNode(item)), node.nextSibling)
        node = n;
        if ( paste.length > 1 ) node.parentNode.insertBefore(( n = document.createElement('br')), node.nextSibling);
        node = n;
      });
        
      let range = document.createRange();
      range.selectNode(node);
      range.collapse(false);
      selection.removeAllRanges()
      selection.addRange(range);
      
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
      MneElement.mkClass(obj, "dpytype" + this.dpytype, true, "dpytype");

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

    obj.checkInput = ( ok = 'ok') =>
    {
      if ( obj.type == 'checkbox' )
        obj.setAttribute('newvalue', obj.checked );
      
      if ( obj.dpytype == 'color')
      {
        obj.style.background = '';
        obj.style.background = '#' + obj.getAttribute('newvalue');
      }

      var ok = (( obj.getAttribute('newvalue') == obj.getAttribute('oldvalue') ) ? 'no' : ok );
      var r = obj.value.match(obj.regexp.reg);
      if ( obj.type != 'checkbox'  && (! r || r[0] != obj.value) )
      {
        MneElement.mkClass(obj.closest('.ele-wrapper'), 'modifywrong', true, 'modify');
        if ( obj.dpytype == 'color' && this.obj.labels[obj.getAttribute('shortid')] ) MneElement.mkClass(this.obj.labels[obj.getAttribute('shortid')].closest('.ele-wrapper'), 'modifywrong', true, 'modify');
      }
      else
      {
        MneElement.mkClass(obj.closest('.ele-wrapper'), 'modify' + ok, true, 'modify');
        if ( obj.dpytype == 'color' && this.obj.labels[obj.getAttribute('shortid')] ) MneElement.mkClass(this.obj.labels[obj.getAttribute('shortid')].closest('.ele-wrapper'), 'modify' + ok, true, 'modify');
      }
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
      MneElement.mkClass(obj, "dpytype" + this.dpytype, true, "dpytype");

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

  async mkFile (id, obj )
  {
    this.obj.files[id] = obj;
    obj.addEventListener('change', () => { MneElement.mkClass(obj.closest('.ele-wrapper'), 'modifyok', true, 'modify') });
    obj.getModify = function()
    {
      return ( obj.closest('.ele-wrapper').className.indexOf('modifyok') != -1 );
    }

    obj.clearModify = function()
    {
      MneElement.mkClass(obj.closest('.ele-wrapper'), 'modifyok', false, 'modify');
      obj.value = '';
      obj.parentNode.previousSibling.innerHTML = '';
    }
  }
  
  async mkEditor (id, obj )
  {
    var self = this;

    this.obj.inputs[id] = obj;

    MneElement.mkClass(obj, 'editor');

    obj.setAttribute('aria-multiline',  'true');
    obj.setAttribute('shortid',  id);
    obj.setAttribute('newvalue', '');
    obj.setAttribute('oldvalue', '');
    obj.regexp = MneInput.checktype.ok;
    obj.dpytype = 'char';
    obj.format = '';
    obj.editor = new MneRte({ frame : obj });

    Object.defineProperty(obj, 'valuetyp', { get: function() { return this.dpytype; } });

    obj.setTyp = function(dpytype, regexp, format)
    {
      this.dpytype  = dpytype;
      this.format   = format;
      MneElement.mkClass(obj, "dpytype" + this.dpytype, true, "dpytype");

      this.regexp   = regexp;
    };

    obj.setValue = function(value)
    {
        this.editor.setValue(value);
        this.setAttribute('newvalue', this.editor.getValue(true));
        this.setAttribute('oldvalue', this.editor.getValue(true));
    }

    obj.modValue = function(value)
    {
        this.editor.setValue(value);
        this.setAttribute('newvalue', this.editor.getValue(true));
    }

    obj.clearValue = function()
    {
      this.setValue(this.getAttribute('oldvalue'));
    }

    obj.modClear = function()
    {
      this.setValue(this.editor.getValue(true));
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
        return this.editor.getValue(true)
      }
      return this.editor.getValue();
    }

    obj.getModify = function()
    {
      return ( this.getAttribute('newvalue') != this.getAttribute('oldvalue') );
    }
    
    obj.observer = new MutationObserver((mut) => { obj.setAttribute('newvalue', obj.editor.getValue(true)); MneElement.mkClass(obj, ( obj.getModify() ) ? 'modifyok' : 'modifyno', true, 'modify' ) });
    obj.observer.observe(obj.editor.editarea, { childList: true, subtree: true, attributes : true } );

  }

  async mkSlider(id, obj )
  {
    this.obj.sliders[id] = obj;
    obj.innerHTML = '<div class="slider" id="slider' + id + '"></div>';
    MneElement.mkClass(obj, 'slidervalue ele-wrapper');
    
    var slider = obj.firstChild;
    
    var istouch = ('ontouchstart' in document.documentElement);
    if ( istouch )
      {
      var touchmove = (evt) =>
      {
        var pos = ( evt.targetTouches[0].clientX - slider.startx );
        if ( pos < 0 ) pos = 0;
        if ( pos > ( obj.offsetWidth - slider.offsetWidth ) ) pos = obj.offsetWidth - slider.offsetWidth;
        
        slider.style.left = pos + "px";
        
        obj.setAttribute('newvalue', pos);
      }
      
      var touchend = (evt) =>
      {
        document.removeEventListener('touchmove', touchmove );
        document.removeEventListener('touchend',  touchend   );
      }

      slider.addEventListener('touchstart', (evt) =>
      {
        slider.startx = evt.targetTouches[0].clientX - parseInt(obj.getAttribute('newvalue'));

        document.addEventListener('touchmove', touchmove );
        document.addEventListener('touchend',   touchend   );

        evt.preventDefault();
      });
      
     }
    else
    {
      var mousemove = (evt) =>
      {
        var pos = ( evt.clientX - slider.startx );
        if ( pos < 0 ) pos = 0;
        if ( pos > ( obj.offsetWidth - slider.offsetWidth ) ) pos = obj.offsetWidth - slider.offsetWidth;
        
        slider.style.left = pos + "px";
        
        obj.setAttribute('newvalue', pos);
      }

      var mouseup = (evt) =>
      {
        document.removeEventListener('mousemove', mousemove );
        document.removeEventListener('mouseup',   mouseup   );
      }

      slider.addEventListener('mousedown', (evt) =>
      {
        slider.startx = evt.clientX - parseInt(obj.getAttribute('newvalue'));

        document.addEventListener('mousemove', mousemove );
        document.addEventListener('mouseup',   mouseup   );

        evt.preventDefault();
      });
    }

    obj.setAttribute('shortid',  id);
    obj.setAttribute('newvalue', '0');
    obj.setAttribute('oldvalue', '0');
    obj.regexp = MneInput.checktype.ok;
    obj.dpytype = 'long';
    obj.format = '';

    Object.defineProperty(obj, 'valuetyp', { get: function() { return this.dpytype; } });

    obj.setValue = function(value)
    {
      this.value = MneInput.format(value, this.dpytype, this.format );
      this.setAttribute('newvalue', value);
      this.setAttribute('oldvalue', value);
    }

    obj.modValue = function(value)
    {
      this.value = MneInput.format(value, this.dpytype, this.format );
      this.setAttribute('newvalue', value);
    }

    obj.clearValue = function()
    {
      this.setValue(this.getAttribute('oldvalue'));
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
        return this.getAttribute('newvalue');
      }

      return MneInput.getValue(this.getAttribute('newvalue'), this.dpytype, true );
    }

    obj.getModify = function()
    {
      return ( this.getAttribute('newvalue') != this.getAttribute('oldvalue') );
    }
    
    obj.checkInput = function( ok = 'ok')
    {
        MneElement.mkClass(this.closest('.ele-wrapper'), 'modify' + (( this.getAttribute('newvalue') == this.getAttribute('oldvalue') ) ? 'no' : ok ), true, 'modify');
        slider.style.left = this.getAttribute('newvalue') + "px";

    }

    obj.observer = new MutationObserver((mut) => { obj.checkInput(); });
    obj.observer.observe(obj, { childList: false, subtree: false, attributeOldValue: true, attributes : true, attributeFilter: [ 'newvalue' , 'oldvalue' ] } );
  }

  async mkCheckbox(id, obj)
  {
      this.obj.checkboxs[id] = obj;
      obj.nextSibling.addEventListener('click', (evt) =>
      {
         this.btnClick(id, {}, obj, evt);
      });
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

    obj = frame.querySelectorAll("[id$='Link']");
    for ( i = 0; i< obj.length; i++)
      p.push(this.mkLink(obj[i].id.substr(0, obj[i].id.indexOf("Link")), obj[i], {} ));

    obj = frame.querySelectorAll("[id$='Output']");
    for ( i = 0; i< obj.length; i++)
      p.push(this.mkOutput(obj[i].id.substr(0, obj[i].id.indexOf("Output")), obj[i]));

    obj = frame.querySelectorAll("[id$='Input']");
    for ( i = 0; i< obj.length; i++)
      p.push(this.mkInput(obj[i].id.substr(0, obj[i].id.indexOf("Input")), obj[i]));
    
    obj = frame.querySelectorAll("[id$='File']");
    for ( i = 0; i< obj.length; i++)
      p.push(this.mkFile(obj[i].id.substr(0, obj[i].id.indexOf("File")), obj[i]));

    obj = frame.querySelectorAll("[id$='Editor']");
    for ( i = 0; i< obj.length; i++)
      p.push(this.mkEditor(obj[i].id.substr(0, obj[i].id.indexOf("Editor")), obj[i]));

    obj = frame.querySelectorAll("[id$='Slider']");
    for ( i = 0; i< obj.length; i++)
      p.push(this.mkSlider(obj[i].id.substr(0, obj[i].id.indexOf("Slider")), obj[i]));

    obj = frame.querySelectorAll("[id$='Checkbox']");
    for ( i = 0; i< obj.length; i++)
      p.push(this.mkCheckbox(obj[i].id.substr(0, obj[i].id.indexOf("Checkbox")), obj[i]));

    obj = frame.querySelectorAll("[id$='Table']");
    for ( i = 0; i< obj.length; i++)
      this.obj.tables[obj[i].id.substr(0, obj[i].id.indexOf("Table"))] = obj[i];

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

  setbuttonpar (id, par, value)
  {
    var i;
    var b = this.obj.mkbuttons;
    for ( i =0; i<b.length; i++)
      if ( b[i].id == id ) { b[i][par] = value; break };
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
    this.obj.container.content.addEventListener('keydown',  (evt) => { if ( ! evt.target.getAttribute('aria-multiline') &&  evt.key == 'Tab')   { self.btnClick('tab',   {}, self.obj.container.content, evt ); } });
    this.obj.container.content.addEventListener('keypress', (evt) => { if ( ! evt.target.getAttribute('aria-multiline') &&  evt.key == 'Enter') { self.btnClick('enter', {}, self.obj.container.content, evt ); } });
    
    this.obj.observer.content = new MutationObserver( (muts) => 
    {
      if ( ! this.obj.container.weblet ) return;
      
      if ( this.obj.container.content.querySelector('.modifywrong'))
        MneElement.mkClass(this.obj.container.weblet, 'modifywrong', true, 'modify');
      else if ( this.obj.container.content.querySelector('.modifyok'))
        MneElement.mkClass(this.obj.container.weblet, 'modifyok', true, 'modify');
      else
        MneElement.mkClass(this.obj.container.weblet, 'modify', false, 'modify');
    });
    this.obj.observer.content.observe(this.obj.container.content, {subtree : true, attributes : true, attributeFilter : ['class'] });
    await this.loadbutton();
  }
  
  async view(data, obj, evt)
  {
    var objsave = Object.assign({}, this.obj);
    var i;

    await super.view(data, obj, evt);
    await this.values();
    
    for ( i in this.obj.outputs )
    {
      if ( objsave.outputs[i] && objsave.outputs[i].getModify() ) this.obj.outputs[i].modValue(objsave.outputs[i].getValue(false));
      else if ( objsave.inputs[i] && objsave.inputs[i].getModify() ) this.obj.outputs[i].modValue(objsave.inputs[i].getValue(false));
    }

    for ( i in this.obj.inputs )
    {
      if ( objsave.inputs[i] && objsave.inputs[i].getModify() ) this.obj.inputs[i].modValue(objsave.inputs[i].getValue(false));
      else if ( objsave.outputs[i] && objsave.outputs[i].getModify() ) this.obj.inputs[i].modValue(objsave.outputs[i].getValue(false));
    }
  }

  async enter()
  {
    if ( ! this.obj.buttons.ok || this.obj.buttons.ok && this.obj.buttons.ok.disabled == false )
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

  async ok(param)
  {
  }
  
  async print( data )
  {
    var i,n;
    var r = ( data.report) ?  data.report : this.initpar.report;
    var t = ( this.initpar.reptyp == undefined ) ? 'pdf' : this.initpar.reptyp;
    var param = ( data.param ) ? data.param : {};
    var w;

    for ( n = 0; 1; n++ )
      if ( param["macro" + n] == undefined ) break;

    i = null;
    for ( i in param )
    {
      if (i.substr(i.length - 9 ) == 'Input.old')
      {
        param["macro" + n++] = "S" + i.substr(0, i.length - 9 ) + "," + param[i];
        param["macro" + n++] = "O" + i.substr(0, i.length - 9 ) + ",=";
      }
    }

    if ( typeof param.wcol != 'undefined' && param.wcol != null )
    {
      var cols = param.wcol.split(",");
      var vals = param.wval.split(",");
      var ops  = param.wop.split(",");
      for ( i in cols )
      {
        param["macro" + n++] = "S" + cols[i] + "," + vals[i];
        param["macro" + n++] = "O" + cols[i] + "," + ops[i];
      }
    }

    this.obj.printparam = { url : 'report/' + r + "." + t, param : param };

    if ( ! ( w = this.obj.weblets['show'] ) )
    {
      var self = this;
      w = await this.createpopup('show');
      w.getData = async function()
      {
        var res = await MneRequest.fetch(self.obj.printparam.url, self.obj.printparam.param, true);
        return await res.blob();
      }
    }
    await w.show();
    w.newvalues = true;
    await w.check_values();
  }
}

export default MneView;

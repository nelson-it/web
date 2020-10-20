//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/db/view.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'
import MneTheme   from '/js/basic/theme.mjs'
import MneInput   from '/js/basic/input.mjs'
import MneElement from '/weblet/basic/element.mjs'

import MneView  from '../basic/view.mjs'
import MnePopup from '../basic/popup.mjs'

export class MneDbView extends MneView
{
  constructor( parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
      selectlists : {},
      
      selectlistids : id,
      ignore_notfound : true,
    }

    super(parent, frame, id, Object.assign(ivalues, initpar), config);
  }
  
  reset()
  {
    super.reset();
    
    var addtyp, modtyp, deltyp;
    
    var readurl = this.initpar.url;
    
    Object.assign(this.obj, { selectlists : {} } );
    Object.assign(this.obj.run, { readpar : {sqlstart : 1, sqlend : 1}, addpar : {sqlstart : 1, sqlend : 1}, modpar : {sqlstart : 1, sqlend : 1}, delpar : {sqlstart : 1, sqlend : 1} } );

    if ( ! readurl )
    {
      if ( this.initpar.schema && this.initpar.query )
      {
        readurl = '/db/utils/query/data.json';
        this.obj.run.readpar  = { schema : this.initpar.schema, query : this.initpar.query, sqlstart : 1, sqlend : 1 };
      }
      else if ( this.initpar.schema && this.initpar.table )
      {
        readurl = '/db/utils/table/data.json';
        this.obj.run.readpar = { schema : this.initpar.schema, table : this.initpar.table, sqlstart : 1, sqlend : 1 };
      }
    }
    
    if ( readurl == undefined )
      throw new Error("#mne_lang#keine Leseurl für <" + this.id + ":" + this.config.path + "> definiert");
    
    if ( this.initpar.scols    ) this.obj.run.readpar.scols = this.initpar.scols;
    if ( this.initpar.distinct ) this.obj.run.readpar.distinct = 1;
    
    this.getParamAdd = function(p) { return this.getTableParamAdd(p) }
    this.getParamMod = function(p) { return this.getTableParamMod(p) }
    this.getParamDel = function(p) { return this.getTableParamDel(p) }

    if ( this.initpar.addurl == undefined )
    {
      if ( ( this.initpar.addfunction || this.initpar.okfunction ) )
      {
        this.obj.run.addpar =
        {
            schema : this.initpar.addschema ?? this.initpar.okschema ?? this.initpar.schema,
            name   : this.initpar.addfunction ?? this.initpar.okfunction,
            sqlstart : 1,
            sqlend : 1
        };
        
        this.getParamAdd = function(p) { return this.getFunctionParamAdd(p) }
        addtyp = 'function';
      }
      else if ( (this.initpar.addschema ?? this.initpar.okschema ?? this.initpar.schema) && (this.initpar.addtable ?? this.initpar.oktable ?? this.initpar.table) )
      {
        this.obj.run.addpar =
        {
            schema : this.initpar.addschema ?? this.initpar.okschema ?? this.initpar.schema,
             table : this.initpar.addtable ?? this.initpar.oktable ?? this.initpar.table,
          sqlstart : 1,
            sqlend : 1
        };
        addtyp = 'table';
      }
    }

    if ( this.initpar.modurl == undefined )
    {
      if ( ( this.initpar.modfunction || this.initpar.okfunction ) )
      {
        this.obj.run.modpar =
        {
            schema : this.initpar.modschema ?? this.initpar.okschema ?? this.initpar.schema,
            name   : this.initpar.modfunction ?? this.initpar.okfunction,
          sqlstart : 1,
            sqlend : 1
        };

        this.getParamMod = function(p) { return this.getFunctionParamMod(p) }
        modtyp = 'function';
      }
      else if ( ( this.initpar.modschema ?? this.initpar.okschema ?? this.initpar.schema ) && ( this.initpar.modtable ?? this.initpar.oktable ?? this.initpar.table ))
      {
        this.obj.run.modpar =
        {
            schema : this.initpar.modschema ?? this.initpar.okschema ?? this.initpar.schema,
            table  : this.initpar.modtable ?? this.initpar.oktable ?? this.initpar.table,
          sqlstart : 1,
            sqlend : 1
        }
        modtyp = 'table';
      }
    }
    
    if ( this.initpar.delurl == undefined )
    {
      if ( this.initpar.delfunction )
      {
        this.obj.run.delpar =
        {
            schema : this.initpar.delschema ?? this.initpar.okschema ?? this.initpar.schema,
            name   : this.initpar.delfunction,
          sqlstart : 1,
            sqlend : 1
        };
        this.getParamDel = function(p) { return this.getFunctionParamDel(p) };
        deltyp = 'function';
      }
      else if ( (this.initpar.delschema ?? this.initpar.schema) && (this.initpar.deltable ?? this.initpar.table)  )
      {
        this.obj.run.delpar =
        {
            schema : this.initpar.delschema ?? this.initpar.okschema ?? this.initpar.schema,
            table  : this.initpar.deltable ?? this.initpar.oktable ?? this.initpar.table,
          sqlstart : 1,
            sqlend : 1
        };
        deltyp = 'table';
      }
    }
    
    var addurl = this.initpar.addurl ?? (( addtyp == 'function' ) ? "/db/utils/connect/func/execute.json" : undefined ) ?? (( addtyp == 'table' ) ? "/db/utils/table/insert.json" : undefined );
    var modurl = this.initpar.modurl ?? (( modtyp == 'function' ) ? "/db/utils/connect/func/execute.json" : undefined ) ?? (( modtyp == 'table' ) ? "/db/utils/table/modify.json" : undefined );
    var delurl = this.initpar.delurl ?? (( deltyp == 'function' ) ? "/db/utils/connect/func/execute.json" : undefined ) ?? (( modtyp == 'table' ) ? "/db/utils/table/delete.json" : undefined );

    this.obj.run.btnrequest  = { read : readurl, add : addurl, mod : modurl, del : delurl, "export" : '/db/utils/query/data.csv' };
    
    if ( ! addurl ) this.delbutton('add');
    if ( ! modurl ) this.delbutton('ok');
    if ( ! delurl ) this.delbutton('del');
  }

  async getSelectLists()
  {
    if ( this.config.composeparent )
    {
      var i;
      var p = 
      {
          htmlcomposeid : this.config.composeparent.obj.run.config.htmlcomposeid,
          ids : this.initpar.selectlistids
      }

      var res = await MneRequest.fetch('/htmlcompose/select.json', p);

      this.obj.selectlists = {};
      for ( i=0; i<res.values.length; ++i)
      {
        var id = res.values[i][res.rids['element']].split(',')[0];
        this.obj.selectlists[id] = { rids : res.rids, values : res.values[i] };
      }
    }
  }
  
  async getSelectListContent(id, value )
  {
    var i;
    var res;
    var p;
    var list = this.obj.selectlists[id];
    var result = '';
    
    if ( list != undefined  && list.content != undefined )
    {
      result = this.obj.selectlists[id].content; 
    }
    else
    {

      if ( list != undefined )
      {
        p =
        {
            schema : list.values[list.rids['schema']],
            query  : list.values[list.rids['query']],
            table  : list.values[list.rids['tab']],
            cols   : ( list.values[list.rids['showcols']] == '' ) ? list.values[list.rids['cols']] : list.values[list.rids['cols']].split(',').concat(list.values[list.rids['showcols']].split(',')).join(','),
            wcol   : list.values[list.rids['wcol']],
            wop    : list.values[list.rids['wop']],
            wval   : list.values[list.rids['wval']],
            scols  : list.values[list.rids['scols']],
            distinct : 1,
            sqlstart : 1,
            sqlend : 1
        };
      }
      else
      {
        this.obj.selectlists[id] = { content : '' };
        p =
        {
            schema : 'mne_application',
            query  : 'selectlist',
            cols   : 'text,value',
            wcol   : 'name',
            wop    : '=',
            scols  : 'num',
            sqlstart : 1,
            sqlend : 1
        };

        p.wval = ( this.initpar.selectlists[id] ) ? this.initpar.selectlists[id] : id;
      }

      res = await MneRequest.fetch(( p.query ) ? '/db/utils/query/data.json' : '/db/utils/table/data.json', p);

      var str = '';
      for ( i = 0; i< res.values.length; i++)
        str += '<option value="' + (( res.values[i][1] != undefined ) ? res.values[i][1] : res.values[i][0] ) + '">' + res.values[i][0] + "</option>";
      this.obj.selectlists[id].content = str;

      result = this.obj.selectlists[id].content;
    }

    if ( value != 'undefined' )
    {
      var index;
      if ( ( index = result.indexOf('value="' + value + '"')) != -1 )
        result = result.substring(0, index ) + ' selected="selected" ' + result.substring(index);
    }
    return result;
  }

  async findIOParam()
  {
    var i;
    var str = '';

    if ( this.obj.run.btnrequest.read == '' ) return;
    
    for ( i in this.obj.labels )
      if ( ! this.obj.labels[i].noautoread ) str += i + ",";

    for ( i in this.obj.inputs )
    {
      if ( this.obj.labels[i] == undefined && ! this.obj.inputs[i].noautoread )
        str += i + ",";
    }
    for ( i in this.obj.outputs )
    {
      if ( this.obj.labels[i] == undefined && this.obj.inputs[i] == undefined && ! this.obj.outputs[i].noautoread )
        str += i + ",";
    }

    str = str.substring(0,str.length - 1);

    var p = Object.assign( 
    {
        cols     : str,
        no_vals  : "true",
        sqlstart : 1,
        sqlend   : 1
    }, this.obj.run.readpar);


    var res = await MneRequest.fetch(this.obj.run.btnrequest.read, p);

    for ( i in this.obj.labels )
      if ( ! this.obj.labels[i].noautoread ) this.obj.labels[i].setValue(res.labels[res.rids[i]]);

    for ( i in this.obj.inputs )
      if ( this.obj.inputs[i] && ! this.obj.inputs[i].noautoread ) this.obj.inputs[i].setTyp(res.typs[res.rids[i]], this.initpar.regexp[i] ?? res.regexps[res.rids[i]], res.formats[res.rids[i]]  );

    for ( i in this.obj.outputs )
      if ( this.obj.outputs[i] && ! this.obj.outputs[i].noautoread ) this.obj.outputs[i].setTyp(res.typs[res.rids[i]], this.initpar.regexp[i] ?? res.regexps[res.rids[i]], res.formats[res.rids[i]] );

  }
  
  async findIO(frame)
  {
    if ( frame == undefined ) await this.getSelectLists();
    await super.findIO(frame);
    if ( frame == undefined ) await this.findIOParam();
  }

  mkSelectList(id, obj, list)
  {
    if ( list == undefined || obj.type == 'hidden' ) return;
    
    var vals = list.values;
    var rids = list.rids;
    var self = this;
    var i;
    var path = { 'table' : 'table/select', 'fmenu' : 'menu/fselect', 'rmenu' : 'menu/rselect', frame : 'table/frame' }
    var config;
    var isselect = (vals[rids['element']].indexOf('?') != -1 );
    var interactive = ( vals[rids['type']] != 'frame' )
    var name;
    
    if ( vals[rids['type']] == 'weblet' )
    {
        name = vals[rids['weblet']];
        var popup = this.config.composeparent.obj.popups[name];
        this.obj.popups[id + 'select']  = new MnePopup( name, Object.assign(popup.initpar, { selectok : async (sel) => { self[id + 'selected'](sel) } }), popup.config );
    }
    else
    {
      name = id + 'select';
      var initpar =
      {
          addurl : '',
          delurl : '',

          schema : vals[rids['schema']],
          cols   : vals[list.rids['cols']],
          showcols  : vals[list.rids['showcols']],
          wcol   : vals[list.rids['wcol']],
          wop    : vals[list.rids['wop']],
          wval   : vals[list.rids['wval']],
          scols  : vals[list.rids['scols']],

          selval : vals[list.rids['selval']],
          
          distinct : 1,

          selectsingle : true,
          notitle : true,

          detailweblet : ( this.config.composeparent.obj.popups[this.id + '_' + id + 'selectdetail'] ) ? this.id + '_' + id + 'selectdetail' : undefined
      };

      if ( vals[rids['query']] ) initpar.query = vals[rids['query']];
      if ( vals[rids['tab']] )   initpar.table = vals[rids['tab']];
      if ( vals[rids['showids']] )   initpar.showids = vals[rids['showids']].split(',');

      config  = { path : '/weblet/allg/' + path[vals[rids['type']]], composeparent : this.config.composeparent, nointeractive : !interactive , initpar : initpar, id : id + 'select', position : 'popup', label : MneText.getText('#mne_lang#suchen') };
      initpar = Object.assign({selectok : async (sel) => { self[id + 'selected'](sel) }}, initpar )
      this.obj.popups[id + 'select']  = new MnePopup( id + 'select', initpar, config );
    }

    this[id + 'selected'] = async function( res )
    {
      var element = vals[rids['element']].split(',');
      var cols = vals[rids['showcols']].split(',');
      var i;
      
      if ( res.values.length == 0 )
        res.values.push(new Array(res.ids.length).fill(''));
      
      if ( isselect )
      {
        for ( i=1; i<element.length; i++)
        {
          this.obj.run.values[element[i].substr(1)] = res.values[0][res.rids[cols[i]]];
        }
        this.obj.run.dependweblet = this;
        await this.values();
        this.newselect = true;
        await window.main_weblet.check_values();
      }
      else
      {
        for ( i=0; i<element.length; i++)
        {
          var val = ( cols[i][0] == '#' ) ? cols[i].substring(1) : res.values[0][res.rids[cols[i]]];
          if ( this.obj.inputs[element[i]] != undefined )  this.obj.inputs[element[i]].modValue(val);
          if ( this.obj.outputs[element[i]] != undefined ) this.obj.outputs[element[i]].modValue(val);
        }
      }
    }

    this[id + 'selectshow'] = async function()
    {
      await self.openpopup(name);
      return false;
    }
    
    if ( interactive )
    {
      obj.closest('.ele-wrapper').addEventListener('click', (evt) => { if ( evt.target == obj.closest('.ele-wrapper') ) { self.btnClick(id + 'selectshow', {}, obj, evt); }} );
      MneElement.mkClass(obj.closest('.ele-wrapper'), ( isselect ) ? 'selectlists' : 'selectlisti');
    }
    else
    {
      MneElement.mkClass(obj.closest('.ele-wrapper'), ( isselect ) ? 'selectlistfs' : 'selectlistfi');

      var showselect = async (evt) =>
      {
        if ( obj.noselect ) return;
        if ( obj.inshowselect ) return;

        obj.inshowselect = true;

        try {
          if ( ! this.obj.weblets[id + 'select'] || ! this.obj.weblets[id + 'select'].obj.popup.visible ) 
          {
            this.obj.popups[id + 'select'].config.parentframe = obj.offsetParent;
            await this.openpopup(id + 'select');
            this.obj.weblets[id + 'select'].initpar.popup.frame.style.left = obj.offsetLeft + 'px';
            this.obj.weblets[id + 'select'].initpar.popup.frame.style.top = obj.offsetTop + obj.offsetHeight + 'px';
          }

          var res = this.obj.weblets[id + 'select'].obj.weblets.table.obj.run.result;
          var rows = this.obj.weblets[id + 'select'].obj.weblets.table.obj.tbody.rows;
          var num = res.rids[vals[list.rids['cols']].split(',')[0]];
          var index;

          for ( index = 0; index < rows.length; index++ )
            rows[index].style.display = ( rows[index].values[num].toString().indexOf(obj.getValue(false)) == 0 ) ? null : 'none';

          this.obj.weblets[id + 'select'].obj.weblets.table.obj.lastselect = 0;
        }
        catch(e)
        {
          MneLog.exception('mkSelectlist: ' + this.fullid, e);
        }
        obj.inshowselect = false;
      };

      obj.closest('.ele-wrapper').addEventListener('click', (evt) => { obj.focus(); MneElement.moveCursor(obj); showselect(evt) });
      obj.addEventListener('input', showselect);
      
      obj.addEventListener('blur', (evt) =>
      {
          window.setTimeout(() => { if(this.obj.weblets[id + 'select'] ) this.obj.weblets[id + 'select'].close() }, 500);
          obj.noselect = false;
      });
      
      obj.addEventListener('keydown', (evt) =>
      {
        if ( ! this.obj.weblets[id + 'select'] || ! this.obj.weblets[id + 'select'].obj.popup.visible ) return;

        switch(evt.key)
        {
          case "Escape" :
            this.obj.weblets[id + 'select'].close();
            obj.noselect = true;
            evt.stopPropagation();
            evt.preventDefault();

          case "ArrowDown" :
            evt.stopPropagation();
            evt.preventDefault();
            this.obj.weblets[id + 'select'].obj.weblets.table.btnClick('arrow_down', {}, obj, evt);
            break;

          case  "ArrowUp" :
            evt.stopPropagation();
            evt.preventDefault();
            this.obj.weblets[id + 'select'].obj.weblets.table.btnClick('arrow_up', {}, obj, evt);
            break;

          case "Enter" :
            evt.stopPropagation();
            evt.preventDefault();
            this.obj.weblets[id + 'select'].close();
            this[id + 'selected'](this.obj.weblets[id + 'select'].obj.weblets.table.select);
          default:
            break;
        }
      }, true);
    }
  }
 
  
  async mkOutput (id, obj)
  {
    var list = this.obj.selectlists[id];
    
    await super.mkOutput (id, obj);
    this.mkSelectList(id, obj,list)
    
  }

  async mkInputINPUT (id, obj)
  {
    var list = this.obj.selectlists[id];
    await super.mkInputINPUT (id, obj);
    this.mkSelectList(id, obj,list)
  }

  async mkInputSPAN (id, obj)
  {
    var list = this.obj.selectlists[id];
    await super.mkInputSPAN (id, obj);
    this.mkSelectList(id, obj,list)
  }

  async mkInputSELECT (id, obj)
  {
    await super.mkInputSELECT (id, obj);
    obj.innerHTML = await this.getSelectListContent(id); 
  }

  getIdparam(p, mod)
  {
    var i;
    var m = ( mod != undefined ) ? mod : this.obj.run.okaction;

    if ( m == 'mod' )
    {
      for ( i=0; i<this.initpar.okids.length; i++ )
      {
        if ( p[this.initpar.okids[i] + "Input.old"] != undefined )
          throw new Error(MneText.sprintf(MneText.getText("#mne_lang#Id Parameter <$1> ist schon definiert"), this.initpar.okids[i] ));
        else if ( this.obj.run.values[this.initpar.okids[i]] != undefined )
          p[this.initpar.okids[i] + "Input.old"] = this.obj.run.values[this.initpar.okids[i]];
        else
          throw new Error(MneText.sprintf(MneText.getText("#mne_lang#Objekt für name <$1> ist nicht definiert"), this.initpar.okids[i] ));        
      }
    }
    else
    {
      throw new Error(MneText.getText("#mne_lang#MneViewWeblet:getIdparam ist nur im Modifymodus erlaubt")) ;        
    }
    return p;
  }

  addParam (p, name, obj)
  {
    if ( obj == undefined )
    {
      obj = this.obj.inputs[name];
      name = name + "Input";
    }

    if ( obj == undefined )
      throw new Error(MneText.sprintf(MneText.getText("Objekt für name <$1> ist nicht definiert"), name ));

    if ( typeof p[name] != 'undefined' )
      throw new Error( MneText.sprintf(MneText.getText("Parameter <$1> ist schon definiert"), name ));

    p[name]= ( typeof obj != 'object' ) ? obj : obj.getValue();

    return p;
  }

  getParam(p, cols = [] )
  {
    var i;

    for ( i in this.obj.inputs )
      p = this.addParam(p, i + "Input", this.obj.inputs[i]);
    
    for ( i =0; i<cols.length; ++i)
      if ( this.obj.inputs[cols[i]] == undefined ) p = this.addParam(p, cols[i] + "Input", this.obj.run.values[cols[i]]);
      
    return p;
  }
  
  getFunctionParam(p, cols = [], typs = [])
  {
    var i;
    
    for ( i =0; i<cols.length; ++i)
    {
      p = this.addParam(p, 'par' + i, this.obj.inputs[cols[i]] ?? this.obj.run.values[cols[i]])
      p = this.addParam(p, 'typ' + i, ( typs[cols[i]] ) ? typs[cols[i]] : 'text' )
    }

    return p;
  }

  getFunctionParamAdd(p)
  {
    return this.getFunctionParam(p, ( this.initpar.addcols ?? this.initpar.okcols), ( this.initpar.addtyps ?? this.initpar.oktyps));
  }

  getFunctionParamMod(p)
  {
    return this.getFunctionParam(p, ( this.initpar.modcols ?? this.initpar.okcols), ( this.initpar.modtyps ?? this.initpar.oktyps));
  }

  getFunctionParamDel(p)
  {
    return this.getFunctionParam(p, this.initpar.delcols, this.initpar.deltyps);
  }

  getTableParamAdd(p)
  {
    p = this.getParam(p, ( this.initpar.addcols ?? this.initpar.okcols));
    p.sqlstart = 1;
    p.sqlend = 1;
    return p;
  }

  getTableParamMod(p)
  {
    p = this.getParam(p, ( this.initpar.modcols ?? this.initpar.okcols));
    p = this.getIdparam(p);
    p.sqlstart = 1;
    p.sqlend = 1;
    return p;
  }

  getTableParamDel(p)
  {
    p = this.getIdparam(p, this.initpar.delcols);
    p.sqlstart = 1;
    p.sqlend = 1;
    return p;
  }

  getParamShowSingle(w, showids, i )
  {
    if ( this.initpar.showalias && this.initpar.showalias[i] )
      return this.initpar.showalias[i]();

    return  ( w ) ? w.obj.run.values[showids[i]] : undefined;
  }
  
  getParamShow(p, showids )
  {
    var i;
    var w = this.obj.run.act_dependweblet = ( this.obj.run.dependweblet ) ? this.obj.run.dependweblet : this.config.dependweblet;
    var showids = ( showids ) ? showids : this.initpar.showids;
    
    for ( i=0; i<showids.length; ++i )
    {
      var val = this.getParamShowSingle(w, showids, i);
      if ( val != undefined && val != '################' )
        p[showids[i] + "Input.old"] = this.obj.run.values[showids[i]] = val;
      else
        p.value_not_found = true;
    }
    return p;
  }
  
  async values(param = {})
  {
    var cols = param.cols;
    var i;

    var dependweblet = this.obj.run.act_dependweblet = ( this.obj.run.dependweblet ) ? this.obj.run.dependweblet : this.config.dependweblet;
    
    if ( dependweblet != this && this.initpar.defalias )
      Object.keys(this.initpar.defalias).forEach( (item) => { this.obj.defvalues[item] = dependweblet.obj.run.values[this.initpar.defalias[item]]; });

    if ( cols == undefined )
    {
      cols = '';
      for ( i in this.obj.inputs )
        if ( ! this.obj.inputs[i].noautoread ) cols += i + ",";
      for ( i in this.obj.outputs )
        if ( this.obj.inputs[i] == undefined && ! this.obj.outputs[i].noautoread ) cols += i + ",";
      cols = cols.substring(0,cols.length - 1);
    }

    var p = Object.assign(
    {
      cols     : cols,
      sqlstart : 1,
      sqlend   : 1,
      lastquery : ( this.obj.lastquery ) ? '1' : '',
    }, this.obj.run.readpar);
    
    p = this.getParamShow(p)
    if ( p.value_not_found  )
        return this.add({ nomod : true });
    
    this.obj.run.dependweblet = undefined;
    
    var res = this.obj.run.result = await MneRequest.fetch(this.obj.run.btnrequest.read, p);
    if ( res.values.length == 0 )
    {
      if ( ! this.initpar.ignore_notfound  )
        MneLog.warning(MneText.sprintf(MneText.getText("#mne_lang#Keine Werte für $1:$2 gefunden"), "MneDbViewWeblet:values", this.id));
      return this.add({ nomod : true });
    }
    else if ( res.values.length > 1 && ! ( param.multiline === true )  )
    {
      MneLog.warning(MneText.sprintf(MneText.getText("#mne_lang#Mehr als einen Wertesatz gefunden für $1:$2 gefunden"), "MneDbViewWeblet:values", this.id));
    }

    for ( i in this.obj.inputs )
      if ( this.obj.inputs[i] && ! this.obj.inputs[i].noautoread ) this.obj.inputs[i].setValue(res.values[0][res.rids[i]]);

    for ( i in this.obj.outputs )
      if ( this.obj.outputs[i] && ! this.obj.outputs[i].noautoread ) this.obj.outputs[i].setValue(res.values[0][res.rids[i]]);

    for ( i in this.obj.files )
      this.obj.files[i].clearModify();

    this.obj.run.okaction = 'mod';
    this.title = this.obj.run.title.mod;

    this.obj.run.values = {};
    for ( i =0; i<res.ids.length; i++)
      this.obj.run.values[res.ids[i]] = MneInput.format(res.values[0][i], res.typs[i], res.formats[i]);
    
    this.obj.run.values = Object.assign({}, this.obj.run.values);
    if ( this.initpar.mainweblet ) window.sessionStorage.setItem(window.mne_application + ':' + this.config.composeparent.obj.name, JSON.stringify(this.obj.run.values)); 

    var enable = 'value';
    if ( this.initpar.okids != this.initpar.showids )
      this.initpar.showids.forEach((item, index) =>
      {
        var val = ( this.initpar.showalias && this.initpar.showalias[index] ) ? this.initpar.showalias[index]() : this.config.dependweblet.obj.run.values[item];
        if ( ! val || val == '################') enable = '';
      });

    this.enable(enable, enable != '' );
    
    if ( dependweblet == this && this.initpar.defalias )
      Object.keys(this.initpar.defalias).forEach( (item) => { this.obj.defvalues[item] = dependweblet.obj.run.values[this.initpar.defalias[item]]; });


  }
  
  async ok(param = {} )
  {
    var p;
    var res;
    var i;
    var oldvalues,values;
    
    p = Object.assign({}, this.obj.run[this.obj.run.okaction + 'par']);
    p = this['getParam' + this.obj.run.okaction[0].toUpperCase() + this.obj.run.okaction.substr(1)](p);
    p.lastquery = ( this.obj.lastquery ) ? '1' : '';

    for ( i in param ) p[i] = param[i];
      
    res = await MneRequest.fetch(this.obj.run.btnrequest[this.obj.run.okaction], p);
    
    oldvalues = this.obj.run.values;
    values = this.obj.run.values = {};

    if ( res.result && res.result != 'ok' )
    {
      res.ids[res.rids['result']] = this.initpar.showids[0];
      res.rids[this.initpar.showids[0]] = res.rids['result'];
    }

    this.initpar.showids.forEach( ( item ) => { values[item] = oldvalues[item]; });
    res.ids.forEach( (item, index) => { values[item] = res.values[0][index]; })

    this.dependweblet = this;
  }

  async cancel()
  {
    return this.values();
  }
  
  async add(data = {})
  {
    var i;

    this.obj.run.okaction = 'add';
    this.obj.run.dependweblet = undefined; 

    if ( ! data.nomod && this.getModify() )
    {
      for ( i=0; i< this.initpar.okids.length; ++i )
        this.obj.inputs[this.initpar.okids[i]].setValue((this.obj.defvalues[this.initpar.okids[i]] != undefined ) ? this.obj.defvalues[this.initpar.okids[i]] : '################');

      await this.ok({ doadd : true });
      return;
    }

    this.title = this.obj.run.title.add;

    for ( i in this.obj.inputs )
      this.obj.inputs[i].setValue((this.obj.defvalues[i] != undefined ) ? this.obj.defvalues[i] : '');

    this.obj.run.result = undefined;
    this.obj.run.values = {};

    this.initpar.okids.forEach((item, index) =>
    {
      this.obj.run.values[item] = ( this.obj.defvalues[item] != undefined ) ? this.obj.defvalues[item] : '################';
      this.obj.inputs[item].setValue(this.obj.run.values[item]);
    });

    for ( i in this.obj.outputs )
      this.obj.outputs[i].setValue((this.obj.defvalues[i] != undefined ) ? this.obj.defvalues[i] : '');
   

    var enable = 'add';
    if ( this.initpar.okids != this.initpar.showids )
      this.initpar.showids.forEach((item) => { if ( ! this.config.dependweblet.obj.run.values[item] || this.config.dependweblet.obj.run.values[item] == '################') enable = ''; });
    
    this.enable(enable, enable != '' );
    this.newselect = true;
  }

  del_confirm(multi = false)
  {
    var ids = ( this.initpar.delconfirmids ) ? this.initpar.delconfirmids : this.initpar.showids;
    var str = "";
    ids.forEach((item) =>
    {
      str += this.obj.run.values[item] + ':';
    })
    str = str.substr(0, str.length-1);

    return this.confirm(MneText.sprintf(( str != '' ) ? MneText.getText("#mne_lang#<$1> Wirklich löschen ?") : MneText.getText('#mne_lang#Wirklich löschen ?'), str + ((multi) ? ' ' + '#mne_lang#und andere' : '')));
  }
  
  async del(data = {})
  {
    if ( data.noask || this.del_confirm() )
    {
      var p;
      p = Object.assign({}, this.obj.run.delpar);
      p = this.getParamDel(p);
      p.lastquery = ( this.obj.lastquery ) ? '1' : '',
      await MneRequest.fetch(this.obj.run.btnrequest['del'], p);
      this.obj.run.values = {};
      this.dependweblet = this;
    }
  }
  
  async query()
  {
    this.obj.lastquery = ! this.obj.lastquery;
    MneElement.mkClass(this.obj.buttons.query, 'active', this.obj.lastquery );
  }
}

export default MneDbView;

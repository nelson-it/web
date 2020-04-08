//================================================================================

//Copyright: M.Nelson - technische Informatik
//Die Software darf unter den Bedingungen 
//der APGL ( Affero Gnu Public Licence ) genutzt werden

//datei: weblet/db/view.mjs
//================================================================================
'use strict';

import MneText    from '/js/basic/text.mjs'
import MneLog     from '/js/basic/log.mjs'
import MneRequest from '/js/basic/request.mjs'
import MneTheme   from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'
import MnePopup   from '/js/geometrie/popup.mjs'

import MneViewWeblet        from '../basic/view.mjs'

export class MneDbViewWeblet extends MneViewWeblet
{
  constructor( parent, frame, id, initpar = {}, config = {} )
  {
    super(parent, frame, id, initpar, config);
  }
  
  reset()
  {
    super.reset();
    
    var readurl = this.initpar.url;
    
    this.obj.run.readpar  = {}
    this.obj.run.writepar = {}

    if ( ! readurl )
    {
      if ( this.initpar.schema && this.initpar.query )
      {
        readurl = '/db/utils/query/data.json';
        this.obj.run.readpar  = { schema : this.initpar.schema, query : this.initpar.query, sqlend : 1 };
      }
      else if ( this.initpar.schema && this.initpar.table )
      {
        readurl = '/db/utils/table/data.json';
        this.obj.run.readpar = { schema : this.initpar.schema, table : this.initpar.table, sqlend : 1 };
      }
    }
    
    if ( readurl == undefined )
      throw new Error("#mne_lang#keine Leseurl für <" + this.id + ":" + this.config.path + "> definiert");
    
    var addurl = this.initpar.addurl ?? (( this.initpar.addfunction || this.initpar.okfunction ) ? "/db/utils/connect/func/execute.json" : undefined ) ?? "/db/utils/table/insert.json";
    var modurl = this.initpar.modurl ?? (( this.initpar.modfunction || this.initpar.okfunction ) ? "/db/utils/connect/func/execute.json" : undefined ) ?? "/db/utils/table/modify.json";
    var delurl = this.initpar.delurl ?? (( this.initpar.delfunction ) ? "/db/utils/connect/func/execute.json" : undefined ) ?? "/db/utils/table/delete.json";

    if ( this.initpar.addurl == undefined )
    {
      if ( ( this.initpar.addfunction || this.initpar.okfunction ) )
      {
        this.obj.run.addpar =
        {
            schema : this.initpar.addschema ?? this.initpar.okschema ?? this.initpar.schema,
            name   : this.initpar.addfunction ?? this.initpar.okfunction,
            sqlend : 1
        };
        
        this.getParamAdd = function(p) { return this.getFunctionParamAdd(p) }
      }
      else
      {
        this.obj.run.addpar =
        {
            schema : this.initpar.addschema ?? this.initpar.okschema ?? this.initpar.schema,
             table : this.initpar.addtable ?? this.initpar.oktable ?? this.initpar.table,
            sqlend : 1
        };

        this.getParamAdd = function(p) { return this.getTableParamAdd(p) }
      }
      if (  ( ! this.initpar.noadd ) && ( ! this.obj.run.addpar.schema  || ( ! this.obj.run.addpar.table && ! this.obj.run.addpar.name )) ) throw new Error(MneText.sprintf(MneText.getText("#mne_lang#keine Abfrage und keine Table für <$1> : <$2> definiert"), this.id + ":add", this.config.path));
    }

    if ( this.initpar.modurl == undefined )
    {
      if ( ( this.initpar.modfunction || this.initpar.okfunction ) )
      {
        this.obj.run.modpar =
        {
            schema : this.initpar.modschema ?? this.initpar.okschema ?? this.initpar.schema,
            name   : this.initpar.modfunction ?? this.initpar.okfunction,
            sqlend : 1
        };

        this.getParamMod = function(p) { return this.getFunctionParamMod(p) }
      }
      else
      {
        this.obj.run.modpar =
        {
            schema : this.initpar.modschema ?? this.initpar.okschema ?? this.initpar.schema,
            table  : this.initpar.modtable ?? this.initpar.oktable ?? this.initpar.table,
            sqlend : 1
        }
        this.getParamMod = function(p) { return this.getTableParamMod(p) }
      }
      if ( ( ! this.initpar.nomod ) && ( ! this.obj.run.modpar.schema  || ( ! this.obj.run.modpar.table && ! this.obj.run.modpar.name )) ) throw new Error(MneText.sprintf(MneText.getText("#mne_lang#keine Abfrage und keine Table für <$1> : <$2> definiert"), this.id + ":mod", this.config.path));
    }

    if ( this.initpar.delurl == undefined )
    {
      if ( this.initpar.delfunction )
      {
        this.obj.run.delpar =
        {
            schema : this.initpar.delschema ?? this.initpar.schema,
            name   : this.initpar.delfunction,
            sqlend : 1
        };
        this.getParamDel = function(p) { return this.getFunctionParamDel(p) }
      }
      else
      {
        this.obj.run.delpar =
        {
            schema : this.initpar.delschema ?? this.initpar.schema,
            table  : this.initpar.deltable ?? this.initpar.table,
            sqlend : 1
        };
        this.getParamDel = function(p) { return this.getTableParamDel(p) }
      }
      if ( ( ! this.initpar.nodel ) && ( ! this.obj.run.delpar.schema  || ( ! this.obj.run.delpar.table && ! this.obj.run.delpar.name )) ) throw new Error(MneText.sprintf(MneText.getText("#mne_lang#keine Abfrage und keine Table für <$1> : <$2> definiert"), this.id + ":del", this.config.path));
    }
    
    this.obj.run.btnrequest  = { read : readurl, add : addurl, mod : modurl, del : delurl, "export" : '/db/utils/query/data.csv' };
  }

  async getSelectLists()
  {
    var i;
    var p = 
    {
        htmlcomposeid : this.parent.config.htmlcomposeid,
        ids : this.id
    }
    
    var res = await MneRequest.fetch('/htmlcompose/select.json', p);
    
    this.obj.selectlists = {};
    for ( i=0; i<res.values.length; ++i)
    {
        var id = res.values[i][res.rids['element']].split(',')[0];
        this.obj.selectlists[id] = { rids : res.rids, values : res.values[i] };
    }
  }
  
  async findIOParam()
  {
    var i;
    var str = '';

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
        sqlend   : 1
    }, this.obj.run.readpar);


    var res = await MneRequest.fetch(this.obj.run.btnrequest.read, p);

    for ( i in this.obj.labels )
      if ( ! this.obj.labels[i].noautoread ) this.obj.labels[i].setText(res.labels[res.rids[i]]);

    for ( i in this.obj.inputs )
      if ( ! this.obj.inputs[i].noautoread ) this.obj.inputs[i].setTyp(res.typs[res.rids[i]], res.regexps[res.rids[i]], res.formats[res.rids[i]]  );

    for ( i in this.obj.outputs )
      if ( ! this.obj.outputs[i].noautoread ) this.obj.outputs[i].setTyp(res.typs[res.rids[i]], res.regexps[res.rids[i]], res.formats[res.rids[i]] );

  }
  
  async findIO()
  {
    await this.getSelectLists();
    await super.findIO();
    await this.findIOParam();
  }

  async mkOutput (id, obj)
  {
    var list = this.obj.selectlists[id];
    
    await super.mkOutput (id, obj);
    
    if ( list != undefined )
    {
      var vals = list.values;
      var rids = list.rids;
      var self = this;
      var i,icols;

      MneElement.mkClass(obj, (vals[rids['element']].indexOf('?') != -1 ) ? 'selectlists' : 'selectlisti');
      
      var initpar =
      {
        schema : vals[rids['schema']],
        cols   : ( vals[rids['showcols']] == '' ) ? vals[list.rids['cols']] : vals[list.rids['cols']].split(',').concat(vals[list.rids['showcols']].split(',')).join(','),
        wcol   : vals[list.rids['wcol']],
        wop    : vals[list.rids['wop']],
        wval   : vals[list.rids['wval']],
        scols  : vals[list.rids['scols']],
        
        selval : vals[list.rids['selval']],
        
        selectsingle : true,
        
        title  : MneText.getText('#mne_lang#suchen'),
        notitle : true,
        
        detailweblet : this.parent.obj.weblets[this.id + '_' + id + 'selectdetail']
      };

      if ( vals[rids['query']] ) initpar.query = vals[rids['query']];
      if ( vals[rids['tab']] )   initpar.table = vals[rids['tab']];
      
      icols = [];
      for ( i = 0; i < vals[rids['showcols']].split(',').length; i++)
        icols[icols.length] = vals[list.rids['cols']].split.length + i - 1;

      initpar.tablehidecols = icols.join(',');
      
      initpar.popup = this.obj.popups[id + 'select'] = new MnePopup(window.document.createElement("div"), MneText.getText('#mne_lang#suchen'), weblet );
      initpar.ok    = async (sel) => { self[id + 'selected'](sel) };
      
      var config = { path : '/weblet/allg/table/select', initpar : initpar, id : id + 'select', position : 'popup', label : MneText.getText('#mne_lang#suchen') };

      let { default: Weblet } =  await MneRequest.import('/weblet/allg/table/select.mjs');
      var weblet = this.obj.weblets[id + 'select'] = new Weblet(this, initpar.popup.container, id + 'select', initpar, config );
      
      this[id + 'selected'] = async function( res )
      {
        var element = vals[rids['element']].split(',');
        var cols = vals[rids['showcols']].split(',');
        var i;
        
        for ( i=0; i<element.length; i++)
        {
          if ( this.obj.inputs[element[i]] != undefined )  this.obj.inputs[element[i]].modValue(res.values[0][res.rids[cols[i]]]);
          if ( this.obj.outputs[element[i]] != undefined ) this.obj.outputs[element[i]].modValue(res.values[0][res.rids[cols[i]]]);
        }
      }

      this[id + 'selectshow'] = async function()
      {
        await weblet.show();
        await weblet.values();
      }

      obj.addEventListener('click', (evt) => { self.btnClick(id + 'selectshow', {}, obj, evt); });
    }
  }

  async mkInputINPUT (id, obj)
  {
    var list = this.obj.selectlists[id];

    await super.mkInputINPUT (id, obj);
    
  }

  async mkInputSELECT (id, obj)
  {
    var i;
    var res;
    var p;
    var list = this.obj.selectlists[id];
    
    await super.mkInputSELECT (id, obj);

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
          wval    : list.values[list.rids['wval']],
          scols  : list.values[list.rids['scols']],
          sqlend : 1
      };
    }
    else
    {
      p =
      {
          schema : 'mne_application',
          query  : 'selectlist',
          cols   : 'text,value',
          wcol   : 'name',
          wop    : '=',
          scols  : 'num',
          sqlend : 1
      };

      p.wval = id;
    }

    res = await MneRequest.fetch(( p.query ) ? '/db/utils/query/data.json' : '/db/utils/table/data.json', p);
    
    for ( i = 0; i< res.values.length; i++)
    {
      obj.appendChild(document.createElement('option'));
      obj.lastChild.appendChild(document.createTextNode( res.values[i][0] ));
      obj.lastChild.value = ( res.values[i][1] != undefined ) ? res.values[i][1] : res.values[i][0];
    }
  }

  getIdparam(p, mod)
  {
    var i;
    var m = ( mod != undefined ) ? mod : this.obj.run.okaction;

    if ( m == 'mod' )
    {
      for ( i=0; i<this.initpar.showids.length; i++ )
      {
        if ( p[this.initpar.showids[i] + "Input.old"] != undefined )
          throw new Error(MneText.sprintf(MneText.getText("#mne_lang#Id Parameter <$1> ist schon definiert"), this.initpar.showids[i] ));
        else if ( this.obj.run.values[this.initpar.showids[i]] != undefined )
          p[this.initpar.showids[i] + "Input.old"] = this.obj.run.values[this.initpar.showids[i]];
        else
          throw new Error(MneText.sprintf(MneText.getText("#mne_lang#Objekt für name <$1> ist nicht definiert"), this.initpar.showids[i] ));        
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

  getParam(p)
  {
    var i = null;

    for ( i in this.obj.inputs )
      p = this.addParam(p, i + "Input", this.obj.inputs[i]);

    return p;     
  }
  
  getFunctionParam(p, cols, typs)
  {
    var i;
    
    for ( i =0; i<cols.length; ++i)
    {
      p = this.addParam(p, 'par' + i, this.obj.inputs[cols[i]])
      p = this.addParam(p, 'typ' + i, ( typs[i] ) ? typs[i] : 'text' )
    }

    return p;
  }

  getFunctionParamAdd(p)
  {
    return this.getFunctionParam(p, ( this.initpar.addcols ?? this.initpar.okcols).split(','), ( this.initpar.addtyps ?? this.initpar.oktyps).split(','));
  }

  getFunctionParamMod(p)
  {
    return this.getFunctionParam(p, ( this.initpar.modcols ?? this.initpar.okcols).split(','), ( this.initpar.modtyps ?? this.initpar.oktyps).split(','));
  }

  getFunctionParamDel(p)
  {
    return this.getFunctionParam(p, this.initpar.delcols.split(','), this.initpar.deltyps.split(','));
  }

  getTableParamAdd(p)
  {
    return this.getIdparam(p);
  }

  getTableParamMod(p)
  {
    p = this.getParam(p);
    return this.getIdparam(p);
  }

  getTableParamDel(p)
  {
    return this.getIdparam(p);
  }

  async values(param)
  {
    var i;
    var str = '';
    var w;
    
    for ( i in this.obj.inputs )
        str += i + ",";
    for ( i in this.obj.outputs )
        str += i + ",";
    str = str.substring(0,str.length - 1);

    var p = Object.assign(
    {
      cols     : str,
      sqlend   : 1
    }, this.obj.run.readpar);
    
    w = this.config.dependweblet;
    for ( i=0; i<this.initpar.showids.length; ++i )
    {
      if ( w && w.obj.run.values[this.initpar.showids[i]] && w.obj.run.values[this.initpar.showids[i]] != '################' )
      {
        p[this.initpar.showids + "Input.old"] = w.obj.run.values[this.initpar.showids[i]];
      }
      else
      {
        await this.add();
        return;
      }
    }

    var res = await MneRequest.fetch(this.obj.run.btnrequest.read, p);
    if ( res.values.length == 0 )
    {
      if ( ! this.initpar.ignore_notfound  )
        MneLog.warning(MneText.sprintf(MneText.getText("#mne_lang#Keine Werte für $1:$2 gefunden"), "MneDbViewWeblet:values", this.id));
      await this.add();
      return;
    }
    else if ( res.values.length > 1 )
    {
      MneLog.warning(MneText.sprintf(MneText.getText("#mne_lang#Mehr als einen Wertesatz gefunden für $1:$2 gefunden"), "MneDbViewWeblet:values", this.id));
    }

    for ( i in this.obj.inputs )
      this.obj.inputs[i].setValue(res.values[0][res.rids[i]])

      for ( i in this.obj.outputs )
        this.obj.outputs[i].setValue(res.values[0][res.rids[i]])
    
    this.obj.run.okaction = 'mod';
    this.title = this.obj.run.title.mod;

    this.obj.run.values = {};
    for ( i =0; i<res.ids.length; i++)
      this.obj.run.values[res.ids[i]] = res.values[0][i];
  }
  
  async ok()
  {
    var p;

    p = Object.assign({}, this.obj.run[this.obj.run.okaction + 'par']);
    p = this['getParam' + this.obj.run.okaction[0].toUpperCase() + this.obj.run.okaction.substr(1)](p);

    await MneRequest.fetch(this.obj.run.btnrequest[this.obj.run.okaction], p);
    this.newvalues = true;
  }

  async cancel()
  {
    await this.values();
  }
  
  async add()
  {
    var i;

    if ( this.getModify() )
    {
      await this.ok();
      return;
    }

    for ( i in this.obj.inputs )
      this.obj.inputs[i].setValue((this.obj.defvalues[i]) ? this.obj.defvalues[i] : '');

    this.obj.run.okaction = 'add';
    this.title = this.obj.run.title.add;

    for ( i in this.obj.inputs )
      this.obj.inputs[i].setValue((this.obj.defvalues[i]) ? this.obj.defvalues[i] : '');
    
    for ( i in this.obj.outputs )
      this.obj.outputs[i].setValue((this.obj.defvalues[i]) ? this.obj.defvalues[i] : '');
  }

  async del()
  {
    var p;

    p = Object.assign({}, this.obj.run.delpar);
    p = this.getParamAdd(p);
        
    await MneRequest.fetch(this.obj.run.btnrequest['del'], p);
    this.newvalues = true;
  }
}

export default MneDbViewWeblet;

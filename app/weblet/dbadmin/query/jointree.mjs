//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/query/jointree.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbView from '/weblet/db/view.mjs'

class MneAdminJoinTree extends MneDbView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues =
    {
      classname : 'tree',
      notitle   : true,

      schema  : 'mne_application',
      table   : "querytables",
      cols    : "joindefid,deep,tabnum,fcols,tschema,ttab,tcols,op,typ",
      scols   : "tabid",
      
      showids : ['queryid'],
      
      multiresult : true
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }

  reset()
  {
    super.reset();
    this.obj.mkbuttons = [];
    this.obj.divs = [];
  }
  
  getViewPath() { return this.getView(import.meta.url) }
  getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  getParam(p)
  {
    this.tabid = 0;
    this.deep = 0;

    p = this.getFrameParam(this.obj.container.tree.firstChild, p);
    p = this.addParam(p, "janzahl", this.tabid);
    
    return p;
  }

  getFrameParam(frame, p)
  {
    var i;

    p = this.addParam(p, "jointabid" + this.tabid, this.tabid);
    p = this.addParam(p, "joindeep" + this.tabid, this.deep);
    p = this.addParam(p, "jointabnum" + this.tabid, frame.action.tabnum);

    p = this.addParam(p, "joinjoindefid" + this.tabid, frame.param.joindefid);
    p = this.addParam(p, "jointschema" + this.tabid, frame.param.tschema);
    p = this.addParam(p, "jointtab" + this.tabid, frame.param.ttab);

    p = this.addParam(p, "jointcols" + this.tabid, frame.param.tcols);
    p = this.addParam(p, "joinfcols" + this.tabid, frame.param.fcols);
    p = this.addParam(p, "joinop" + this.tabid, frame.param.op);
    p = this.addParam(p, "jointyp" + this.tabid, frame.param.typ);

    this.tabid++;
    this.deep++;
    for ( i = 0; frame.action.frame != null && i < frame.action.frame.childNodes.length; i++ )
      p = this.getFrameParam(frame.action.frame.childNodes[i], p)

      this.deep--;
    return p;

  }
  
  mkElement (values, str, classname)
  {
    var tabnum = this.obj.tabnum++;

    var div = document.createElement("div");
    div.innerHTML = '<div class="treelink">' + tabnum + " " + str + '</div><div class="treemain"></div>';
    div.firstChild.addEventListener('click', (evt) =>
    {
      var action = evt.target.parentNode.action;

        if ( evt.offsetX < 12 )
        {
            this.btnClick('showJointree', { schema : action.tschema, table : action.ttab, frame : action.frame, menu : evt.target.parentNode, initial : action.initial } );
            action.initial = false;
        }
        else
        {
          if ( evt.detail < 2 )
            this.btnClick('selectTable', action );
          else
          {
            var i;
            for ( i in evt.target.parentNode.param)
              this.obj.run.values[i] = evt.target.parentNode.param[i];
            
            this.obj.act_join = evt.target.parentNode;
            this.btnClick('openpopup', 'joinedit');
          }
        }

      evt.stopPropagation();
      evt.preventDefault();
    });

    div.firstChild.addEventListener('touchstart', (evt) => { evt.target.starttime = evt.timeStamp; });
    div.firstChild.addEventListener('touchend',   (evt) =>
    {
      if ( (evt.timeStamp - evt.target.starttime) > 1000 )
      {
        var i;
        for ( i in evt.target.parentNode.param)
          this.obj.run.values[i] = evt.target.parentNode.param[i];
        
        this.obj.act_join = evt.target.parentNode;
        this.btnClick('openpopup', 'joinedit');
     }
    });

    div.className = classname;
    div.param =
    {
        joindefid : values[this.obj.run.result.rids.joindefid],
        tschema   : values[this.obj.run.result.rids.tschema],
        ttab      : values[this.obj.run.result.rids.ttab],
        tcols     : values[this.obj.run.result.rids.tcols],
        fcols     : values[this.obj.run.result.rids.fcols],
        op        : values[this.obj.run.result.rids.op],
        typ       : values[this.obj.run.result.rids.typ]
    };

    div.action =
    {
        tabnum : tabnum,
        tschema : values[this.obj.run.result.rids.tschema],
        ttab : values[this.obj.run.result.rids.ttab],
        frame : div.lastChild,
        initial : true
    };

    div.action.frame.tables = {};

    this.obj.divs[div.action.tabnum] = div;
    return div;
  }

  async selectTable(data)
  {
    this.obj.run.values['schema'] = data.tschema;
    this.obj.run.values['table'] = data.ttab;
    this.obj.run.values['tabnum'] = data.tabnum;
    this.newselect = true;
  }
  
  async showJointree(data)
  {
    var ele;
    var i;
    var str;
    var p =
    {
        "schema" : "mne_application",
        "table"  : "joindef",
        "cols" : "joindefid,tschema,ttab,fcols,tcols,op,typ",
        "scols" : "tschema,ttab",
        "fschemaInput.old" : data.schema,
        "ftabInput.old" : data.table,
        "sqlstart" : 1,
        "sqlend" : 1
    };

    var res = this.obj.run.result = await MneRequest.fetch("db/utils/table/data.json", p );

    for ( i = 0; i<res.values.length; i++ )
    {
      if ( data.frame.tables[res.values[i][res.rids.joindefid]] == undefined )
      {
        str = res.values[i][res.rids.tschema] + "." + res.values[i][res.rids.ttab] + " ( " + res.values[i][res.rids.fcols] + " : " + res.values[i][res.rids.tcols] + " : " + res.values[i][res.rids.op] + " ) - " + res.values[i][res.rids.typ]
        ele = this.mkElement( res.values[i], str, "tree");
        data.frame.appendChild(ele);
        data.frame.tables[res.values[i][res.rids.joindefid]] = ele.action.tabnum;
      }
    }
    
    if (data.frame.firstChild == null) MneElement.mkClass(data.menu, 'treeleaf', true, 'tree');
    else MneElement.mkClass(data.menu, 'menuopen',  data.initial || ( data.menu.className.indexOf('menuopen') == -1 ));
  }

  async values_query()
  {
    var i;
    var res;
    var olddeep;
    var values;
    var max_tabnum;
    var frames = [];
    var frame = this.obj.container.tree;
    var str;
    var ele;
    
    await super.values({cols : this.initpar.cols } );
    
    if ( this.obj.run.result == undefined ) return;

    res = Object.assign({}, this.obj.run.result);
    res.values = [];
    values = this.obj.run.result.values;
    
    if ( res == undefined ) return;
    
    this.obj.tabnum = max_tabnum = parseInt(values[0][res.rids.tabnum]);
    str = values[0][res.rids.tschema] + "." + values[0][res.rids.ttab];
    ele = this.mkElement( values[0], str, "tree menuopen");

    frame.appendChild(ele);
    ele.appendChild(ele.action.frame);

    olddeep = 0;
    for ( i = 1; i < values.length; i++ )
    {
      this.obj.tabnum = parseInt(values[i][res.rids.tabnum]);
      if ( this.obj.tabnum > max_tabnum ) max_tabnum = this.obj.tabnum;

      if ( values[i][res.rids.deep] > olddeep )
      {
        frames[frames.length] = frame;
        frame = ele.action.frame;
      }
      else if ( values[i][res.rids.deep] < olddeep )
      {
        var j;
        var deep = parseInt(values[i][res.rids.deep]);

        frame = frames[deep];
        frames = frames.slice(0, deep);
      }
      olddeep = values[i][res.rids.deep];
      str = values[i][res.rids.tschema] + "." + values[i][res.rids.ttab] + " ( " + values[i][res.rids.fcols] + " : " + values[i][res.rids.tcols] + " : " + values[i][res.rids.op] + " ) - " + values[i][res.rids.typ]
      if ( i == ( values.length - 1 ) || olddeep >= values[i+1][res.rids.deep] )
        ele = this.mkElement( values[i], str, "tree");
      else
        ele = this.mkElement( values[i], str, "tree menuopen");
      frame.appendChild(ele);

      frame.tables[values[i][res.rids.joindefid]] = ele.action.tabnum;
    }
    
    this.obj.tabnum = max_tabnum + 1;
  }
  
  async values_table(p)
  {
    var str;
    var values = [];

    this.obj.tabnum = 0;
    this.obj.run.result = {
        ids : [ 'tschema', 'ttab', 'joindefid', 'tcols', 'fcols', 'op', 'typ' ],
        rids : { tschema : 0, ttab : 1, joindefid : 2, tcols : 3, fcols : 4, op : 5, typ : 6 },
        values : values
    }
    values[0] = new Array(this.obj.run.result.ids.length).fill('');
    values[0][0] = p['schemaInput.old'];
    values[0][1] = p['tableInput.old'];

    this.obj.run.values =
    {
      schema    : p['schemaInput.old'],
      table     : p['tableInput.old'],
      tabnum    : 0 ,
       };
    
    str = values[0][this.obj.run.result.rids.tschema] + "." + values[0][this.obj.run.result.rids.ttab];
    
    var ele = this.mkElement(values[0], str, "tree");
    this.obj.container.tree.appendChild(ele);

  }
  
  async values()
  {
    var p;
    
    this.obj.container.tree.innerHTML = '';

    p = this.getParamShow({});
    if ( ! p.value_not_found )
      return this.values_query();

    p = this.getParamShow({}, [ 'schema', 'table']);
    if ( ! p.value_not_found )
      return this.values_table(p);
    
    this.obj.run.values = { schema : '', table : '', tabnum : '' };
  }
  
  newjoin()
  {
    var i,str;
    var div = this.obj.act_join;
    
    for ( i in div.param)
      div.param[i] = this.obj.weblets.joinedit.obj.inputs[i].getValue();
    
    div.action.tschema = this.obj.weblets.joinedit.obj.inputs.tschema.getValue();
    div.action.ttab = this.obj.weblets.joinedit.obj.inputs.ttab.getValue();
    div.action.frame.tables = {};
    div.action.frame.innerHTML = "";
    div.action.initial = true;
    
    str = div.param.tschema + "." + div.param.ttab + " ( " + div.param.fcols + " : " + div.param.tcols + " : " + div.param.op + " ) - " + div.param.typ;
    div.querySelector('.treelink').innerText = div.action.tabnum + ' ' + str;
    MneElement.mkClass(div.querySelector('.treelink'), 'modifyok');
    
  }
  
}


export default MneAdminJoinTree;

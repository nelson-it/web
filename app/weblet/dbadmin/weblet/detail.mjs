//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/dbadmin/weblet/detail.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'

import MneDbViewWeblet     from '/weblet/db/view.mjs'

class MneAdminWebletDetail extends MneDbViewWeblet
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
        schema  : 'mne_application',
        query   : 'weblet_all', 
        showids : [ "htmlcomposeid"],
        
        okschema    : 'mne_catalog',
        okfunction  : "weblet_ok",
        delfunction : "weblet_del",

        okcols : [ 'htmlcomposeid', 'name', 'template', 'label_de', 'label_en', 'custom'],
        oktyps : { custom : 'bool' },
        
        delcols : [ 'htmlcomposeid' ],
        deltyps : [],
        
        hinput : false 
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getViewPath() { return this.getView(import.meta.url) }
    
    async findIOParam()
    {
      this.obj.inputs.mysql.noautoread = true;
      return super.findIOParam();
    }
    
    async export ()
    {
      var p = {};
      var i;
      var str = '';
      var mysql = this.obj.inputs.mysql.checked;
      var format;
      var res;
      
      p = this.addParam(p, "htmlcomposeidInput.old", this.obj.run.values.htmlcomposeid);
      p = this.addParam(p, "schema", this.initpar.schema);
      p = this.addParam(p, "sqlend", "1");
      p = this.addParam(p, "sqlstart", "1");
      p = this.addParam(p, "table",  'htmlcompose');
      p = this.addParam(p, "cols", "createdate,createuser,modifydate,modifyuser,htmlcomposeid,name,template,custom");
      
      res = await MneRequest.fetch("db/utils/table/data.json", p );
      for ( i = 0; i < res.values.length; i++ )
      {
        if ( mysql ) format = "INSERT INTO mne_application_htmlcompose( createdate, createuser, modifydate, modifyuser, htmlcomposeid, name, template, custom) VALUES ($1, '$2', $3, '$4', '$5', '$6', '$7', $8);";
        else format = "INSERT INTO mne_application.htmlcompose( createdate, createuser, modifydate, modifyuser, htmlcomposeid, name, template, custom) VALUES ($1, E'$2', $3, E'$4', E'$5', E'$6', E'$7', $8);";

        str = MneText.sprintf(format, MneText.mascarade_single(res.values[i][0],"'", "\\'"), MneText.mascarade_single(res.values[i][1],"'", "\\'"), MneText.mascarade_single(res.values[i][2],"'", "\\'"), MneText.mascarade_single(res.values[i][3],"'", "\\'"), MneText.mascarade_single(res.values[i][4],"'", "\\'"), MneText.mascarade_single(res.values[i][5],"'", "\\'"), MneText.mascarade_single(res.values[i][6],"'", "\\'"), (res.values[i][7])[0] != 'f' ) + '\n';
      }

      p.table = 'htmlcomposenames';
      p.cols = "createdate,createuser,modifydate,modifyuser,htmlcomposeid,label_de,label_en";
      res = await MneRequest.fetch("db/utils/table/data.json", p );
      for ( i = 0; i < res.values.length; i++ )
      {
        if ( mysql ) format = "INSERT INTO mne_application_htmlcomposenames ( createdate, createuser, modifydate, modifyuser, htmlcomposeid, label_de, label_en) VALUES ($1, '$2', $3, '$4', '$5', '$6', '$7');";
        else format = "INSERT INTO mne_application.htmlcomposenames ( createdate, createuser, modifydate, modifyuser, htmlcomposeid, label_de, label_en) VALUES ($1, E'$2', $3, E'$4', E'$5', E'$6', E'$7');";
        str += MneText.sprintf(format, MneText.mascarade_single(res.values[i][0],"'", "\\'"), MneText.mascarade_single(res.values[i][1],"'", "\\'"), MneText.mascarade_single(res.values[i][2],"'", "\\'"), MneText.mascarade_single(res.values[i][3],"'", "\\'"), MneText.mascarade_single(res.values[i][4],"'", "\\'"), MneText.mascarade_single(res.values[i][5],"'", "\\'"), MneText.mascarade_single(res.values[i][6],"'", "\\'")) + '\n';
      }

      p.table = 'htmlcomposetab';
      p.cols = "createdate,createuser,modifydate,modifyuser,htmlcomposeid,htmlcomposetabid,path,id,subposition,position,initpar,depend,loadpos,ugroup,custom";
      res = await MneRequest.fetch("db/utils/table/data.json", p );
      for ( i = 0; i < res.values.length; i++ )
      {
        if ( mysql ) format = "INSERT INTO mne_application_htmlcomposetab( createdate, createuser, modifydate, modifyuser, htmlcomposeid, htmlcomposetabid, path, id, subposition, position, initpar, depend, loadpos, ugroup, custom) VALUES ($1, '$2', $3, '$4', '$5', '$6', '$7', '$8', '$9', $10, '$11', '$12', '$13', '$14', $15, $16);";
        else format = "INSERT INTO mne_application.htmlcomposetab( createdate, createuser, modifydate, modifyuser, htmlcomposeid, htmlcomposetabid, path, id, subposition, \"position\", initpar, depend, loadpos, ugroup, custom) VALUES ($1, E'$2', $3, E'$4', E'$5', E'$6', E'$7', E'$8', E'$9', $10, E'$11', E'$12', E'$13', E'$14', $15, $16);";
        str += MneText.sprintf(format, MneText.mascarade_single(res.values[i][0],"'", "\\'"), MneText.mascarade_single(res.values[i][1],"'", "\\'"), MneText.mascarade_single(res.values[i][2],"'", "\\'"), MneText.mascarade_single(res.values[i][3],"'", "\\'"), MneText.mascarade_single(res.values[i][4],"'", "\\'"), MneText.mascarade_single(res.values[i][5],"'", "\\'"), MneText.mascarade_single(res.values[i][6],"'", "\\'"), MneText.mascarade_single(res.values[i][7],"'", "\\'"), MneText.mascarade_single(res.values[i][8],"'", "\\'"), MneText.mascarade_single(res.values[i][9],"'", "\\'"), MneText.mascarade_single(res.values[i][10],"'","\\'"), MneText.mascarade_single(res.values[i][11],"'","\\'"), MneText.mascarade_single(res.values[i][12],"'","\\'"), MneText.mascarade_single(res.values[i][13],"'","\\'"), (res.values[i][14])[0] != 'f') + '\n';
      }

      p.table = 'htmlcomposetabnames';
      p.cols = "createdate,createuser,modifydate,modifyuser,htmlcomposeid,label_de,label_en,htmlcomposetabid,custom";
      res = await MneRequest.fetch("db/utils/table/data.json", p );
      for ( i = 0; i < res.values.length; i++ )
      {
        if ( mysql ) format = "INSERT INTO mne_application_htmlcomposetabnames ( createdate, createuser, modifydate, modifyuser, htmlcomposeid, label_de, label_en, htmlcomposetabid, custom) VALUES ($1, '$2', $3, '$4', '$5', '$6', '$7', '$8', $9);";
        else format = "INSERT INTO mne_application.htmlcomposetabnames ( createdate, createuser, modifydate, modifyuser, htmlcomposeid, label_de, label_en, htmlcomposetabid, custom) VALUES ($1, E'$2', $3, E'$4', E'$5', E'$6', E'$7', E'$8', $9);";
        str += MneText.sprintf(format, MneText.mascarade_single(res.values[i][0],"'", "\\'"), MneText.mascarade_single(res.values[i][1],"'", "\\'"), MneText.mascarade_single(res.values[i][2],"'", "\\'"), MneText.mascarade_single(res.values[i][3],"'", "\\'"), MneText.mascarade_single(res.values[i][4],"'", "\\'"), MneText.mascarade_single(res.values[i][5],"'", "\\'"), MneText.mascarade_single(res.values[i][6],"'", "\\'"), MneText.mascarade_single(res.values[i][7],"'", "\\'"), (res.values[i][8])[0] != 'f') + '\n';
      }

      p.table = 'htmlcomposetabselect';
      p.cols = "createdate,createuser,modifydate,modifyuser,id,element,htmlcomposeid,htmlcomposetabselectid,schema,query,tab,wop,wcol,wval,scols,showcols,cols,weblet,custom,selval";
      res = await MneRequest.fetch("db/utils/table/data.json", p );
      for ( i = 0; i < res.values.length; i++ )
      {
        if ( mysql ) format = "INSERT INTO mne_application_htmlcomposetabselect( createdate, createuser, modifydate, modifyuser, id, element, htmlcomposeid, htmlcomposetabselectid, schema, query, tab, wop, wcol, wval, scols, showcols, cols, weblet, custom, selval) VALUES ($1, '$2', $3, '$4', '$5', '$6', '$7', '$8', '$9', '$10', '$11', '$12', '$13', '$14', '$15', '$16', '$17', '$18', $19, '$20', $21, E'$22');";
        else format = "INSERT INTO mne_application.htmlcomposetabselect( createdate, createuser, modifydate, modifyuser, id, element, htmlcomposeid, htmlcomposetabselectid, schema, query, tab, wop, wcol, wval, scols, showcols, cols, weblet, custom, selval) VALUES ($1, E'$2', $3, E'$4', E'$5', E'$6', E'$7', E'$8', E'$9', E'$10', E'$11', E'$12', E'$13', E'$14', E'$15', E'$16', E'$17', E'$18', E'$19', E'$20', $21, E'$22');";
        str += MneText.sprintf(format, MneText.mascarade_single(res.values[i][0],"'", "\\'"),
            MneText.mascarade_single(res.values[i][1],"'", "\\'"),
            MneText.mascarade_single(res.values[i][2],"'", "\\'"),
            MneText.mascarade_single(res.values[i][3],"'", "\\'"),
            MneText.mascarade_single(res.values[i][4],"'", "\\'"),
            MneText.mascarade_single(res.values[i][5],"'", "\\'"),
            MneText.mascarade_single(res.values[i][6],"'", "\\'"),
            MneText.mascarade_single(res.values[i][7],"'", "\\'"),
            MneText.mascarade_single(res.values[i][8],"'", "\\'"),
            MneText.mascarade_single(res.values[i][9],"'", "\\'"),
            MneText.mascarade_single(res.values[i][10],"'","\\'"),
            MneText.mascarade_single(res.values[i][11],"'","\\'"),
            MneText.mascarade_single(res.values[i][12],"'","\\'"),
            MneText.mascarade_single(res.values[i][13],"'","\\'"),
            MneText.mascarade_single(res.values[i][14],"'","\\'"),
            MneText.mascarade_single(res.values[i][15],"'","\\'"),
            MneText.mascarade_single(res.values[i][16],"'","\\'"),
            MneText.mascarade_single(res.values[i][17],"'","\\'"),
            res.values[i][18],
            MneText.mascarade_single(res.values[i][19],"'","\\'") ) + '\n';
      }

      p.table = 'htmlcomposetabslider';
      p.cols = "createdate,createuser,modifydate,modifyuser,htmlcomposeid,slidername,sliderpos,custom";
      res = await MneRequest.fetch("db/utils/table/data.json", p );
      for ( i = 0; i < res.values.length; i++ )
      {
        if ( mysql ) format = "INSERT INTO mne_application.htmlcomposetabslider ( createdate, createuser, modifydate, modifyuser, htmlcomposeid, slidername, sliderpos, custom) VALUES ($1, '$2', $3, '$4', '$5', '$6', '$7', $8);";
        else format = "INSERT INTO mne_application.htmlcomposetabslider ( createdate, createuser, modifydate, modifyuser, htmlcomposeid, slidername, sliderpos, custom) VALUES ($1, E'$2', $3, E'$4', E'$5', E'$6', E'$7', $8);";
        str += MneText.sprintf(format, MneText.mascarade_single(res.values[i][0],"'", "\\'"), MneText.mascarade_single(res.values[i][1],"'", "\\'"), MneText.mascarade_single(res.values[i][2],"'", "\\'"), MneText.mascarade_single(res.values[i][3],"'", "\\'"), MneText.mascarade_single(res.values[i][4],"'", "\\'"), MneText.mascarade_single(res.values[i][5],"'", "\\'"), MneText.mascarade_single(res.values[i][6],"'", "\\'"), (res.values[i][7])[0] != 'f') + '\n';
      }

      var s = str.split('\n');
      for ( i = (s.length - 1); i >= 0; i--)
        MneLog.message(s[i], true)
    }

}

export default MneAdminWebletDetail;

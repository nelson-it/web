//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/file/show.mjs
//================================================================================
'use strict';

import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest   from '/js/basic/request.mjs'

import { MneViewContainer } from '/weblet/basic/view.mjs'

class MneFileShow extends MneViewContainer
{
    constructor(parent, frame, id, initpar = {}, config = {} )
    {
      var ivalues = 
      {
          schema       : 'mne_crm',
          table        : 'file',
          idname       : 'fileid',
          namename     : 'name',
          datatypename : 'datatype',
          dataname     : 'data',
      };
           
      super(parent, frame, id, Object.assign(ivalues, initpar), config );
    }
    
    getCssPath()  { return (( super.getCssPath() ) ?  super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }
    
    reset()
    {
      if ( this.obj && this.obj.url ) URL.revokeObjectURL(this.obj.url);
      
      super.reset();
      
      this.initpar.schema       = ( this.parent.initpar.schema )       ? this.parent.initpar.schema : this.initpar.schema;
      this.initpar.table        = ( this.parent.initpar.table  )       ? this.parent.initpar.table  : this.initpar.table ;

      this.initpar.idname       = ( this.parent.initpar.idname )       ? this.parent.initpar.idname : this.initpar.idname;
      this.initpar.namename     = ( this.parent.initpar.namename )     ? this.parent.initpar.namename : this.initpar.namename;
      this.initpar.datatypename = ( this.parent.initpar.datatypename ) ? this.parent.initpar.datatypename : this.initpar.datatypename;
      this.initpar.dataname     = ( this.parent.initpar.dataname )     ? this.parent.initpar.dataname : this.initpar.dataname;
      
    }
    
    async loadview()
    {
       var ele = this.obj.popup.frame.querySelector('#titletext');
       var btn = document.createElement('span');
       btn.className = 'popupbutton';
       btn.id='downloadbutton';
       btn.addEventListener('click', (evt) => { this.download() } );
       
       ele.parentNode.insertBefore(btn, ele);
    }
    
    async download()
    {
      this.frame.querySelector('#download').click();
    }
    
    async base64()
    {
      if ( this.obj.run.data )
        return btoa(String.fromCharCode.apply(null, new Uint8Array(await this.obj.run.data.arrayBuffer())));

      return '';
    }
    
    async getData()
    {
      var res;
      var param =
      {
          schema : this.initpar.schema,
          table  : this.initpar.table,
          cols   : this.initpar.dataname,
          sqlstart : 1,
          sqlend : 1
      };

      param[this.initpar.idname + "Input.old"] = this.config.dependweblet.obj.run.values[this.initpar.idname];

      try
      {
        res = await MneRequest.fetch('/db/utils/table/' + this.config.dependweblet.obj.run.values[this.initpar.namename], param, true);
        return await res.blob();
      }
      catch(e)
      {
        return new Blob([], {type : 'text/plain;charset=UTF-8'});
      }

    }

    async values()
    {
      this.frame.innerHTML = '';
      
      var data = this.obj.run.data = await this.getData();

      if  ( data === false )
      {
        console.log('MneFileShow::keine daten');
        return;
      }

      var name = this.config.dependweblet.obj.run.values[this.initpar.namename] ?? this.config.dependweblet.initpar.report + ".pdf";
      if ( !name )
      {
        console.log('MneFileShow::keinen namen');
        return;
      }

      if ( this.obj.url ) URL.revokeObjectURL(this.obj.url);
      this.obj.url = URL.createObjectURL( data );

      var link = '<a id="download" style="display: none" download="' + name.split(/[\\/]/).pop() + '" href="' + this.obj.url + '">download</a>';

      if ( data.type.indexOf('application/octet-stream') != -1 )
      {
        this.frame.innerHTML = link;
        this.frame.firstChild.click();
        return;
      }

      this.frame.innerHTML = '<object type="' + data.type + '" data="' + this.obj.url + '"></object><div>'+ link + '</div>';
      this.frame.firstChild.addEventListener('error', (evt) =>
      {
        if ( this.frame.firstChild.tagName == 'A' )
          return; 

        this.frame.innerHTML = link
        this.frame.firstChild.click();
      });

      this.frame.firstChild.data = this.obj.url;
    }
}
export default MneFileShow;

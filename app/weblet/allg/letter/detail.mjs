//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/letter/detail.mjs
//================================================================================
'use strict';

import MneElement from '/weblet/basic/element.mjs'
import MneText     from '/js/basic/text.mjs'
import MneLog      from '/js/basic/log.mjs'
import MneRequest  from '/js/basic/request.mjs'
import MneConfig   from '/js/basic/config.mjs'

import MneDbView   from '/weblet/db/view.mjs'

class MneLetterDetail extends MneDbView
{
  constructor(parent, frame, id, initpar = {}, config = {} )
  {
    var ivalues = 
    {
        schema        : 'mne_base',
        query         : 'letter',
        table         : 'letter',
        showids       : ['letterid'],
        delconfirmids : ['name'],
        
        report     : 'mne_letter_reference',

        docschema  : 'mne_crm',
        doctable   : 'file',
        
        defvalues : { language : MneConfig.language },
        
        hinput : false
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config );
  }
  
  reset()
  {
    super.reset();
    
    this.obj.mkbuttons.push( { id: 'send', value : MneText.getText("#mne_lang#Versenden#")});
    this.obj.enablebuttons.buttons.push('send');
    this.obj.enablebuttons.values.push('send');


  }

  getViewPath() { return this.getView(import.meta.url) }

  async print(param = {})
  {
    var p =
    {
        wval : this.obj.run.values.letterid,
        wop  : "=",
        wcol : 'letterid',
        sort : '',
        language : this.obj.inputs.language.getValue(),
        xml0 : "lettercontent," + this.obj.inputs.data.getValue(),
        macro0 : 'havelettercontent,1',

        sqlstart : 1,
        sqlend : 1,
    };

    if ( param.send != true && ( this.obj.run.values.send != '#mne_lang#wahr' || this.obj.inputs.data.getModify()) )
      p.macro1 = 'watermark,' + MneText.getText('#mne_lang#Entwurf');

    var reportquery = this.obj.inputs.lettertyp.getValue().split('.');
    if ( reportquery.length == 2 )
    {
      p.schema = reportquery[0];
      p.query = reportquery[1];
    }

    return super.print({ param : p } );
  }
  
  async send()
  {
    
    if ( this.getModify() )
      throw new Error("#mne_lang#Zum Versenden muss der Brief gespeichert werden");

    await this.print({send : true });
    
    var p =
    {
        wval : this.obj.run.values.letterid,
        wop  : "=",
        wcol : 'letterid',
        sort : '',
        language : this.obj.inputs.language.getValue(),
        xml0 : "lettercontent," + this.obj.inputs.data.getValue(),
        base64 : '1',
        sqlstart : 1,
        sqlend : 1
    };

    var reportquery = this.obj.inputs.lettertyp.getValue().split('.');
    if ( reportquery.length == 2 )
    {
      p.schema = reportquery[0];
      p.query = reportquery[1];
    }

    var res = await MneRequest.fetch('report/' + this.initpar.report + ".pdf", p);
    
    if ( res.substr(0,5) != 'JVBER')
      throw new Exception("#mne_lang#Fehler während des Druckens gefunden#\n");

      var p = 
      {
          schema : this.initpar.docschema,
          table  : this.initpar.doctable,

          fileidInput      : '################',
          refidInput       : this.obj.inputs.refid.value,
          typInput         : 'letter',
          datatypeInput    : 'application/pdf',
          authorInput      : MneConfig.username,
          nameInput        : this.obj.inputs.name.value,
          descriptionInput : ( this.obj.inputs.subject.value ) ? this.obj.inputs.subject.value : MneText.getText('#mne_lang#kein Subject'),
          uidInput         : this.obj.inputs.letterid.value,
          dataInput        :  res,
          sqlstart         : '1',
          sqlend           : '1'
      };
      
      await MneRequest.fetch( "db/utils/table/insert.xml",  p);

      this.obj.buttons.send.disabled = true;
      this.obj.buttons.ok.disabled   = true;
      return;
  }
  
  async values(param)
  {
    await super.values(param);

    this.obj.buttons.send.disabled = this.obj.buttons.send.disabled || this.obj.outputs.send.getValue();
    this.obj.buttons.ok.disabled   = this.obj.outputs.send.getValue();
    
    if ( this.obj.defvalues.refid == '################')
      this.enable('', false);
  }
  
  async ok(param = {})
  {
    if ( param.doadd != true && this.obj.inputs.refid.getModify())
      return this.add();
    else
      return super.ok();
  }
}

export default MneLetterDetail;

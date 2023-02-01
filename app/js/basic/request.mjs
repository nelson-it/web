//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/basic/request.mjs
//================================================================================
import MneInput from '/js/basic/input.mjs'
import MneText  from '/js/basic/text.mjs'
import MneLog   from '/js/basic/log.mjs'

// ================================================================================
//  MneRequest          
// ================================================================================

class MneRequest
{
  constructor()
  {
  }

  static mkHeader(data)
  {
    const headers = new Headers();
    
    if ( ! data instanceof FormData ) headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    
    return headers
  }
  
  static mkParam(parameter = {} )
  {
    var param = "";
    var sep = "";
    var p;

    if ( parameter instanceof FormData ) return parameter;
    
    var data = new FormData();
    for ( p in parameter ) data.append(p, encodeURIComponent(parameter[p]));
    return data;
  };
  
  static async fetch( request, parameter, raw)
  {
    var data;
    var error = ( parameter && parameter.ignore_error ) ? false : true;
    
    parameter = MneRequest.mkParam(parameter);
    
    //console.info('request: ' + request + " : " + JSON.stringify(parameter));
    if ( request[0] == '/' )
    {
      console.warn('request mit führendem / ' + request);
      console.trace();
      request = request.substr(1);
      
    }

    var res = await fetch(request, {
      method: 'POST',
      headers : MneRequest.mkHeader(parameter),
      body: parameter,
    })
    
     if ( res.status < 200 || res.status > 300 )
       throw new Error(MneText.sprintf("#mne_lang#Falscher Status <$1> in Request <$2>", res.status, request));

    if ( res.status == 201 )
      location.reload();

    if ( raw ) return res;
    
    data = await res.text();
    
    if ( res.headers.get('content-type').indexOf('text/json') == 0 )
    {

      try
      {
        data = await JSON.parse(data);
      }
      catch(e)
      {
        e.message = e.message + "\n" + data;
        throw e;
      }

      if ( data.meldungen || ( data.result && data.result == 'error') )
      {
        var i;
        var error_found = false;
        var str, par;
        
        par = '\n' + MneText.getText('#mne_lang#Parameter') + '\n' + request + '\n';
        
        if ( parameter instanceof FormData )
          for ( i of parameter.keys() ) par += ( i + ": " + decodeURIComponent(parameter.get(i)) + "\n");
        else
          for ( i in parameter ) par += ( i + ": " + parameter[i] + "\n");

        str = '';
        for ( i=data.meldungen.length-1;  i>=0; i-- )
        {
          if ( data.meldungen[i][0] == 'line' )
            str += data.meldungen[i][1] + '\n';
          else
          {
            if ( error && ( data.meldungen[i][0] == 'error' ) )
              MneLog[data.meldungen[i][0]]( data.meldungen[i][1] + '\n' + str + par );
            error_found |= ( data.meldungen[i][0] == 'error' );
            par = str = '';
          }
        }

        if ( str )
          MneLog[data.meldungen[0][0]]( str );

        if ( error_found || ( data.result && data.result == 'error') )
          throw new Error();
      }


      if ( data.ids )
      {
        data.rids = {};
        data.ids.forEach( (item,index) => { data.rids[item] = index; })
      }
      else
      {
        data.ids = [ 'result' ];
        data.rids = { 'result' : 0 };
        data.labels = [ 'result' ];
        data.typs = [ '2' ];
        data.formats = [ '' ];
        data.regexps = [ [ '', '', ''] ]; 
        data.values = [[ data.result ]];
      }

      if ( data.regexps )
      {
        var i;
        data.regexps.forEach( ( item, i) => 
        {
          if ( typeof item == 'string' && item != '' )
          {
            data.regexps[i] = MneInput.checktype[item];
            if ( data.regexps[i] == undefined )
            {
              data.regexps[i] = MneInput.checktype['ok'];
              console.error('regexp ' + item + ' not found');
            }
          }
          else if ( Array.isArray(item) )
          {
            data.regexps[i] = MneInput.checktype[item[0]]  ?? { reg : new RegExp(( item[0] ) ? item[0] : '(?:.|\n)+|^$', item[1]), help : item[2] };
          }
          else
          {
            data.regexps[i] = MneInput.checktype['ok'];
          }
        });
      }
    }
    return data;
  }
  
  static async errfetch(request, parameter, errfunc = async () =>
  {
    return MneRequest.fetch('db/utils/connect/end.json', { rollback : 1 });
  }, raw)
  {
    var res;
    try 
    {
      res = await MneRequest.fetch(request, parameter, raw);
    }
    catch(e)
    {
      await errfunc();
      throw e;
    }
    
    return res;
  }
  
  static async import(request)
  {
    try
    {
      var result = await import(MneRequest.baserequest + request);
      return result;
    }
    catch(e)
    {
      await MneRequest.fetch(request);
      throw e;
    }
  }

  static async loadscript(uri)
  {
    var head = document.getElementsByTagName('head')[0];
    if ( head.querySelector('script[src="' + uri + '"]') == null )
    {
      return new Promise((resolve, reject) =>
      {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = uri;
        script.onload = () => { resolve() };
        script.onerror = () => { reject('Script <' + uri + '> konnte nicht geladen werden') };
        head.appendChild(script);
      });
    }
  }
}


MneRequest.baserequest = ((new URL(document.baseURI)).pathname);
if ( MneRequest.baserequest[MneRequest.baserequest.length -1 ] == '/' ) MneRequest.baserequest = MneRequest.baserequest.substr(0,MneRequest.baserequest.length - 1);

export default MneRequest;

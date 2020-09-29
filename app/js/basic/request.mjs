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
    
    for ( p in parameter )
    {
      param = param + sep + p + "=" + encodeURIComponent(parameter[p]);
      sep = "&";
    }
    return param;
  };
  
  static async fetch( request, parameter, raw)
  {
    var data;
    
    //console.info('request: ' + request + " : " + JSON.stringify(parameter));

    var res = await fetch(request, {
      method: 'POST',
      headers : MneRequest.mkHeader(parameter),
      body: MneRequest.mkParam(parameter) 
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
          for ( i of parameter.keys() ) par += ( i + ": " + parameter.get(i) + "\n");
        else
          for ( i in parameter ) par += ( i + ": " + parameter[i] + "\n");

        str = '';
        for ( i=data.meldungen.length-1;  i>=0; i-- )
        {
          if ( data.meldungen[i][0] == 'line' )
            str += data.meldungen[i][1] + '\n';
          else
          {
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
        for ( i = 0; i < data.regexps.length; i++ )
          data.regexps[i] = ( MneInput.checktype[data.regexps[i][0]] ) ? MneInput.checktype[data.regexps[i][0]] : { reg :new RegExp(( data.regexps[i][0] ) ? data.regexps[i][0] : '(?:.|\n)+|^$', data.regexps[i][1]), help : data.regexps[i][2] };
      }
    }
    return data;
  }
  
  static async errfetch(request, parameter, errfunc = async () =>
  {
    return MneRequest.fetch('/db/utils/connect/end.json', { rollback : 1 });
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
      var result = await import(request);
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

export default MneRequest;

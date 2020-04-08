// ================================================================================
//
// Copyright: M.Nelson - technische Informatik
//            Die Software darf unter den Bedingungen 
//            der APGL ( Affero Gnu Public Licence ) genutzt werden
//            
//    datei: js/basic/mne_docevent.js
//================================================================================
'use strict';
import MneText       from '/js/basic/text.mjs'
import MneLog        from '/js/basic/log.mjs'

document.ondragstart = function(evt) { if ( ! ( evt.target.nodeType != 3 && evt.target.draggable ) ) { evt.preventDefault(); return false; } }

class MneDocEvents 
{
  static callFunctions (evt, interests)
  {
    var i, length;

    var interest;
    var result, r;

    interest = MneDocEvents[interests + "Interests"];
    length = interest.length;
    result = true;
    for (i = 0; i < length; i++)
    {
      try
      {
        interest[i].doceventstop = false;
        r = interest[i][interests](evt);
        result = result && ! ( r == false );
        if (interest[i].doceventstop == true)
        {
          result = false;
          break;
        }
      }
      catch (e)
      {
        MneLog.exception(e);
      }
    }

    if (result == false) e.preventDefault();
   
    return result;
  };

  static addInterest(evt, obj)
  {
    if (typeof MneDocEvents[evt + "Interests"] == 'undefined')
    {
      MneDocEvents[evt + "Interests"] = new Array();
      MneDocEvents.interests[evt] = MneDocEvents[evt + "Interests"];
    }
    if (MneDocEvents[evt + "Interests"].length == 0)
    {
      if (evt.substr(0, 3) == 'win') window["on" + evt.substr(3)] = function(e)
      {
        return MneDocEvents.callFunctions(e, evt);
      };
      else document["on" + evt] = function(e)
      {
        return MneDocEvents.callFunctions(e, evt);
      };
    }
    MneDocEvents[evt + "Interests"][MneDocEvents[evt + "Interests"].length] = obj;
  };

  static removeInterest (evt, obj)
  {
    var i, oi;
    oi = MneDocEvents.interests[evt];

    if (typeof oi == 'undefined') return;

    MneDocEvents.interests[evt] = new Array();

    for (i = 0; i < oi.length; i++)
      if (oi[i] != obj) MneDocEvents.interests[evt][MneDocEvents.interests[evt].length] = oi[i];

    MneDocEvents[evt + "Interests"] = MneDocEvents.interests[evt];

    if (MneDocEvents.interests[evt].length == 0) if (evt.substr(0, 3) == 'win') window["on" + evt.substr(3)] = null;
    else document["on" + evt] = null;

  };

  static remove (obj)
  {
    var i = null;
    for (i in MneDocEvents.interests)
      MneDocEvents.removeInterest(i, obj);
  };

  static focus(obj)
  {
    if ( document.activeElement ) document.activeElement.blur();
    try { window.location.hash = obj; } catch(e) {};
    window.history.replaceState(null, null, window.location.pathname.replace(/^\/+/, '/'))
  }

  static contextmenustop(frame)
  {
  frame.addEventListener('contextmenu', function(e) { e.preventDefault(); }, false);
  }
  
  static checkInside(evt, obj)
  {

    var e = evt.target;
    var ex, ey;

    if ( evt.type.substr(0, 3) == 'key' )
    {
      var wsel = window.getSelection();
      if (wsel.rangeCount == 0) return false;

      var s = wsel.getRangeAt(0);
      e = s.startContainer;
    }
    else
    {
      try
      {

        var r = obj.getBoundingClientRect();

        ex = evt.pageX - obj.scrollLeft;
        ey = evt.pageY - obj.scrollTop;

        if (ex >= r.left && ex <= r.right && ey >= r.top && ey <= r.bottom) return true;
      }
      catch (e)
      {
        return false;
      }

    }

    while (e != null && e.checkinside != true )
    {
      if (e == obj) return true;
      e = e.parentNode;
    }

    return (e == obj);
  };
}

MneDocEvents.interests = {}

export default MneDocEvents;


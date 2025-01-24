//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/element.mjs
//================================================================================
'use strict';
import MneTheme from '/js/basic/theme.mjs'
import MneElement from '/js/basic/element.mjs'

MneTheme.loadCss('basic/element.css', 'styles/weblet');

export class MneElementWeblet extends MneElement
{
  static mkSelects(frame)
  {
    var i;
    var obj = frame.querySelectorAll('select');

    for (i = 0; i < obj.length; ++i)
      MneElementWeblet.mkSelectsSingle(obj[i]);
  }

  static mkInputs(frame)
  {
    var i;
    var obj = frame.querySelectorAll('input');

    for (i = 0; i < obj.length; ++i)
      MneElementWeblet.mkInputsSingle(obj[i]);
  }

  static mkSpans(frame)
  {
    var i;
    var obj = frame.querySelectorAll('span');

    for (i = 0; i < obj.length; ++i)
      MneElementWeblet.mkSpansSingle(obj[i]);
  }

  static mkSelectsSingle(ele)
  {
    if (ele.closest('.ele-wrapper') == undefined) 
    {
      var wrapper = document.createElement('div');
      wrapper.className = 'ele-wrapper input-wrapper contain-select';
      if (ele.parentNode) ele.parentNode.insertBefore(wrapper, ele.nextSibling);
      wrapper.appendChild(ele);
      MneElement.mkClass(ele, 'eventelement');
      ele.cleared = true;
    }
    else
    {
      MneElement.mkClass(ele, 'eventelement')
    }
  }

  static mkInputsSingle(ele)
  {
    if (ele.closest('.ele-wrapper') != undefined) 
    {
      MneElement.mkClass((ele.type == 'checkbox') ? ele.closest('.ele-wrapper').lastChild : ele, 'eventelement')
      return;
    }

    switch (ele.type)
    {
      case 'password':
      case 'text':
        var wrapper = document.createElement('div');
        wrapper.className = 'ele-wrapper input-wrapper contain-text';
        if (ele.parentNode) ele.parentNode.insertBefore(wrapper, ele.nextSibling);
        wrapper.appendChild(ele);
        MneElement.mkClass(ele, 'eventelement');
        if (ele.type == 'text') ele.type = "text";
        break;

      case 'checkbox':
        var wrapper = document.createElement('div');
        var rdonly = ele.readOnly;
        wrapper.className = 'ele-wrapper input-wrapper contain-checkbox' + ( ( rdonly ) ? '' : ' rdolny');
        if (ele.parentNode) ele.parentNode.insertBefore(wrapper, ele.nextSibling);
        wrapper.appendChild(ele)
        wrapper.appendChild(document.createElement('label'))
        MneElement.mkClass(wrapper.lastChild, 'eventelement');
        if ( ! rdonly )
          wrapper.lastChild.addEventListener('click', function() { var ele = this.previousSibling; ele.checked = !ele.checked; ele.setAttribute('checked', ele.checked) })
        break;

      case 'file':
        var wrapper = document.createElement('div');
        wrapper.className = 'ele-wrapper input-wrapper contain-file';
        if (ele.parentNode) ele.parentNode.insertBefore(wrapper, ele.nextSibling);

        wrapper.appendChild(document.createElement('span'));
        MneElement.mkClass(wrapper.lastChild, "output");

        wrapper.appendChild(document.createElement('label'));
        wrapper.lastChild.appendChild(ele);
        ele.addEventListener('change', (evt) =>
        {
          if (this.ignoredefaultlistener) return;

          var f = '';
          Array.from(evt.target.files).forEach((item) => { f += item.name + ';' });

          evt.target.parentNode.previousSibling.innerHTML = f.replace(/;$/, '');
        }, false);
        MneElement.mkClass(ele, 'eventelement');
        break;

      default:
        MneElement.mkClass(ele, 'ele-wrapper');
        MneElement.mkClass(ele, 'eventelement');
        break;
    }
  }

  static mkSpansSingle(ele)
  {
    ele.cleared = false;

    if (ele.closest('.ele-wrapper') == undefined) 
    {
      var wrapper = document.createElement('span');
      wrapper.className = 'ele-wrapper contain-span';
      if (ele.parentNode) ele.parentNode.insertBefore(wrapper, ele.nextSibling);
      wrapper.appendChild(ele);
      MneElement.mkClass(ele, 'eventelement');
    }
    else
    {
      MneElement.mkClass(ele, 'eventelement')
    }

  }

  static mkElements(frame)
  {
    MneElementWeblet.mkSelects(frame);
    MneElementWeblet.mkInputs(frame);
    MneElementWeblet.mkSpans(frame);
  }

  static moveCursor(ele, begin = false)
  {
    var range = document.createRange();
    range.selectNodeContents(ele);
    range.collapse(begin);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

}

export default MneElementWeblet

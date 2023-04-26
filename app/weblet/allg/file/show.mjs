//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/allg/file/show.mjs
//================================================================================
'use strict';

//import MneText    from '/js/basic/text.mjs'
//import MneLog     from '/js/basic/log.mjs'
//import MneRequest from '/js/basic/request.mjs'
import MneFile from '/js/basic/file.mjs'

import { MneViewContainer } from '/weblet/basic/view.mjs'

class MneFileShow extends MneViewContainer
{
  constructor(parent, frame, id, initpar = {}, config = {})
  {
    var ivalues =
    {
      nowebletframe : true
    };

    super(parent, frame, id, Object.assign(ivalues, initpar), config);
  }

  getCssPath() { return ((super.getCssPath()) ? super.getCssPath() + ',' : '') + this.getCss(import.meta.url); }

  reset()
  {
    if (this.obj && this.obj.url) URL.revokeObjectURL(this.obj.url);

    super.reset();

    this.obj.observer.frame = new IntersectionObserver((is) => { if ( is[0].isIntersecting == 0 && this.obj.container.show ) this.close() }, { root : document.body } );
    this.obj.observer.frame.observe(this.frame);
    
    this.obj.htmlcontent = '<div id="showContainer"></div>';
    
    this.obj.showerror = () =>
    {
      if (this.obj.container.show.firstChild.tagName == 'A')
      {
        this.close();
        return;
      }

      this.obj.container.show.innerHTML = link
      this.obj.container.show.firstChild.click();
      this.close();
    };
 

  }

  async loadready()
  {
    var btn = document.createElement('span');
    btn.className = 'popupbutton';
    btn.id = 'downloadbutton';
    btn.addEventListener('click', () => { this.download() });

    this.obj.title.button.insertBefore(btn, this.obj.title.button.firstChild);

    return super.loadready();
  }

  async download()
  {
    this.frame.querySelector('#download').click();
  }

  async base64()
  {
    if (this.obj.run.data)
      return btoa(String.fromCharCode.apply(null, new Uint8Array(await this.obj.run.data.arrayBuffer())));

    return '';
  }

  async getData()
  {
    console.log("Kein get Data definiert");
    return new Blob([], { type: 'text/plain;charset=UTF-8' });
  }


  async close()
  {
    var video = this.obj.container.show.querySelector('video');
    if (video)
    {
      this.obj.container.show.firstChild.removeEventListener('error', this.obj.showerror );
      video.pause()
      video.src = "blob:https://tphoto/"
    }

    this.obj.container.show.innerHTML = '';
    return super.close();
  }


  async values()
  {
 
    var video = this.obj.container.show.querySelector('video');
    if (video)
    {
      this.obj.container.show.firstChild.removeEventListener('error', this.obj.showerror );
      video.pause()
      video.src = "blob:https://tphoto/"
    }

    this.obj.container.show.innerHTML = '';

    if (!this.visible) return;

    var data = this.obj.run.data = await this.getData();

    if (data === false)
    {
      console.log('MneFileShow::keine daten');
      return;
    }

    var name = this.config.dependweblet.obj.run.values[this.initpar.namename] ?? this.config.dependweblet.initpar.report + ".pdf";
    if (!name)
    {
      console.log('MneFileShow::keinen namen');
      return;
    }

    var type = data.type;

    if (type.indexOf('application/octet-stream') != -1)
    {
      type = MneFile.check(new Uint8Array(await data.slice(0, Math.min(MneFile.maxsize, data.size)).arrayBuffer()), name.split('.')[name.split('.').length - 1].toLowerCase());
      data = new Blob([data], { type: type });
    }

    if (this.obj.url) URL.revokeObjectURL(this.obj.url);
    this.obj.url = URL.createObjectURL(data);

    var link = '<a id="download" style="display: none" download="' + name.split(/[\\/]/).pop() + '" href="' + this.obj.url + '">download</a>';

 
    switch (true)
    {
      case type.indexOf('video') == 0:
        var values = this.config.dependweblet.obj.run.values;
        var p = "rootInput.old=" +  this.initpar.root + "&dirInput.old=" +  values.dir + "&filenameInput.old=" + values.filename;
        link = '<a id="download" style="display: none" download="' + name.split(/[\\/]/).pop() + '" href="file/download.html?' + p + '">download</a>';
        this.obj.container.show.innerHTML = '<video controls autoplay><source src="file/stream.dat?' + p + '" type="video/mp4"></video><div id="link">' + link + '</div>';
        break;

      case type.indexOf('audio') == 0:
        this.obj.container.show.innerHTML = '<audio controls><source src="' + this.obj.url + '" type="' + type + '"></audio><div id="link">' + link + '</div>';
        break;

      case type.indexOf('application/octet-stream') == 0:
        this.obj.container.show.innerHTML = link;
        this.obj.container.show.firstChild.click();
        this.close();
        return;

      default:
        this.obj.container.show.innerHTML = '<object type="' + type + '" data="' + this.obj.url + '"></object><div id="link">' + link + '</div>';
        break;
    }

    this.obj.container.show.firstChild.addEventListener('error', this.obj.showerror );
  }
}
export default MneFileShow;

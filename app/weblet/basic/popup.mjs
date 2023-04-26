//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: weblet/basic/popup.mjs
//================================================================================
'use strict';

import MneRequest    from '/js/basic/request.mjs'
import MneElement    from '/js/basic/element.mjs'
import MnePopupFrame from '/js/geometrie/popup.mjs'

class MyPopupFrame extends MnePopupFrame
{
  constructor(frame, title, nointeractive = false, parent, weblet, popupweblet )
  {
    super(frame, title, nointeractive, parent);
    this.weblet = weblet;
    this.popupweblet = popupweblet;
  }
  
  async reload ()
  {
    var parent = window.main_weblet.find_parent(this.weblet);
    var id = this.weblet.id;
    
    await this.weblet.reload();
    
    this.weblet = parent.obj.weblets[id];
  }
  
  async query()
  {
    this.weblet.obj.buttons.query = this.frame.querySelector('#querybutton');
    return this.weblet.query();
  }
  
  //ffullscreen()
  //{
  //  MneFullscreen.fullscreen(this.obj.buttons.fullscreen, this.frame);
  //}
  
  close()
  {
    this.popupweblet.autoclose = false;
    return super.close();
  }
}

class MnePopupWeblet
{
    constructor( id, initpar = {}, config = {} )
    {
      this.id = id;
      this.initpar = initpar;
      this.config = config;

      if ( ! this.config.parentframe ) this.config.parentframe = document.body;
    }
    
    reset()
    {
      if ( this.popup && this.popup.frame && this.popup.frame.parentNode ) this.popup.frame.parentNode.removeChild(this.popup.frame);
    }
    
    async getWeblet(path)
    {
      var pw = this;
      let { default: Weblet } = await MneRequest.import(path);
      
      class MyWeblet extends Weblet
      {
        reset()
        {
          super.reset();
          this.initpar.notitleframe = true;
        }
        
        async load()
        {
          await super.load();
          
          this.obj.title.text   = pw.popup.frame.querySelector("#titletext");
          this.obj.title.middle = pw.popup.frame.querySelector("#titlemiddle");
          this.obj.title.button = pw.popup.frame.querySelector("#titlebutton");

          this.title = ( this.config.label ) ? this.config.label : this.id;
          
          if ( this.obj.container.content)
          {
            this.obj.observer.popup = new ResizeObserver( (_rs) => 
            {
              if ( (MneElement.getWidth(pw.popup.frame.parentNode) - MneElement.getRight(pw.popup.frame)) < 0 )
                pw.popup.frame.style.left = Math.max(MneElement.getWidth(pw.popup.frame.parentNode) - MneElement.getWidth(pw.popup.frame)) + 'px';
              
              if ( (MneElement.getHeight(pw.popup.frame.parentNode) - MneElement.getBottom(pw.popup.frame)) < 0 )
                pw.popup.frame.style.top = Math.max(0, MneElement.getHeight(pw.popup.frame.parentNode) - MneElement.getHeight(pw.popup.frame)) + 'px';
              
            });
            this.obj.observer.popup.observe(pw.popup.frame);
          }
          
          return this.loadready();
        }

        set title(title)
        {
          if ( this.obj.title.text ) this.obj.title.text.textContent = title;
        }
        
        async show( hide = false, checkauto = false )
        {
          await super.show(hide);

          if ( hide == false )
            await pw.show(checkauto);
        }
        
        async close(auto = false)
        {
          await pw.close(auto);
          await super.close();
        }
      }
      
      return MyWeblet;
    }
    
    async show( hide = false, repos = true, checkauto = false )
    {
      if ( checkauto && this.autoclose != true )
        return;

      if ( hide !== true )
        this.popup.show(repos);
    }

    async close(auto = false)
    {
      if ( this.popup.visible )
      {
        this.popup.close();
        this.autoclose = auto;
      }
    }
    
    async create( parent, config = {}, initpar = {} )
    {
      
      if ( parent.obj.weblets[this.id] == undefined || this.popup == undefined || this.config.parentframe.contains(this.popup.frame) == false )
      {
        var container;
        
        var Weblet =  await this.getWeblet(this.config.path + '.mjs');
        var weblet = parent.obj.weblets[this.id] = new Weblet(parent, (container = document.createElement('div')), this.id, Object.assign(Object.assign({}, this.initpar), initpar ), Object.assign(Object.assign({}, this.config), config) )

        this.popup = new MyPopupFrame(container, '', this.config.nointeractive, this.config.parentframe, weblet, this )
        weblet.initpar.popup = weblet.initorig.popup = this.popup;
        
        return true;
      }
      
      return false;
    }

    setParentframe(parent, frame)
    {
      if ( parent.obj.weblets[this.id] )
      {
        this.config.parentframe = parent.obj.weblets[this.id].config.parentframe = frame;
        frame.appendChild(this.popup.frame);
      }
      else
      {
        this.config.parentframe = frame;
      }
    }
}

export default MnePopupWeblet;

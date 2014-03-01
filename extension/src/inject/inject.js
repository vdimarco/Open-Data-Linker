chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
	} 
	}, 10);
});

var _RDFF = {

  Init: function() {
    this.Notice.Init();
    this.Toolbar.Init();
    this.Events.Init();
    
    this.Content.Parse();
    this.Content.Push();
  },

  Toolbar: {
    
    Infos: {
      toolbar: undefined
    },

    Init: function() {
      
      var t = $('<div>');
      var t_container = $('<div>');
      var t_opener = $('<div>');
      var t_logo = $('<div>');
      var t_close = $('<div>');
      var t_content = $('<div>');
      var t_action_highlighter = $('<button>');
      
      t.attr('id', '_rdff');
      t.addClass('animate_all_125');
      t_opener.addClass('rdff_opener');
      t_logo.addClass('rdff_logo');
      t_close.addClass('rdff_close');
      t_container.addClass('rdff_container');
      t_content.addClass('rdff_content');
      t_action_highlighter.addClass('rdff_tool rdff_highlighter');
      t_action_highlighter.attr('title', 'Highlighter');
      
      t_opener.click(function() {
        t.addClass('rdff_opened');
      });
      t_close.click(function() {
        t.removeClass('rdff_opened');
      });

      t_content.append(t_logo);
      t_content.append(t_close);
      t_content.append(t_action_highlighter);
      t_container.append(t_opener);
      t_container.append(t_content);
      t.append(t_container);
      
      t.find('.rdff_tool').click(function() {
        $(this).toggleClass('rdff_active');
        
        if($(this).hasClass('rdff_active')) {
          _RDFF.Notice.Show($(this).attr('title') + ' activated');
        }
        else {
          _RDFF.Notice.Show($(this).attr('title') + ' disactivated');
        }
      });
      
      t_action_highlighter.click(function() {
        
        if($(this).hasClass('rdff_active')) {
          _RDFF.Events.InitHighlighter();
        }
        else {
          _RDFF.Events.CancelHighlighter();
        }
      });
      
      $('body').append(t);
      
      this.Infos.toolbar = t;
    }
  },
  
  Notice: {
    
    Infos: {
      showTimeout: undefined
    },
    
    Init: function() {
      var n = $('<div>');
      n.attr('id', '_rdff_notice');
      $('body').append(n);
    },
    
    Show: function(message) {
      var n = $('#_rdff_notice');
      n.text(message);
      n.show();
      
      n.css('top', ((window.innerWidth / 2) - (n.outerWidth() / 2)) + 'px')
       .css('left', ((window.innerHeight / 2) - (n.outerHeight() / 2)) + 'px');
      
      clearTimeout(this.Infos.showTimeout);
      this.Infos.showTimeout = setTimeout(function() {
        n.fadeOut(250);
      }, 1000);
    }
  },
  
  Events: {
    
    Init: function() {
      
      $('body').click(function(e) {
        
        if($(e.target).is('#_rdff') || $(e.target).parents('#_rdff').length > 0) {return;}
        _RDFF.Toolbar.Infos.toolbar.removeClass('rdff_opened');
      });
    },
    
    InitHighlighter: function() {
      
      var namespace = '._rdff_highlighter';
      $('*').bind('mouseenter' + namespace, function(e) {
        
        $('._rdff_highlighter').removeClass('_rdff_highlighter');
        $(e.target).addClass('_rdff_highlighter');
      });
      $('*').bind('click' + namespace, function(e) {
        
        if($(e.target).is('#_rdff') || $(e.target).parents('#_rdff').length > 0) {return;}
        
        var path = _RDFF.Content.GetPath($(e.target));
        alert(path);
        return false;
      });
    },
    
    CancelHighlighter: function() {
      
      var namespace = '._rdff_highlighter';
      $('*').unbind(namespace);
      $('._rdff_highlighter').removeClass('_rdff_highlighter');
    }
  },

  Content: {
    
    Infos: {
      parsedContent: undefined
    },
    
    GetPath: function(obj) {
      
      var keepGoing = true;
      var current = obj;
      var path = '';
      
      while(!current.is('body') && keepGoing) {
          
        if(current.attr('id') != undefined) {
          keepGoing = false;
          path = '#' + current.attr('id') + ' ' + path;
        }
        else {
          path = '> :eq(' + current.index() + ') ' + path;
        }
        
        current = current.parent();
      }
      
      return path.trim();
    },
    
    Parse: function() {
        
      var t = {};
      var p = {};
      var i = {};
      
      $('h1,h2,h3,h4,h5,h6').each(function() {
        
        var html = $(this).html().trim();
        
        if(html == '') {return;}
        
        var path = _RDFF.Content.GetPath($(this));
        t[path] = html;
      });
      
      $('p').each(function() {
        
        var html = $(this).html().trim();
        
        if(html == '') {return;}
        
        var path = _RDFF.Content.GetPath($(this));
        p[path] = html;
      });
      
      $('img').each(function() {
        
        var src = $(this).attr('src');
        
        if(src == undefined) {return;}
        
        var path = _RDFF.Content.GetPath($(this));
        i[path] = src;
      });
      
      this.Infos.parsedContent = {
        headings: t,
        paragraphs: p,
        images: i
      };
    },
    
    Push: function() {
      
      $.ajax({
        url: 'http://rdff.com/call',
        dataType: 'json',
        type: 'post',
        data: {
          content: this.Infos.parsedContent
        },
        success: function(data) {
          
          if(data.success) {
            
            _RDFF.Content.Inject(data.content);
          }
          else {
            
            console.log(data);
          }
        }
      });
    },
    
    Inject: function(content) {
      
      console.log(content);
    }
  }
};

$(document).ready(function() {
  _RDFF.Init();  
});

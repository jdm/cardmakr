var currentView;

function switchView(view) {
  $('.visible').removeClass('visible');
  if (view != 'inside-spread')
    $(document.getElementById(view)).addClass('visible');
  currentView = view;
}

$(document).ready(function() {
  switchView('front');

  $('#front-entry').click(function() {
    switchView('front');
  });

  $('#back-entry').click(function() {
    switchView('back');
  });

  $('#left-entry').click(function() {
    switchView('inside-left');
  });

  $('#right-entry').click(function() {
    switchView('inside-right');
  });  

  $('#spread-entry').click(function() {
    switchView('inside-spread');
    $('#inside-left').addClass('visible');
    $('#inside-right').addClass('visible');
  });
                    
  $('#insert-text').click(function() {
    addText();
  });
                    
  $('#insert-picture');
                    
  var triggers = $(".modalInput").overlay({ 
    mask: {
      color: '#ebecff',
      loadSpeed: 200,
      opacity: 0.9
    },
    closeOnClick: false
  });
                    
  $("#prompt form").submit(function(e) {
    triggers.eq(0).overlay().close();

    var input = $("input", this).val();

    $.ajax('cgi-bin/fetch.cgi',
           {success: function(data, status, xhr) {
              addPicture(data, xhr.getResponseHeader('Content-Type'));
            },
            error: function(xhr, status, errorThrown) {
              console.log("Couldn't load " + input + ": " + errorThrown);
            },
            dataType: 'text',
            data: {url: input},
            type: 'GET'});

    // do not submit the form
    return e.preventDefault();
  });
});

function eventContainer(target) {
  var container = null;
  while (target) {
    if ($(target).hasClass('quadrant')) {
      container = target;
      break;
    }
    target = target.parentNode;
  }

  return container;
}

var gSelected;
function deselect() {
  $('.selected').removeClass('selected');
  gSelected = null;
}

function selectElement(elem) {
  deselect();
  gSelected = elem;
  $(gSelected).addClass('selected');
}

var gMousePressed;
var gMouseOffset = {};
var gInitialSelection = true;
$(document).mousedown(function(ev) {
  if (ev.button != 0)
    return;

  gMousePressed = true;
  gInitialSelection = true;
  var container = eventContainer(ev.target);
  if (!container)
    return;

  if (ev.target == gSelected) {
    gInitialSelection = false;
    return;
  }

  if (gSelected && gSelected.contentEditable == "true") {
    gSelected.contentEditable = "false";
  }

  deselect();

  if (container == ev.target)
    return;

  gMouseOffset = {x: ev.clientX - ev.target.offsetLeft - container.offsetLeft,
                  y: ev.clientY - ev.target.offsetTop - container.offsetTop};
  selectElement(ev.target);
  ev.preventDefault();
});

$(document).mousemove(function(ev) {
  ev.preventDefault();
  if (!gMousePressed)
    return;
  
  gInitialSelection = true;
  var container = eventContainer(gSelected);
  var left  = ((ev.clientX - container.offsetLeft - gMouseOffset.x) / container.clientWidth) * 100;
  if (left < 0)
    left = 0;
  if (left > 100)
    left = 100;
  gSelected.style.left = left + "%";

  var top = ((ev.clientY - container.offsetTop - gMouseOffset.y) / container.clientHeight) * 100;
  if (top < 0)
    top = 0;
  if (top > 100)
    top = 100;
  gSelected.style.top = top + "%";
});

$(document).mouseup(function(ev) {
  ev.preventDefault();
  if (!gMousePressed)
    return;
  gMousePressed = false;

  if (!gInitialSelection && gSelected == ev.target) {
    gSelected.contentEditable = "true";
    gSelected.focus();
  }
});

function addText() {
  var sp = document.createElement('span');
  sp.textContent = "Your text goes here";
  sp.setAttribute('class', "newtext");
  sp.style.position = 'absolute';
  sp.style.left = "50%";
  sp.style.top = "50%";
  $(sp).appendTo($('.quadrant.visible').first()); //XXX spread
};

function setSizeRelativeTo(element, container) {
  var mult = window.clientWidth >= 1600 ? 3 : window.clientWidth >= 1024 ? 2 : 1;
  element.style.width = mult * 100 + "%";
  element.style.height = mult * 100 + "%";
}

function addPicture(dataURI, type) {
  var img = document.createElement('img');
  img.src = "data:" + type + ";base64," + dataURI;
  img.style.position = 'absolute';
  img.style.left = "50%";
  img.style.top = "50%";
  var container = $('.quadrant.visible').first(); //XXX spread
  setSizeRelativeTo(img, container.get(0));
  $(img).appendTo(container);
}

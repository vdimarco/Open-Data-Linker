chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
	} 
	}, 10);
});

$(document).ready(function() {

  var t = $('<div>');
  var t_container = $('<div>');
  var t_opener = $('<div>');
  var t_content = $('<div>');
  var t_action_highlighter = $('<div>');
  
  t.attr('id', '_rdff');
  t_opener.addClass('opener');
  t_container.addClass('container');
  t_content.addClass('content');
  t_action_highlighter.addClass('tool highlighter');

  t_content.append(t_action_highlighter);
  t_container.append(t_opener);
  t_container.append(t_content);
  t.append(t_container);
  
  $('body').append(t);
});

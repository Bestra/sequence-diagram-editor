$(function() {

  var $title = $("#title input");
  var $diagram = $("#diagram");
  var $newDiagramButton = $("#new-diagram");
  var $editor = $('#editor');
  var $savedDiagrams = $("#saved-diagrams");
  var $savedDiagramTemplate = $('#templates .saved-diagram');
  var $sampleDiagramTemplate = $('#templates .sample-diagram pre');
  var currentDiagram = null;

  var updateDiagram = function(event) {
    var seqDesc = $editor.val();
    try {
      var parsed = Diagram.parse(seqDesc);
      $diagram.empty();
      parsed.drawSVG('diagram', { theme: 'simple' });
      $editor.removeClass('compile-error');
    } catch(e) {
      $editor.addClass('compile-error');
      console.log("parse error");
    }
    saveDiagram();
  };

  var saveDiagram = function() {
    var title = $title.val();
    if(title.length) {
      var existing = window.localStorage[title];
      window.localStorage[title] = $editor.val();
      if(!existing) {
        addSavedItemToList(title);
      }
    }
  };

  var addSavedItemToList = function(name) {
    var $item = $savedDiagramTemplate.clone();
    $item.find('.name').text(name);
    $savedDiagrams.append($item);
  };

  var switchToSavedItem = function(e) {
    e.preventDefault();
    saveDiagram();
    var $item = $(this);
    var name = $item.text();
    currentDiagram = name;
    $title.val(name);
    $editor.val(window.localStorage[name]);
    updateDiagram();
  };

  var removeSavedItem = function(e) {
    e.preventDefault();
    var $item = $(this).closest('.saved-diagram');
    var name = $item.find('.name').text();
    $item.remove();
    window.localStorage.removeItem(name);
    if(name === currentDiagram) {
      blankDiagram();
    }
  };

  var changeDiagramName = function(e) {
    var title = $title.val();
    var existing = undefined;

    if(currentDiagram) {
      existing = window.localStorage[currentDiagram];
    }

    if(existing) {
      window.localStorage.removeItem(currentDiagram);
      window.localStorage[title] = existing;
      currentDiagram = title;
      resetSavedItemList();
    } else {
      if(title) {
        currentDiagram = title;
        addSavedItemToList(currentDiagram);
      } else {
        currentDiagram = null;
      }
    }
  };

  var resetSavedItemList = function() {
    $savedDiagrams.empty();
    for(key in window.localStorage) {
      addSavedItemToList(key);
    }
  };

  var blankDiagram = function(e) {
    if(e) { e.preventDefault(); }
    currentDiagram = null;
    $title.val('');
    $editor.val($sampleDiagramTemplate.text());
    updateDiagram();
  };

  resetSavedItemList();
  blankDiagram();

  $newDiagramButton.on('click', blankDiagram);
  $savedDiagrams.on('click', '.remove-saved-item', removeSavedItem);
  $savedDiagrams.on('click', '.name', switchToSavedItem);
  $title.on('keyup', _.debounce(changeDiagramName, 800));
  $editor.on('keyup', _.debounce(updateDiagram, 800));
  updateDiagram();

});


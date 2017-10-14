phantasus.HeatMapToolBar = function (heatMap) {
  this.heatMap = heatMap;
  this.rowSearchResultModelIndices = [];
  this.columnSearchResultModelIndices = [];
  var _this = this;
  var layout = ['<div class="hidden-print">'];
  layout.push('<div data-name="toolbar"></div>');
  layout.push(
    '<div data-name="tip" style="white-space:nowrap; border-top: thin solid #e7e7e7;margin-bottom:2px;height: 14px; font-size: 10px;overflow:hidden;"></div>');
  layout.push('</div>');

  var $el = $(layout.join(''));
  var searchHtml = [];
  var $searchForm = $(
    '<form style="display:inline-block;margin-right:14px;" name="searchForm"' +
    ' class="form' +
    ' form-inline' +
    ' form-compact"' +
    ' role="search"></form>');
  $searchForm.on('submit', function (e) {
    e.preventDefault();
  });

  // toogle search buttons
  searchHtml.push('<div title="Toggle' +
    ' Search (' + phantasus.Util.COMMAND_KEY + '/)" class="btn-group"' +
    ' data-toggle="buttons">');
  searchHtml.push('<label class="btn btn-default btn-xxs">');
  searchHtml.push(
    '<input data-search="rows" type="radio" autocomplete="off" name="searchToggle"' +
    ' type="button"> Rows');
  searchHtml.push('</label>');

  searchHtml.push('<label class="btn btn-default btn-xxs">');
  searchHtml.push(
    '<input data-search="columns" type="radio" autocomplete="off" name="searchToggle"> Columns');
  searchHtml.push('</label>');

  searchHtml.push('<label class="btn btn-default btn-xxs">');
  searchHtml.push(
    '<input data-search="values" type="radio" autocomplete="off" name="searchToggle">' +
    ' Values');
  searchHtml.push('</label>');

  searchHtml.push('<label class="btn btn-default btn-xxs">');
  searchHtml.push(
    '<input data-search="rowDendrogram" type="radio" autocomplete="off"' +
    ' name="searchToggle"> Row Dendrogram');
  searchHtml.push('</label>');

  searchHtml.push('<label class="btn btn-default btn-xxs">');
  searchHtml.push(
    '<input data-search="columnDendrogram" type="radio" autocomplete="off"' +
    ' name="searchToggle"> Column Dendrogram');
  searchHtml.push('</label>');
  searchHtml.push('</div>');

  function createSearchOptionsMenu() {
    searchHtml.push('<div style="display:inline-block;" class="dropdown">');
    searchHtml.push(
      '<button type="button" class="btn btn-default btn-xxs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <span class="fa fa-caret-down"></span></button>');
    searchHtml.push('<ul data-name="searchOptions" class="dropdown-menu">');
    searchHtml.push(
      '<li><a data-group="matchMode" data-name="exact" href="#"><span' +
      ' data-type="toggle"></span>Exact' +
      ' Match</a></li>');
    searchHtml.push(
      '<li><a data-group="matchMode" data-name="contains" href="#"><span' +
      ' data-type="toggle"' +
      ' class="dropdown-checkbox fa fa-check"></span>Contains</a></li>');
    searchHtml.push('<li role="separator" class="divider"></li>');

    searchHtml.push(
      '<li><a data-group="searchMode" data-name="matchAny" href="#"><span' +
      ' data-type="toggle"' +
      ' class="dropdown-checkbox fa fa-check"></span>Match Any Search Term</a></li>');

    searchHtml.push(
      '<li><a data-group="searchMode" data-name="matchAll" href="#"><span' +
      ' data-type="toggle"></span>Match All Search Terms</a></li>');

    searchHtml.push('<li role="separator" class="divider"></li>');
    searchHtml.push('<li><a data-name="searchHelp" href="#">Help</a></li>');
    searchHtml.push('</ul>');
    searchHtml.push('</div>');
  }

  function createSearchMenu(dataName, navigation) {
    searchHtml.push(
      '<div style="display:inline-block;" data-name="' + dataName + '">');
    searchHtml.push('<div class="form-group">');
    searchHtml.push(
      '<input type="text" class="form-control input-sm" autocomplete="off"' +
      ' name="search">');
    searchHtml.push('</div>');
    searchHtml.push('<div class="form-group">');
    searchHtml.push(
      '<span data-name="searchResultsWrapper" style="display:none;">');
    searchHtml.push(
      '<span style="font-size:12px;" data-name="searchResults"></span>');
    if (navigation) {
      searchHtml.push(
        '<button name="previousMatch" type="button" class="btn btn-default btn-xxs" data-toggle="tooltip" title="Previous"><i class="fa fa-chevron-up"></i></button>');
      searchHtml.push(
        '<button name="nextMatch" type="button" class="btn btn-default btn-xxs" data-toggle="tooltip" title="Next"><i class="fa fa-chevron-down"></i></button>');
      searchHtml.push(
        '<button name="matchesToTop" type="button" class="btn btn-default btn-xxs" data-toggle="tooltip" title="Matches To Top"><i class="fa fa-level-up"></i></button>');
    }
    searchHtml.push('</span>');
    searchHtml.push('</div>');
    searchHtml.push('</div>');
    searchHtml.push('</div>');
  }

  if (heatMap.options.toolbar.searchRows ||
    heatMap.options.toolbar.searchColumns ||
    heatMap.options.toolbar.searchValues) {
    createSearchOptionsMenu();
  }
  if (heatMap.options.toolbar.searchRows) {
    createSearchMenu('searchRowsGroup', true);
  }
  if (heatMap.options.toolbar.searchColumns) {
    createSearchMenu('searchColumnsGroup', true);
  }

  if (heatMap.options.toolbar.searchValues) {
    createSearchMenu('searchValuesGroup', false);
  }
  createSearchMenu('searchRowDendrogramGroup', false);
  createSearchMenu('searchColumnDendrogramGroup', false);

  // dimensions
  if (heatMap.options.toolbar.dimensions) {
    searchHtml.push('<div class="form-group">');
    searchHtml.push(
      '<h6 style="display: inline; margin-left:10px;" data-name="dim"></h6>');
    searchHtml.push(
      '<h6 style="display: inline; margin-left:10px; background-color:rgb(182,213,253);"' +
      ' data-name="selection"></h6>');
    searchHtml.push('</div>');
  }

  var $menus = $(
    '<div style="display: inline-block;margin-right:14px;"></div>');

  function createMenu(menuName, actions, minWidth) {
    if (!minWidth) {
      minWidth = '0px';
    }
    var menu = [];
    var dropdownId = _.uniqueId('phantasus');
    menu.push('<div class="dropdown phantasus-menu">');
    menu.push(
      '<a class="dropdown-toggle phantasus-black-link phantasus-black-link-background" type="button"' +
      ' id="' + dropdownId +
      '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">');
    menu.push(menuName);

    menu.push('</a>');
    menu.push('<ul style="min-width:' + minWidth +
      ';" class="dropdown-menu" aria-labelledby="' + dropdownId + '">');
    actions.forEach(function (name) {
      if (name == null) {
        menu.push('<li role="separator" class="divider"></li>');
      } else {
        var action = heatMap.getActionManager().getAction(name);
        if (action != null) {
          menu.push('<li>');
          menu.push(
            '<a class="phantasus-menu-item" data-action="' + action.name +
            '" href="#">');
          menu.push(action.name);
          if (action.ellipsis) {
            menu.push('...');
          }
          if (action.icon) {
            menu.push('<span class="' + action.icon +
              ' phantasus-menu-item-icon"></span> ');
          }
          if (action.which) {
            menu.push('<span class="pull-right">');
            if (action.commandKey) {
              menu.push(phantasus.Util.COMMAND_KEY);
            }
            if (action.shiftKey) {
              menu.push('Shift+');
            }
            menu.push(phantasus.KeyboardCharMap[action.which[0]]);
            menu.push('</span>');
          }

          menu.push('</a>');
          menu.push('</li>');
        }
      }
    });

    menu.push('</ul>');
    menu.push('</div>');
    $(menu.join('')).appendTo($menus);
  }

  //// console.log("HeatMapToolbar ::", "heatMap:", heatMap, "heatMap.options:", heatMap.options);
  if (heatMap.options.menu) {
    if (heatMap.options.menu.File) {
      createMenu('File', heatMap.options.menu.File, '240px');
    }
    if (heatMap.options.menu.View) {
      createMenu('Edit', heatMap.options.menu.Edit);
    }
    if (heatMap.options.menu.View) {
      createMenu('View', heatMap.options.menu.View, '170px');
    }
    if (heatMap.options.menu.Tools) {
      createMenu('Tools', heatMap.options.menu.Tools);
    }
    if (heatMap.options.menu.Help) {
      createMenu('Help', heatMap.options.menu.Help, '220px');
    }
  }

  $(searchHtml.join('')).appendTo($searchForm);
  var $lineOneColumn = $el.find('[data-name=toolbar]');

  $menus.appendTo($lineOneColumn);
  $searchForm.appendTo($lineOneColumn);
  var toolbarHtml = ['<div style="display: inline;">'];
  toolbarHtml.push('<div class="phantasus-button-divider"></div>');
  // zoom
  if (heatMap.options.toolbar.zoom) {

    var dropdownId = _.uniqueId('phantasus');
    toolbarHtml.push('<div style="display:inline-block;" class="dropdown">');
    toolbarHtml.push(
      '<a class="dropdown-toggle phantasus-black-link" type="button" id="' +
      dropdownId +
      '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">');
    // toolbarHtml.push('<input style="width:2em;height:21px;" id="' + dropdownId + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">');
    toolbarHtml.push('<button type="button"' +
      ' class="btn btn-default btn-xxs"><span class="fa' +
      ' fa-search-plus"></span>');
    toolbarHtml.push(
      ' <span style="font-size: .8em;" class="fa fa-caret-down"></span>');
    toolbarHtml.push('</button>');
    toolbarHtml.push(
      '<ul style="width:200px;" class="dropdown-menu" aria-labelledby="' + dropdownId + '">');
    toolbarHtml.push(
      '<li><a class="phantasus-menu-item" href="#" data-action="Zoom In">Zoom In<span class="pull-right">+</span></a></li>');
    toolbarHtml.push(
      '<li><a class="phantasus-menu-item" href="#" data-action="Zoom Out">Zoom' +
      ' Out<span class="pull-right">-</span></a></li>');
    toolbarHtml.push('<li role="separator" class="divider"></li>');
    toolbarHtml.push(
      '<li><a class="phantasus-menu-item" href="#" data-action="Fit To Window">Fit To Window<span' +
      ' class="fa' +
      ' fa-compress phantasus-menu-item-icon"></span><span class="pull-right">' +
      phantasus.Util.COMMAND_KEY +
      phantasus.KeyboardCharMap[heatMap.getActionManager().getAction('Fit To Window').which[0]] + '</span> </a></li>');
    toolbarHtml.push(
      '<li><a class="phantasus-menu-item" href="#" data-action="Fit Rows To Window">Fit Rows To Window</a></li>');
    toolbarHtml.push(
      '<li><a class="phantasus-menu-item" href="#" data-action="Fit Columns To Window">Fit Columns To Window</a></li>');
    toolbarHtml.push('<li role="separator" class="divider"></li>');
    toolbarHtml.push(
      '<li><a class="phantasus-menu-item" href="#" data-action="100%">100%</a></li>');
    toolbarHtml.push('</ul>');
    toolbarHtml.push('</div>');
  }
  toolbarHtml.push('<div class="phantasus-button-divider"></div>');
  if (heatMap.options.toolbar.sort) {
    toolbarHtml.push(
      '<button data-toggle="tooltip" title="Sort" name="Sort" type="button" class="btn' +
      ' btn-default btn-xxs"><span class="fa fa-sort-alpha-asc"></span></button>');
  }
  if (heatMap.options.toolbar.options) {
    toolbarHtml.push(
      '<button data-action="Options" data-toggle="tooltip" title="Options" type="button"' +
      ' class="btn btn-default btn-xxs"><span class="fa fa-cog"></span></button>');

  }

  toolbarHtml.push('<div class="phantasus-button-divider"></div>');
  if (heatMap.options.toolbar.openFile) {
    toolbarHtml.push(
      '<button data-action="Open File" data-toggle="tooltip" title="Open File ('
      + phantasus.Util.COMMAND_KEY
      +
      'O)" type="button" class="btn btn-default btn-xxs"><span class="fa fa-folder-open-o"></span></button>');
  }
  if (heatMap.options.toolbar.saveImage) {
    toolbarHtml.push(
      '<button data-action="Save Image" data-toggle="tooltip" title="Save Image ('
      + phantasus.Util.COMMAND_KEY
      +
      'S)" type="button" class="btn btn-default btn-xxs"><span class="fa fa-file-image-o"></span></button>');
  }
  if (heatMap.options.toolbar.saveDataset) {
    toolbarHtml.push(
      '<button data-action="Save Dataset" data-toggle="tooltip" title="Save Dataset ('
      + phantasus.Util.COMMAND_KEY
      +
      'Shift+S)" type="button" class="btn btn-default btn-xxs"><span class="fa fa-floppy-o"></span></button>');
  }
  if (heatMap.options.toolbar.saveSession) {
    toolbarHtml.push(
      '<button data-action="Save Session" data-toggle="tooltip" title="Save Session" type="button"' +
      ' class="btn btn-default btn-xxs"><span class="fa fa-anchor"></span></button>');
  }

  toolbarHtml.push('<div class="phantasus-button-divider"></div>');
  if (heatMap.options.toolbar.filter) {
    toolbarHtml.push(
      '<button data-action="Filter" data-toggle="tooltip" title="Filter" type="button"' +
      ' class="btn btn-default btn-xxs"><span class="fa fa-filter"></span></button>');
  }
  if (heatMap.options.toolbar.chart && typeof echarts !== 'undefined') {
    toolbarHtml.push(
      '<button data-action="Chart" data-toggle="tooltip" title="Chart" type="button" class="btn' +
      ' btn-default btn-xxs"><span class="fa fa-line-chart"></span></button>');

  }
  // legend
  if (heatMap.options.toolbar.colorKey) {
    toolbarHtml.push('<div class="phantasus-button-divider"></div>');
    toolbarHtml.push('<div class="btn-group">');
    toolbarHtml.push(
      '<button type="button" class="btn btn-default btn-xxs" data-toggle="dropdown"><span title="Color Key" data-toggle="tooltip" class="fa fa-key"></span></button>');
    toolbarHtml.push('<ul data-name="key" class="dropdown-menu" role="menu">');
    toolbarHtml.push('<li data-name="keyContent"></li>');
    toolbarHtml.push('</ul>');
    toolbarHtml.push('</div>');
    toolbarHtml.push('<div class="phantasus-button-divider"></div>');
  }
  toolbarHtml.push('</div>');
  var $toolbar = $(toolbarHtml.join(''));

  $toolbar.find('[data-action]').on('click', function (e) {
    e.preventDefault();
    heatMap.getActionManager().execute($(this).data('action'));
  }).on('blur', function (e) {
    if (document.activeElement === document.body) {
      heatMap.focus();
    }
  });
  $menus.on('click', 'li > a', function (e) {
    e.preventDefault();
    heatMap.getActionManager().execute($(this).data('action'));
  }).on('blur', function (e) {
    if (document.activeElement === document.body) {
      heatMap.focus();
    }
  });
  if (heatMap.options.toolbar.$customButtons) {
    heatMap.options.toolbar.$customButtons.appendTo($toolbar);
  }
  $toolbar.appendTo($lineOneColumn);
  // $hide.appendTo($el.find('[data-name=toggleEl]'));
  $el.prependTo(heatMap.$content);
  this.$tip = $el.find('[data-name=tip]');

  $el.find('[data-toggle="tooltip"]').tooltip({
    placement: 'bottom',
    container: 'body',
    trigger: 'hover'
  }).on('click', function () {
    $(this).tooltip('hide');
  });
  var $key = $el.find('[data-name=key]');
  var $keyContent = $el.find('[data-name=keyContent]');
  $key.dropdown().parent().on('show.bs.dropdown', function () {
    new phantasus.HeatMapColorSchemeLegend(heatMap, $keyContent);
    phantasus.Util.trackEvent({
      eventCategory: 'ToolBar',
      eventAction: 'colorKey'
    });
  });

  var searchHelpHtml = [];
  searchHelpHtml.push('<h4>Symbols</h4>');
  searchHelpHtml.push('<table class="table table-bordered">');
  searchHelpHtml.push('<tr><th>Term</th><th>Description</th></tr>');
  searchHelpHtml.push(
    '<tr><td><code><strong>*</strong></code></td><td>Quote a search term for an' +
    ' exact' +
    ' match. <br' +
    ' />Example: <code><strong>"root beer"</strong></code></td></tr>');

  searchHelpHtml.push(
    '<tr><td><code><strong>-</strong></code></td><td>Exclude matches using -' +
    ' modifier.</td></tr>');
  searchHelpHtml.push(
    '<tr><td><code><strong>..</strong></code></td><td>Separate numbers by two' +
    ' periods' +
    ' without spaces to' +
    ' see numbers that fall within a range.. <br' +
    ' />Example: <code><strong>1..10</strong></code></td></tr>');
  searchHelpHtml.push(
    '<tr><td><code><strong><= < > >= =</strong></code></td><td>Perform a' +
    ' numeric' +
    ' search.' +
    ' <br' +
    ' />Example: <code><strong>>4</strong></code></td></tr>');
  searchHelpHtml.push('</table>');
  searchHelpHtml.push('<h4>Search fields</h4>');
  searchHelpHtml.push(
    '<p>You can restrict your search to any field by typing the field name followed by a colon ":" and then the term you are looking for. For example, to search for matches containing "beer" in the beverage field, you can enter:' +
    ' <code><strong>beverage:beer</strong></code>');
  searchHelpHtml.push(
    'Note that searches only include metadata fields that are displayed. You' +
    ' can search a hidden field by performing a field search.');

  // searchHelpHtml.push('<br />Note: The field is only valid for the term that it directly' +
  // 	' precedes.');
  searchHelpHtml.push(
    '<p>You can search for an exact list of values by enclosing the list of' +
    ' values in parentheses. For example: <code><strong>pet:(cat dog)</strong></code>' +
    ' searches all pets that are either cats or dogs.</p>');
  var $searchHelp = $(searchHelpHtml.join(''));
  $el.find('[data-name=searchHelp]').on('click', function (e) {
    e.preventDefault();
    phantasus.FormBuilder.showInModal({
      title: 'Search Help',
      html: $searchHelp,
      appendTo: heatMap.getContentEl(),
      focus: heatMap.getFocusEl()
    });
  });
  var $searchRowsGroup = $searchForm.find('[data-name=searchRowsGroup]');
  var $searchColumnsGroup = $searchForm.find('[data-name=searchColumnsGroup]');
  var $searchValuesGroup = $searchForm.find('[data-name=searchValuesGroup]');
  var $searchRowDendrogramGroup = $searchForm.find(
    '[data-name=searchRowDendrogramGroup]');
  var $searchColumnDendrogramGroup = $searchForm.find(
    '[data-name=searchColumnDendrogramGroup]');

  this.$searchRowDendrogramGroup = $searchRowDendrogramGroup;
  this.$searchColumnDendrogramGroup = $searchColumnDendrogramGroup;
  this.matchMode = 'contains';
  this.matchAllPredicates = false;
  var $searchToggle = $searchForm.find('[name=searchToggle]'); // buttons
  var nameToSearchObject = {};

  function getSearchElements($group, searchName, cb) {
    var obj = {
      $group: $group,
      $search: $group.find('[name=search]'),
      $searchResultsWrapper: $group.find('[data-name=searchResultsWrapper]'),
      $searchResults: $group.find('[data-name=searchResults]'),
      $previousMatch: $group.find('[name=previousMatch]'),
      $nextMatch: $group.find('[name=nextMatch]'),
      $matchesToTop: $group.find('[name=matchesToTop]'),
      $toggleButton: $searchToggle.filter('[data-search=' + searchName + ']').parent()
    };
  nameToSearchObject[searchName] = obj;
    return obj;
  }  var $searchOptions = $el.find('[data-name=searchOptions]');
    $searchOptions.on('click', 'li > a', function (e) {
      e.preventDefault();
      var $this = $(this);
      var group = $this.data('group');
      if (group === 'matchMode') {
        _this.matchMode = $this.data('name');
      } else {
        _this.matchAllPredicates = $this.data('name') === 'matchAll';
      }
      var $searchField;
    if (_this.rowSearchObject.$search.is(':visible')) {
      $searchField = _this.rowSearchObject.$search;
    } else if (_this.columnSearchObject.$search.is(':visible')) {
      $searchField = _this.rowSearchObject.$search;
    } else if (_this.rowDendrogramSearchObject.$search.is(':visible')) {
      $searchField = _this.rowSearchObject.$search;
    } else if (_this.columnDendrogramSearchObject.$search.is(':visible')) {
      $searchField = _this.rowSearchObject.$search;
    } else if (_this.valueSearchObject.$search.is(':visible')) {
      $searchField = _this.rowSearchObject.$search;
    }
    if ($searchField) {
      $searchField.trigger($.Event('keyup', {
        keyCode: 13,
        which: 13
      }));
      // trigger search again
    }

    var $span = $(this).find('span');
    if ($span.data('type') === 'toggle') {
      $searchOptions.find('[data-group=' + group + '] > [data-type=toggle]').removeClass('dropdown-checkbox' +
        ' fa' +
        ' fa-check');
      $span.addClass('dropdown-checkbox fa fa-check');
    }
    phantasus.Util.trackEvent({
      eventCategory: 'ToolBar',
      eventAction: 'searchMatchMode'
    });
  });
  this.rowSearchObject = getSearchElements($searchRowsGroup, 'rows',
    function () {
      _this.search(true);
    });
  this.columnSearchObject = getSearchElements($searchColumnsGroup, 'columns',
    function () {
      _this.search(false);
    });
  this.rowDendrogramSearchObject = getSearchElements($searchRowDendrogramGroup,
    'rowDendrogram', function () {
      _this.searchDendrogram(false);
    });
  this.columnDendrogramSearchObject = getSearchElements(
    $searchColumnDendrogramGroup, 'columnDendrogram', function () {
      _this.searchDendrogram(false);
    });
  this.valueSearchObject = getSearchElements($searchValuesGroup, 'values',
    function () {
      searchValues();
    });

  // set button and search controls visibility
  if (!heatMap.options.toolbar.searchRows) {
    this.rowSearchObject.$toggleButton.hide();
    this.rowSearchObject.$group.css('display', 'none');
  }

  if (!heatMap.options.toolbar.searchColumns) {
    this.columnSearchObject.$toggleButton.hide();
    this.columnSearchObject.$group.css('display', 'none');
  }
  if (!heatMap.options.toolbar.searchValues) {
    this.valueSearchObject.$toggleButton.hide();
    this.valueSearchObject.$group.css('display', 'none');
  }
  this.rowDendrogramSearchObject.$toggleButton.hide();
  this.rowDendrogramSearchObject.$group.hide();

  this.columnDendrogramSearchObject.$toggleButton.hide();
  this.columnDendrogramSearchObject.$group.hide();

  this.rowDendrogramSearchObject.$searchResultsWrapper.show();
  this.columnDendrogramSearchObject.$searchResultsWrapper.show();
  this.valueSearchObject.$searchResultsWrapper.show();

  this.rowSearchObject.$search.css({
    'border-top': '3.8px solid #e6e6e6',
    'border-bottom': '3.8px solid #e6e6e6',
    width: '240px'
  });

  this.columnSearchObject.$search.css({
    'border-right': '3.8px solid #e6e6e6',
    'border-left': '3.8px solid #e6e6e6',
    width: '240px'
  });

  this.$valueSearchResults = $searchValuesGroup.find('[name=searchResults]');
  this.$valueTextField = $searchValuesGroup.find('[name=search]');
  this.$dimensionsLabel = $el.find('[data-name=dim]');
  this.$selectionLabel = $el.find('[data-name=selection]');

  $searchToggle.on('change', function (e) {
    var search = $(this).data('search');
    for (var name in nameToSearchObject) {
      var searchObject = nameToSearchObject[name];
      if (name === search) {
        searchObject.$group.css('display', 'inline-block');
        searchObject.$search.focus();
      } else {
        searchObject.$group.css('display', 'none');
      }
    }
  });

  this.toggleSearch = function () {
    var $visible = $searchToggle.filter(':visible');
    var $checked = $searchToggle.filter(':checked');
    var $next = $visible.eq($visible.index($checked) + 1);
    if (!$next.length) {
      $next = $visible.first();
    }
    $next.click();
  };

  for (var i = 0; i < $searchToggle.length; i++) {
    var $button = $($searchToggle[i]);
    if ($button.parent().css('display') === 'block') {
      $button.click();
      break;
    }
  }

  heatMap.on('dendrogramAnnotated', function (e) {
    if (e.isColumns) { // show buttons
      _this.rowDendrogramSearchObject.$toggleButton.show();
    } else {
      _this.columnDendrogramSearchObject.$toggleButton.show();
    }
  });
  heatMap.on('dendrogramChanged', function (e) {
    if (e.isColumns) {
      _this.rowDendrogramSearchObject.$group.hide();
      _this.rowDendrogramSearchObject.$toggleButton.hide();
    } else {
      _this.columnDendrogramSearchObject.$group.hide();
      _this.columnDendrogramSearchObject.$toggleButton.hide();
    }
  });
  var project = heatMap.getProject();

  phantasus.Util.autosuggest({
    $el: this.rowSearchObject.$search,
    filter: function (terms, cb) {
      var indices = [];
      var meta = project.getSortedFilteredDataset().getRowMetadata();
      heatMap.getVisibleTrackNames(false).forEach(function (name) {
        indices.push(phantasus.MetadataUtil.indexOf(meta, name));
      });
      meta = new phantasus.MetadataModelColumnView(meta, indices);
      phantasus.MetadataUtil.autocomplete(meta)(terms, cb);
    },
    select: function () {
      _this.search(true);
    }
  });

  this.rowSearchObject.$search.on('keyup', _.debounce(function (e) {
    if (e.which === 13) {
      e.preventDefault();
    }
    _this.search(true);
    phantasus.Util.trackEvent({
      eventCategory: 'ToolBar',
      eventAction: 'searchRows'
    });
  }, 500));
  phantasus.Util.autosuggest({
    $el: this.columnSearchObject.$search,
    filter: function (terms, cb) {
      var indices = [];
      var meta = project.getSortedFilteredDataset().getColumnMetadata();
      heatMap.getVisibleTrackNames(true).forEach(function (name) {
        indices.push(phantasus.MetadataUtil.indexOf(meta, name));
      });
      meta = new phantasus.MetadataModelColumnView(meta, indices);
      phantasus.MetadataUtil.autocomplete(meta)(terms, cb);
    },
    select: function () {
      _this.search(false);
    }
  });
  this.columnSearchObject.$search.on('keyup', _.debounce(function (e) {
    if (e.which === 13) {
      e.preventDefault();
    }
    _this.search(false);
    phantasus.Util.trackEvent({
      eventCategory: 'ToolBar',
      eventAction: 'searchColumns'
    });
  }, 500));

  // dendrogram search

  phantasus.Util.autosuggest({
    $el: this.rowDendrogramSearchObject.$search,
    filter: function (tokens, cb) {
      var d = heatMap.getDendrogram(false);
      if (!d.searchTerms) {
        cb([]);
      } else {
        var token = tokens != null && tokens.length > 0
          ? tokens[tokens.selectionStartIndex]
          : '';
        token = $.trim(token);
        if (token === '') {
          cb([]);
        } else {
          phantasus.Util.autocompleteArrayMatcher(token, cb, d.searchTerms, null,
            10);
        }
      }
    },
    select: function () {
      _this.searchDendrogram(false);
    }
  });

  this.rowDendrogramSearchObject.$search.on('keyup', _.debounce(function (e) {
    if (e.which === 13) {
      e.preventDefault();
    }
    _this.searchDendrogram(false);
    phantasus.Util.trackEvent({
      eventCategory: 'ToolBar',
      eventAction: 'searchRowDendrogram'
    });
  }, 500));

  phantasus.Util.autosuggest({
    $el: this.columnDendrogramSearchObject.$search,
    filter: function (tokens, cb) {
      var d = heatMap.getDendrogram(true);
      if (!d.searchTerms) {
        cb([]);
      } else {
        var token = tokens != null && tokens.length > 0
          ? tokens[tokens.selectionStartIndex]
          : '';
        token = $.trim(token);
        if (token === '') {
          cb([]);
        } else {
          phantasus.Util.autocompleteArrayMatcher(token, cb, d.searchTerms, null,
            10);
        }
      }
    },
    select: function () {
      _this.searchDendrogram(true);
    }
  });

  this.columnDendrogramSearchObject.$search.on('keyup',
    _.debounce(function (e) {
      if (e.which === 13) {
        e.preventDefault();
      }
      _this.searchDendrogram(true);
      phantasus.Util.trackEvent({
        eventCategory: 'ToolBar',
        eventAction: 'searchColumnDendrogram'
      });
    }, 500));

  function searchValues() {
    var $searchResultsLabel = _this.$valueSearchResults;
    var text = $.trim(_this.$valueTextField.val());
    if (text === '') {
      $searchResultsLabel.html('');
      project.getElementSelectionModel().setViewIndices(null);
    } else {
      var viewIndices = phantasus.DatasetUtil.searchValues({
        dataset: project.getSortedFilteredDataset(),
        text: text,
        matchAllPredicates: _this.matchAllPredicates,
        defaultMatchMode: _this.matchMode
      });

      project.getElementSelectionModel().setViewIndices(viewIndices);
      $searchResultsLabel.html(viewIndices.size() + ' match'
        + (viewIndices.size() === 1 ? '' : 'es'));
    }
  }

  phantasus.Util.autosuggest({
    $el: this.$valueTextField,
    filter: function (terms, cb) {
      phantasus.DatasetUtil.autocompleteValues(
        project.getSortedFilteredDataset())(terms, cb);
    },
    select: function () {
      searchValues();
    }
  });

  this.$valueTextField.on('keyup', _.debounce(function (e) {
    if (e.which === 13) {
      _this.$valueTextField.autocomplete('close');
      e.preventDefault();
    }
    searchValues();
  }, 500));

  this.toggleControls = function () {
    if ($lineOneColumn.css('display') === 'none') {
      $lineOneColumn.css('display', '');
      _this.rowSearchObject.$search.focus();
    } else {
      $lineOneColumn.css('display', 'none');
      $(_this.heatMap.heatmap.canvas).focus();
    }
  };
  this.$el = $el;
  var updateFilterStatus = function () {
    if (heatMap.getProject().getRowFilter().isEnabled()
      || heatMap.getProject().getColumnFilter().isEnabled()) {
      _this.$el.find('[name=filterButton]').addClass('btn-primary');
    } else {
      _this.$el.find('[name=filterButton]').removeClass('btn-primary');
    }

  };
  updateFilterStatus();

  this.columnSearchObject.$matchesToTop.on(
    'click',
    function (e) {
      e.preventDefault();
      var $this = $(this);
      $this.toggleClass('btn-primary');
      _this.setSelectionOnTop({
        isColumns: true,
        isOnTop: $this.hasClass('btn-primary'),
        updateButtonStatus: false
      });
      phantasus.Util.trackEvent({
        eventCategory: 'ToolBar',
        eventAction: 'columnMatchesToTop'
      });
    });
  this.rowSearchObject.$matchesToTop.on(
    'click',
    function (e) {
      e.preventDefault();
      var $this = $(this);
      $this.toggleClass('btn-primary');
      _this.setSelectionOnTop({
        isColumns: false,
        isOnTop: $this.hasClass('btn-primary'),
        updateButtonStatus: false
      });
      phantasus.Util.trackEvent({
        eventCategory: 'ToolBar',
        eventAction: 'rowMatchesToTop'
      });
    });
  project.on('rowSortOrderChanged.phantasus', function (e) {
    if (_this.searching) {
      return;
    }
    _this._updateSearchIndices(false);
    _this.rowSearchObject.$matchesToTop.removeClass('btn-primary');
  });

  project.on('columnSortOrderChanged.phantasus', function (e) {
    if (_this.searching) {
      return;
    }
    _this._updateSearchIndices(true);
    _this.columnSearchObject.$matchesToTop.removeClass('btn-primary');
  });

  heatMap.getProject().on('rowFilterChanged.phantasus', function (e) {
    _this.search(true);
    updateFilterStatus();
  });
  heatMap.getProject().on('columnFilterChanged.phantasus', function (e) {
    _this.search(false);
    updateFilterStatus();
  });
  heatMap.getProject().on('datasetChanged.phantasus', function () {
    _this.search(true);
    _this.search(false);
    updateFilterStatus();
  });
  heatMap.getProject().getRowSelectionModel().on(
    'selectionChanged.phantasus', function () {
      _this.updateSelectionLabel();
    });
  heatMap.getProject().getColumnSelectionModel().on(
    'selectionChanged.phantasus', function () {
      _this.updateSelectionLabel();
    });
  this.rowSearchResultViewIndicesSorted = null;
  this.currentRowSearchIndex = 0;
  this.columnSearchResultViewIndicesSorted = null;
  this.currentColumnSearchIndex = -1;
  this.columnSearchObject.$previousMatch.on(
    'click',
    function () {
      _this.currentColumnSearchIndex--;
      if (_this.currentColumnSearchIndex < 0) {
        _this.currentColumnSearchIndex = _this.columnSearchResultViewIndicesSorted.length -
          1;
      }
      heatMap.scrollLeft(
        heatMap.getHeatMapElementComponent().getColumnPositions().getPosition(
          _this.columnSearchResultViewIndicesSorted[_this.currentColumnSearchIndex]));
      phantasus.Util.trackEvent({
        eventCategory: 'ToolBar',
        eventAction: 'previousColumnMatch'
      });
    });
  this.rowSearchObject.$previousMatch.on(
    'click',
    function () {
      _this.currentRowSearchIndex--;
      if (_this.currentRowSearchIndex < 0) {
        _this.currentRowSearchIndex = _this.rowSearchResultViewIndicesSorted.length -
          1;
      }
      heatMap.scrollTop(
        heatMap.getHeatMapElementComponent().getRowPositions().getPosition(
          _this.rowSearchResultViewIndicesSorted[_this.currentRowSearchIndex]));
      phantasus.Util.trackEvent({
        eventCategory: 'ToolBar',
        eventAction: 'previousRowMatch'
      });
    });
  this.columnSearchObject.$nextMatch.on('click', function () {
    _this.next(true);
    phantasus.Util.trackEvent({
      eventCategory: 'ToolBar',
      eventAction: 'nextColumnMatch'
    });

  });
  this.rowSearchObject.$nextMatch.on('click', function () {
    _this.next(false);
    phantasus.Util.trackEvent({
      eventCategory: 'ToolBar',
      eventAction: 'nextRowMatch'
    });
  });
  this.updateDimensionsLabel();
  this.updateSelectionLabel();
}
;
phantasus.HeatMapToolBar.HIGHLIGHT_SEARCH_MODE = 0;
phantasus.HeatMapToolBar.FILTER_SEARCH_MODE = 1;
phantasus.HeatMapToolBar.MATCHES_TO_TOP_SEARCH_MODE = 2;
phantasus.HeatMapToolBar.SELECT_MATCHES_SEARCH_MODE = 3;
phantasus.HeatMapToolBar.prototype = {
  quickColumnFilter: false,
  searching: false,
  rowSearchMode: phantasus.HeatMapToolBar.SELECT_MATCHES_SEARCH_MODE,
  columnSearchMode: phantasus.HeatMapToolBar.SELECT_MATCHES_SEARCH_MODE,
  _updateSearchIndices: function (isColumns) {
    var project = this.heatMap.getProject();
    if (isColumns) {
      var viewIndices = [];
      var modelIndices = this.columnSearchResultModelIndices;
      for (var i = 0, length = modelIndices.length; i < length; i++) {
        var index = project.convertModelColumnIndexToView(modelIndices[i]);
        if (index !== -1) {
          viewIndices.push(index);
        }
      }
      viewIndices.sort(function (a, b) {
        return a < b ? -1 : 1;
      });
      this.columnSearchResultViewIndicesSorted = viewIndices;
      this.currentColumnSearchIndex = -1;
    } else {
      var viewIndices = [];
      var modelIndices = this.rowSearchResultModelIndices;
      for (var i = 0, length = modelIndices.length; i < length; i++) {
        var index = project.convertModelRowIndexToView(modelIndices[i]);
        if (index !== -1) {
          viewIndices.push(index);
        }
      }
      viewIndices.sort(function (a, b) {
        return a < b ? -1 : 1;
      });
      this.rowSearchResultViewIndicesSorted = viewIndices;
      this.currentRowSearchIndex = -1;
    }
  },
  next: function (isColumns) {
    var heatMap = this.heatMap;
    if (isColumns) {
      this.currentColumnSearchIndex++;
      if (this.currentColumnSearchIndex >=
        this.columnSearchResultViewIndicesSorted.length) {
        this.currentColumnSearchIndex = 0;
      }
      heatMap.scrollLeft(
        heatMap.getHeatMapElementComponent().getColumnPositions().getPosition(
          this.columnSearchResultViewIndicesSorted[this.currentColumnSearchIndex]));
    } else {
      this.currentRowSearchIndex++;
      if (this.currentRowSearchIndex >=
        this.rowSearchResultViewIndicesSorted.length) {
        this.currentRowSearchIndex = 0;
      }
      heatMap.scrollTop(
        heatMap.getHeatMapElementComponent().getRowPositions().getPosition(
          this.rowSearchResultViewIndicesSorted[this.currentRowSearchIndex]));
    }
  },
  getSearchField: function (type) {
    if (type === phantasus.HeatMapToolBar.COLUMN_SEARCH_FIELD) {
      return this.columnSearchObject.$search;
    } else if (type === phantasus.HeatMapToolBar.ROW_SEARCH_FIELD) {
      return this.rowSearchObject.$search;
    } else if (type ===
      phantasus.HeatMapToolBar.COLUMN_DENDROGRAM_SEARCH_FIELD) {
      return this.columnDendrogramSearchObject.$search;
    } else if (type === phantasus.HeatMapToolBar.ROW_DENDROGRAM_SEARCH_FIELD) {
      return this.rowDendrogramSearchObject.$search;
    }
  },
  setSearchText: function (options) {
    var $tf = options.isColumns ? this.columnSearchObject.$search
      : this.rowSearchObject.$search;
    var existing = options.append ? $.trim($tf.val()) : '';
    if (existing !== '') {
      existing += ' ';
    }
    if (options.onTop) {
      options.isColumns ? this.columnSearchObject.$matchesToTop.addClass(
        'btn-primary') : this.rowSearchObject.$matchesToTop.addClass(
        'btn-primary');

    }
    $tf.val(existing + options.text);
    this.search(!options.isColumns);
    if (options.scrollTo) {
      this.next(options.isColumns);
      // click next
    }
  },
  updateDimensionsLabel: function () {
    var p = this.heatMap.getProject();
    var d = p.getFullDataset();
    var f = p.getSortedFilteredDataset();
    var text = [];

    if (f.getRowCount() !== d.getRowCount()) {
      text.push('<b>');
      text.push(phantasus.Util.intFormat(f.getRowCount()));
      text.push('/');
      text.push(phantasus.Util.intFormat(d.getRowCount()));
      text.push('</b>');
    } else {
      text.push(phantasus.Util.intFormat(f.getRowCount()));
    }

    text.push(' rows by ');
    if (f.getColumnCount() !== d.getColumnCount()) {
      text.push('<b>');
      text.push(phantasus.Util.intFormat(f.getColumnCount()));
      text.push('/');
      text.push(phantasus.Util.intFormat(d.getColumnCount()));
      text.push('</b>');
    } else {
      text.push(phantasus.Util.intFormat(f.getColumnCount()));
    }

    text.push(' columns');
    this.$dimensionsLabel.html(text.join(''));
  },
  updateSelectionLabel: function () {
    var nc = this.heatMap.getProject().getColumnSelectionModel().count();
    var nr = this.heatMap.getProject().getRowSelectionModel().count();
    var text = [];
    text.push(phantasus.Util.intFormat(nr) + ' row');
    if (nr !== 1) {
      text.push('s');
    }
    text.push(', ');
    text.push(phantasus.Util.intFormat(nc) + ' column');
    if (nc !== 1) {
      text.push('s');
    }
    text.push(' selected');
    this.$selectionLabel.html(text.join(''));
  },
  searchDendrogram: function (isColumns) {
    var searchObject = isColumns
      ? this.columnDendrogramSearchObject
      : this.rowDendrogramSearchObject;
    var text = $.trim(searchObject.$search.val());
    var dendrogram = isColumns ? this.heatMap.columnDendrogram
      : this.heatMap.rowDendrogram;
    var $searchResults = searchObject.$searchResults;
    var matches = phantasus.DendrogramUtil.search({
      rootNode: dendrogram.tree.rootNode,
      text: text,
      matchAllPredicates: this.matchAllPredicates,
      defaultMatchMode: this.matchMode
    });
    if (matches === -1) {
      $searchResults.html('');
    } else {
      $searchResults.html(matches + ' match'
        + (matches === 1 ? '' : 'es'));
    }
    if (matches <= 0) {
      var positions = isColumns ? this.heatMap.getHeatMapElementComponent().getColumnPositions()
        : this.heatMap.getHeatMapElementComponent().getRowPositions();
      positions.setSquishedIndices(null);
      if (isColumns) {
        this.heatMap.getProject().setGroupColumns([], true);
      } else {
        this.heatMap.getProject().setGroupRows([], true);
      }
      positions.setSize(isColumns ? this.heatMap.getFitColumnSize()
        : this.heatMap.getFitRowSize());
    } else {
      phantasus.DendrogramUtil.squishNonSearchedNodes(this.heatMap,
        isColumns);
    }
    this.heatMap.updateDataset(); // need to update spaces for group
    // by
    this.heatMap.revalidate();
  },
  search: function (isRows) {
    this.searching = true;
    var isMatchesOnTop = isRows ? this.rowSearchObject.$matchesToTop.hasClass(
      'btn-primary') : this.columnSearchObject.$matchesToTop.hasClass(
      'btn-primary');
    var heatMap = this.heatMap;
    var project = heatMap.getProject();

    var sortKeys = isRows
      ? project.getRowSortKeys()
      : project.getColumnSortKeys();
    sortKeys = sortKeys.filter(function (key) {
      return !(key instanceof phantasus.MatchesOnTopSortKey &&
      key.toString() === 'matches on top');
    });

    var dataset = project.getSortedFilteredDataset();
    var $searchResultsLabel = isRows
      ? this.rowSearchObject.$searchResults
      : this.columnSearchObject.$searchResults;
    var searchText = !isRows
      ? $.trim(this.columnSearchObject.$search.val())
      : $.trim(this.rowSearchObject.$search.val());

    var metadata = isRows
      ? dataset.getRowMetadata()
      : dataset.getColumnMetadata();
    var visibleIndices = [];
    heatMap.getVisibleTrackNames(!isRows).forEach(function (name) {
      visibleIndices.push(phantasus.MetadataUtil.indexOf(metadata, name));
    });
    var fullModel = metadata;
    metadata = new phantasus.MetadataModelColumnView(metadata,
      visibleIndices);

    var searchResultViewIndices = phantasus.MetadataUtil.search({
      model: metadata,
      fullModel: fullModel,
      text: searchText,
      isColumns: !isRows,
      matchAllPredicates: this.matchAllPredicates,
      defaultMatchMode: this.matchMode
    });
    if (searchText === '') {
      $searchResultsLabel.html('');
      if (isRows) {
        this.rowSearchObject.$searchResultsWrapper.hide();
      } else {
        this.columnSearchObject.$searchResultsWrapper.hide();
      }

    } else {
      $searchResultsLabel.html(searchResultViewIndices.length + ' match'
        + (searchResultViewIndices.length === 1 ? '' : 'es'));
      if (isRows) {
        this.rowSearchObject.$searchResultsWrapper.show();
      } else {
        this.columnSearchObject.$searchResultsWrapper.show();
      }

    }

    var searchResultsModelIndices = [];
    if (searchResultViewIndices != null) {
      for (var i = 0, length = searchResultViewIndices.length; i <
      length; i++) {
        var viewIndex = searchResultViewIndices[i];
        searchResultsModelIndices.push(isRows
          ? project.convertViewRowIndexToModel(viewIndex)
          : project.convertViewColumnIndexToModel(viewIndex));
      }
    }

    if (searchResultViewIndices !== null && isMatchesOnTop) {
      var key = new phantasus.MatchesOnTopSortKey(project,
        searchResultsModelIndices, 'matches on top', !isRows);
      // keep other sort keys
      searchResultViewIndices = key.indices; // matching indices
      // are now on top
      // add to beginning of sort keys
      sortKeys.splice(0, 0, key);
      if (isRows) {
        project.setRowSortKeys(sortKeys, false);
      } else {
        project.setColumnSortKeys(sortKeys, false);
      }
    }
    var searchResultsViewIndicesSet = new phantasus.Set();
    if (searchResultViewIndices != null) {
      for (var i = 0, length = searchResultViewIndices.length; i <
      length; i++) {
        var viewIndex = searchResultViewIndices[i];
        searchResultsViewIndicesSet.add(viewIndex);
      }
    }
    if (searchResultViewIndices == null) {
      searchResultViewIndices = [];
    }

    if (isRows) {
      this.rowSearchResultModelIndices = searchResultsModelIndices;
      this.rowSearchResultViewIndicesSorted = searchResultViewIndices.sort(
        function (a, b) {
          return a < b ? -1 : 1;
        });
      this.currentRowSearchIndex = -1;

    } else {
      this.columnSearchResultModelIndices = searchResultsModelIndices;
      this.columnSearchResultViewIndicesSorted = searchResultViewIndices.sort(
        function (a, b) {
          return a < b ? -1 : 1;
        });
      this.currentColumnSearchIndex = -1;
    }
    // update selection
    (!isRows
      ? project.getColumnSelectionModel()
      : project.getRowSelectionModel()).setViewIndices(
      searchResultsViewIndicesSet, true);

    if (isMatchesOnTop) { // resort
      if (isRows) {
        project.setRowSortKeys(phantasus.SortKey.keepExistingSortKeys(
          sortKeys, project.getRowSortKeys()), true);
      } else {
        project.setColumnSortKeys(
          phantasus.SortKey.keepExistingSortKeys(sortKeys,
            project.getColumnSortKeys()), true);
      }
    }
    this.updateDimensionsLabel();
    this.updateSelectionLabel();
    this.searching = false;

  },
  isSelectionOnTop: function (isColumns) {
    var $btn = isColumns
      ? this.columnSearchObject.$matchesToTop
      : this.rowSearchObject.$matchesToTop;
    return $btn.hasClass('btn-primary');
  },
  setSelectionOnTop: function (options) {
    if (options.updateButtonStatus) {
      var $btn = options.isColumns
        ? this.columnSearchObject.$matchesToTop
        : this.rowSearchObject.$matchesToTop;
      if (options.isOnTop) {
        $btn.addClass('btn-primary');
      } else {
        $btn.removeClass('btn-primary');
      }
    }
    var project = this.heatMap.getProject();
    var sortKeys = options.isColumns
      ? project.getColumnSortKeys()
      : project.getRowSortKeys();
    // remove existing matches on top key
    sortKeys = sortKeys.filter(function (key) {
      return !(key instanceof phantasus.MatchesOnTopSortKey &&
      key.name === 'matches on top');
    });
    if (options.isOnTop) { // bring to top
      var key = new phantasus.MatchesOnTopSortKey(project,
        options.isColumns
          ? this.columnSearchResultModelIndices
          : this.rowSearchResultModelIndices,
        'matches on top');
      sortKeys.splice(0, 0, key);
      if (options.isColumns) {
        this.heatMap.scrollLeft(0);
      } else {
        this.heatMap.scrollTop(0);
      }
    }
    this.searching = true;
    if (options.isColumns) {
      project.setColumnSortKeys(sortKeys, true);
    } else {
      project.setRowSortKeys(sortKeys, true);
    }
    this._updateSearchIndices(options.isColumns);
    this.searching = false;

  }
};
phantasus.HeatMapToolBar.COLUMN_SEARCH_FIELD = 'column';
phantasus.HeatMapToolBar.ROW_SEARCH_FIELD = 'column';
phantasus.HeatMapToolBar.COLUMN_DENDROGRAM_SEARCH_FIELD = 'column_dendrogram';
phantasus.HeatMapToolBar.ROW_DENDROGRAM_SEARCH_FIELD = 'row_dendrogram';

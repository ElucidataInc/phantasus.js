phantasus.FilterUI = function (project, isColumns) {
  var _this = this;
  this.project = project;
  this.isColumns = isColumns;
  var $div = $('<div style="min-width:180px;"></div>');
  this.$div = $div;
  $div.append(this.addBase());
  var $filterMode = $div.find('[name=filterMode]');
  $filterMode.on('change', function (e) {
    var isAndFilter = $filterMode.prop('checked');
    (isColumns ? project.getColumnFilter() : project.getRowFilter())
      .setAnd(isAndFilter);
    isColumns ? _this.project.setColumnFilter(_this.project
      .getColumnFilter(), true) : _this.project.setRowFilter(
      _this.project.getRowFilter(), true);
    e.preventDefault();
  });

  $div.on('click', '[data-name=add]', function (e) {
    var $this = $(this);
    var $row = $this.closest('.phantasus-entry');
    // add after
    var index = $row.index();
    var newFilter = new phantasus.AlwaysTrueFilter();
    (isColumns ? project.getColumnFilter() : project.getRowFilter())
      .insert(index, newFilter);
    $row.after(_this.add(newFilter));
    e.preventDefault();
  });
  $div.on('click', '[data-name=delete]', function (e) {
    var $this = $(this);
    var $row = $this.closest('.phantasus-entry');
    var index = $row.index() - 1;
    (isColumns ? project.getColumnFilter() : project.getRowFilter())
      .remove(index);
    $row.remove();
    isColumns ? _this.project.setColumnFilter(_this.project
    .getColumnFilter(), true) : _this.project.setRowFilter(
      _this.project.getRowFilter(), true);
    e.preventDefault();
  });
  $div.on('submit', 'form', function (e) {
    var $this = $(this);
    e.preventDefault();
  });
  $div.on('change', '[name=by]', function (e) {
    var $this = $(this);
    var fieldName = $this.val();
    var $row = $this.closest('.phantasus-entry');
    var index = $row.index() - 1;
    if (fieldName == '') {
      $row.find('[data-name=ui]').empty();
    } else {
      _this.createFilter({
        fieldName: fieldName,
        $div: $this
      });
    }

    isColumns ? _this.project.setColumnFilter(_this.project
      .getColumnFilter(), true) : _this.project.setRowFilter(
      _this.project.getRowFilter(), true);
  });
  // show initial filters
  var combinedFilter = (isColumns ? project.getColumnFilter() : project
  .getRowFilter());
  var filters = combinedFilter.getFilters ? combinedFilter.getFilters() : [];
  for (var i = 0; i < filters.length; i++) {
    this.createFilter({
      filter: filters[i]
    });
  }
  if (combinedFilter.on) {
    combinedFilter.on('add', function (e) {
      _this.createFilter({
        filter: e.filter
      });
    });
    combinedFilter.on('remove', function (e) {
      // offset of 1 for header
      var $row = $div.find('.phantasus-entry')[1 + e.index].remove();
    });
    combinedFilter.on('and', function (e) {
      $filterMode.prop('checked', e.source.isAnd());
    });

  }
};

phantasus.FilterUI.rangeFilter = function (project, name, isColumns, $ui, filter) {
  $ui.empty();
  var html = [];
  html.push('<label>Range of values</label><br />');
  html
    .push('<div style="display:inline-block"><label>>= </label> <input style="max-width:100px;" class="form-control input-sm" name="min" type="text" /></div>');
  html
    .push('<div style="display:inline-block; margin-left: 5px;"><label> and <= </label> <input style="max-width:100px;" class="form-control input-sm" name="max" type="text" /></div>');
  html.push('<br /><a data-name="switch" href="#">Switch to top filter</a>');
  var $form = $(html.join(''));
  $form.appendTo($ui);
  $ui.find('[data-name=switch]')
    .on(
      'click',
      function (e) {
        e.preventDefault();
        var newFilter = phantasus.FilterUI.topFilter(project,
          name, isColumns, $ui);
        var index = -1;
        var filters = isColumns ? project.getColumnFilter()
          .getFilters() : project.getRowFilter()
          .getFilters();
        for (var i = 0; i < filters.length; i++) {
          if (filters[i] === filter) {
            index = i;
            break;
          }
        }
        if (index === -1) {
          throw new Error('Filter not found.');
        }
        (isColumns ? project.getColumnFilter() : project
          .getRowFilter()).set(index, newFilter);
        isColumns ? project.setColumnFilter(project
          .getColumnFilter(), true) : project
          .setRowFilter(project.getRowFilter(), true);
      });
  var $min = $ui.find('[name=min]');
  var $max = $ui.find('[name=max]');
  if (!filter) {
    filter = new phantasus.RangeFilter(-Number.MAX_VALUE, Number.MAX_VALUE,
      name, isColumns);
  } else {
    $min.val(filter.min);
    $max.val(filter.max);
  }

  $min.on('keyup', _.debounce(function (e) {
    filter.setMin(parseFloat($.trim($(this).val())));
    isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
      : project.setRowFilter(project.getRowFilter(), true);

  }, 500));
  $max.on('keyup', _.debounce(function (e) {
    filter.setMax(parseFloat($.trim($(this).val())));
    isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
      : project.setRowFilter(project.getRowFilter(), true);

  }, 500));

  return filter;

};
phantasus.FilterUI.topFilter = function (project, name, isColumns, $ui, filter) {
  $ui.empty();
  var html = ['<label>Direction: </label>',
              '<select class="form-control input-sm phantasus-filter-input" name="direction">',
                '<option value="Top">Top</option>',
                '<option value="Bottom">Bottom</option>',
                '<option value="TopBottom">Top/Bottom</option>',
              '</select>',
              '<label>Amount:</label>',
              '<input class="form-control input-sm phantasus-filter-input" name="n" type="text" />',
              '<br /><a data-name="switch" href="#">Switch to range filter</a>'];

  var $form = $(html.join(''));
  $form.appendTo($ui);
  var $n = $ui.find('[name=n]');
  var $direction = $ui.find('[name=direction]');
  $ui.find('[data-name=switch]')
    .on(
      'click',
      function (e) {
        e.preventDefault();
        var newFilter = phantasus.FilterUI.rangeFilter(project,
          name, isColumns, $ui);
        var index = -1;
        var filters = isColumns ? project.getColumnFilter()
          .getFilters() : project.getRowFilter()
          .getFilters();
        for (var i = 0; i < filters.length; i++) {
          if (filters[i] === filter) {
            index = i;
            break;
          }
        }
        if (index === -1) {
          throw new Error('Filter not found.');
        }
        (isColumns ? project.getColumnFilter() : project
          .getRowFilter()).set(index, newFilter);
        isColumns ? project.setColumnFilter(project
          .getColumnFilter(), true) : project
          .setRowFilter(project.getRowFilter(), true);
      });
  if (!filter) {
    filter = new phantasus.TopNFilter(NaN, phantasus.TopNFilter.TOP, name, isColumns);
  } else {
    var dirVal;
    if (filter.direction === phantasus.TopNFilter.TOP) {
      dirVal = 'Top';
    } else if (filter.direction === phantasus.TopNFilter.BOTTOM) {
      dirVal = 'Bottom';
    } else {
      dirVal = 'TopBottom';
    }
    $direction.val(dirVal);
    $n.val(filter.n);
  }

  $direction.on('change', function () {
    var dir = $(this).val();
    var dirVal;
    if (dir === 'Top') {
      dirVal = phantasus.TopNFilter.TOP;
    } else if (dir === 'Bottom') {
      dirVal = phantasus.TopNFilter.BOTTOM;
    } else {
      dirVal = phantasus.TopNFilter.TOP_BOTTOM;
    }
    filter.setDirection(dirVal);

    isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
      : project.setRowFilter(project.getRowFilter(), true);
  });
  $n.on('keyup', _.debounce(function (e) {
    filter.setN(parseInt($.trim($(this).val())));
    isColumns ? project.setColumnFilter(project.getColumnFilter(), true)
      : project.setRowFilter(project.getRowFilter(), true);

  }, 500));

  return filter;
};
phantasus.FilterUI.prototype = {
  /**
   *
   * @param options
   *            options.$div div to add filter to or null to add to end
   *            options.filter Pre-existing filter or null to create filter
   *            options.fieldName Field name to filter on
   */
  createFilter: function (options) {
    var index = -1;
    var $div = options.$div;
    var isColumns = this.isColumns;
    var filter = options.filter;
    var project = this.project;
    var fieldName = filter ? filter.name : options.fieldName;
    var $ui;
    if (!$div) {
      // add filter to end
      var $add = $(this.add(filter));
      $add.appendTo(this.$div);
      $ui = $add.find('[data-name=ui]');
    } else { // existing $div
      var $row = $div.closest('.phantasus-entry');
      index = $row.index() - 1;
      $ui = $row.find('[data-name=ui]');
    }

    $ui.empty();
    var vector = (isColumns ? this.project.getFullDataset()
    .getColumnMetadata() : this.project.getFullDataset()
    .getRowMetadata()).getByName(fieldName);

    if (filter instanceof phantasus.RangeFilter) {
      phantasus.FilterUI.rangeFilter(project, fieldName, isColumns, $ui,
        filter);
    } else if (filter instanceof phantasus.TopNFilter) {
      phantasus.FilterUI.topFilter(project, fieldName, isColumns, $ui,
        filter);
    } else if (filter == null && phantasus.VectorUtil.isNumber(vector)
      && phantasus.VectorUtil.containsMoreThanNValues(vector, 9)) {
      filter = phantasus.FilterUI.rangeFilter(project, fieldName,
        isColumns, $ui, filter);
    } else {
      var set = phantasus.VectorUtil.getSet(vector);
      var array = set.values();
      array.sort(phantasus.SortKey.ASCENDING_COMPARATOR);

      array = array.map(function (item) {
        if (item === '') {
          return {valueOf: function () { return ''; }, toString: function () { return '(None)'; }};
        } else if (item === null || item === undefined) {
          return {valueOf: function () { return item }, toString: function () { return '(NULL)'; }};
        }

        return item;
      });
      if (!filter) {
        filter = new phantasus.VectorFilter(new phantasus.Set(), set
          .size(), fieldName, isColumns);
      } else {
        filter.maxSetSize = array.length;
      }

      var checkBoxList = new phantasus.CheckBoxList({
        responsive: false,
        $el: $ui,
        items: array,
        set: filter.set
      });
      checkBoxList.on('checkBoxSelectionChanged', function () {
        isColumns ? project.setColumnFilter(project.getColumnFilter(),
          true) : project.setRowFilter(project.getRowFilter(),
          true);

      });
    }
    if (index !== -1) {
      // set the filter index
      if (fieldName !== '') {
        (isColumns ? project.getColumnFilter() : project.getRowFilter())
          .set(index, filter);
      } else {
        (isColumns ? project.getColumnFilter() : project.getRowFilter())
          .set(index, new phantasus.AlwaysTrueFilter());
      }
    }
    return filter;
  },

  addBase: function () {
    var html = [];
    html
      .push('<div style="padding-bottom:2px;border-bottom:1px solid #eee" class="phantasus-entry">');
    html.push('<div class="row">');
    html
      .push('<div class="col-xs-12">'
        + '<div class="checkbox"><label><input type="checkbox" name="filterMode">Pass all filters</label></div> '

        + '</div>');
    html.push('</div>');
    html.push('<div class="row">');
    html
      .push('<div class="col-xs-8"><a class="btn btn-default btn-xs" role="button"' +
        ' data-name="add" href="#">Add</a></div>');

    html.push('</div>');
    html.push('</div>');
    return html.join('');
  },
  add: function (filter) {
    var project = this.project;
    var isColumns = this.isColumns;
    var fields = phantasus.MetadataUtil.getMetadataNames(isColumns ? project
      .getFullDataset().getColumnMetadata() : project
      .getFullDataset().getRowMetadata());
    var html = [];
    html.push('<div class="phantasus-entry">');

    html.push('<div class="form-group" style="margin-bottom: 0px;">');
    html.push('<label>Field:</label>');
    // field

    html.push('<select style="max-width:150px;overflow-x:hidden; display: inline-block; margin: 5px; padding: 5px; line-height: normal; height: auto;" name="by" class="form-control input-sm">');
    html.push('<option disabled selected value style="display: none">--select field--</option>');
    var filterField = filter ? filter.toString() : null;

    _.each(fields, function (field) {
      html.push('<option value="' + field + '"');
      if (field === filterField) {
        html.push(' selected');
      }
      html.push('>');
      html.push(field);
      html.push('</option>');
    });
    html.push('</select>');
    html.push('</div>');
    html.push('<div class="row">');
    // filter ui
    html.push('<div data-name="ui" class="col-xs-12"></div>');
    html.push('</div>');

    // end filter ui

    // add/delete
    html
      .push('<div style="padding-bottom:6px; border-bottom:1px solid #eee" class="row">');

    html.push('<div class="col-xs-11">');

    html
      .push('<a class="btn btn-default btn-xs" role="button" data-name="delete"' +
        ' href="#">Remove</a>');
    html.push('</div>');

    html.push('</div>'); // row
    html.push('</div>'); // phantasus-entry
    return html.join('');
  }
};

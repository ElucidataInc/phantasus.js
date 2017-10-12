/**
 *
 * @param dataset
 * @constructor
 */
phantasus.Project = function (dataset) {
  this.originalDataset = dataset;
  this.rowIndexMapper = new phantasus.IndexMapper(this, true);
  this.columnIndexMapper = new phantasus.IndexMapper(this, false);
  this.groupRows = [];
  this.groupColumns = [];
  this.rowColorModel = new phantasus.VectorColorModel();
  this.columnColorModel = new phantasus.VectorColorModel();
  this.rowShapeModel = new phantasus.VectorShapeModel();
  this.columnShapeModel = new phantasus.VectorShapeModel();
  this.hoverColumnIndex = -1;
  this.hoverRowIndex = -1;
  this.columnSelectionModel = new phantasus.SelectionModel(this, true);
  this.rowSelectionModel = new phantasus.SelectionModel(this, false);
  this.elementSelectionModel = new phantasus.ElementSelectionModel(this);
  this.symmetricProjectListener = null;
  phantasus.Project._recomputeCalculatedColumnFields(this.originalDataset, phantasus.VectorKeys.RECOMPUTE_FUNCTION_NEW_HEAT_MAP);
  phantasus.Project
    ._recomputeCalculatedColumnFields(new phantasus.TransposedDatasetView(
      this.originalDataset), phantasus.VectorKeys.RECOMPUTE_FUNCTION_NEW_HEAT_MAP);
  phantasus.Project._recomputeCalculatedColumnFields(this.originalDataset, phantasus.VectorKeys.RECOMPUTE_FUNCTION_FILTER);
  phantasus.Project
  ._recomputeCalculatedColumnFields(new phantasus.TransposedDatasetView(
    this.originalDataset), phantasus.VectorKeys.RECOMPUTE_FUNCTION_FILTER);
  this.history = [];
};
phantasus.Project.Events = {
  DATASET_CHANGED: 'datasetChanged',
  ROW_GROUP_BY_CHANGED: 'rowGroupByChanged',
  COLUMN_GROUP_BY_CHANGED: 'columnGroupByChanged',
  ROW_FILTER_CHANGED: 'rowFilterChanged',
  COLUMN_FILTER_CHANGED: 'columnFilterChanged',
  ROW_SORT_ORDER_CHANGED: 'rowSortOrderChanged',
  COLUMN_SORT_ORDER_CHANGED: 'columnSortOrderChanged',
  ROW_TRACK_REMOVED: 'rowTrackRemoved',
  COLUMN_TRACK_REMOVED: 'columnTrackRemoved'
};

phantasus.Project._recomputeCalculatedColumnFields = function (dataset, key) {
  var metadata = dataset.getColumnMetadata();
  var view = new phantasus.DatasetColumnView(dataset);
  var nfound = 0;
  for (var metadataIndex = 0,
         count = metadata.getMetadataCount(); metadataIndex < count; metadataIndex++) {
    var vector = metadata.get(metadataIndex);
    if (vector.getProperties().get(phantasus.VectorKeys.FUNCTION) != null
      && vector.getProperties().get(key)) {

      // // copy properties
      // var v = metadata.add(name);
      // vector.getProperties().forEach(function (val, key) {
      //   v.getProperties().set(key, val);
      // });
      // vector = v;
      var f = phantasus.VectorUtil.jsonToFunction(vector, phantasus.VectorKeys.FUNCTION);
      for (var j = 0, size = vector.size(); j < size; j++) {
        view.setIndex(j);
        vector.setValue(j, f(view, dataset, j));
      }
      nfound++;
    }
  }
  return nfound;
};
phantasus.Project.prototype = {
  isSymmetric: function () {
    return this.symmetricProjectListener != null;
  },
  setSymmetric: function (heatMap) {
    if (heatMap != null) {
      if (this.symmetricProjectListener == null) {
        this.symmetricProjectListener = new phantasus.SymmetricProjectListener(heatMap.getProject(), heatMap.vscroll, heatMap.hscroll);
      }
    } else {
      if (this.symmetricProjectListener != null) {
        this.symmetricProjectListener.dispose();
      }
      this.symmetricProjectListener = null;
    }
  },
  getHoverColumnIndex: function () {
    return this.hoverColumnIndex;
  },
  setHoverColumnIndex: function (index) {
    this.hoverColumnIndex = index;
  },
  getHoverRowIndex: function () {
    return this.hoverRowIndex;
  },
  setHoverRowIndex: function (index) {
    this.hoverRowIndex = index;
  },
  getRowColorModel: function () {
    return this.rowColorModel;
  },
  getRowShapeModel: function () {
    return this.rowShapeModel;
  },
  getColumnShapeModel: function () {
    return this.columnShapeModel;
  },
  getGroupRows: function () {
    return this.groupRows;
  },
  getGroupColumns: function () {
    return this.groupColumns;
  },
  getFullDataset: function () {
    return this.originalDataset;
  },
  getColumnSelectionModel: function () {
    return this.columnSelectionModel;
  },
  getRowSelectionModel: function () {
    return this.rowSelectionModel;
  },
  getFilteredSortedRowIndices: function () {
    return this.rowIndexMapper.convertToView();
  },
  getFilteredSortedColumnIndices: function () {
    return this.columnIndexMapper.convertToView();
  },
  getElementSelectionModel: function () {
    return this.elementSelectionModel;
  },
  setFullDataset: function (dataset, notify) {
    this.originalDataset = dataset;
    this.rowIndexMapper.setFilter(this.rowIndexMapper.getFilter());
    this.columnIndexMapper.setFilter(this.columnIndexMapper.getFilter());
    this.columnSelectionModel.clear();
    this.rowSelectionModel.clear();
    this.elementSelectionModel.clear();
    if (notify) {
      this.trigger(phantasus.Project.Events.DATASET_CHANGED);
    }
  },
  setGroupRows: function (keys, notify) {
    this.groupRows = keys;
    for (var i = 0, nkeys = keys.length; i < nkeys; i++) {
      if (keys[i].isColumns() === undefined) {
        keys[i].setColumns(false);
      }
    }
    if (notify) {
      this.trigger(phantasus.Project.Events.ROW_GROUP_BY_CHANGED);
    }
  },
  setGroupColumns: function (keys, notify) {
    this.groupColumns = keys;
    for (var i = 0, nkeys = keys.length; i < nkeys; i++) {
      if (keys[i].isColumns() === undefined) {
        keys[i].setColumns(true);
      }
    }
    if (notify) {
      this.trigger(phantasus.Project.Events.COLUMN_GROUP_BY_CHANGED);
    }
  },
  setRowFilter: function (filter, notify) {
    this._saveSelection(false);
    this.rowIndexMapper.setFilter(filter);
    this._restoreSelection(false);
    if (notify) {
      this.trigger(phantasus.Project.Events.ROW_FILTER_CHANGED);
    }
  },
  getRowFilter: function () {
    return this.rowIndexMapper.getFilter();
  },
  getColumnFilter: function () {
    return this.columnIndexMapper.getFilter();
  },
  setColumnFilter: function (filter, notify) {
    this._saveSelection(true);
    this.columnIndexMapper.setFilter(filter);
    this._restoreSelection(true);
    if (notify) {
      this.trigger(phantasus.Project.Events.COLUMN_FILTER_CHANGED);
    }
  },
  getColumnColorModel: function () {
    return this.columnColorModel;
  },
  getSortedFilteredDataset: function () {
    return phantasus.DatasetUtil.slicedView(this.getFullDataset(),
      this.rowIndexMapper.convertToView(), this.columnIndexMapper
        .convertToView());
  },
  getSelectedDataset: function (options) {
    options = $.extend({}, {
      selectedRows: true,
      selectedColumns: true,
      emptyToAll: true
    }, options);
    var dataset = this.getSortedFilteredDataset();
    var rows = null;
    if (options.selectedRows) {
      rows = this.rowSelectionModel.getViewIndices().values().sort(
        function (a, b) {
          return (a === b ? 0 : (a < b ? -1 : 1));
        });
      if (rows.length === 0 && options.emptyToAll) {
        rows = null;
      }
    }
    var columns = null;
    if (options.selectedColumns) {
      columns = this.columnSelectionModel.getViewIndices().values().sort(
        function (a, b) {
          return (a === b ? 0 : (a < b ? -1 : 1));
        });
      if (columns.length === 0 && options.emptyToAll) {
        columns = null;
      }
    }
    return rows == null && columns == null ? dataset : new phantasus.SlicedDatasetView(dataset, rows, columns);
  },
  _saveSelection: function (isColumns) {
    this.elementSelectionModel.save();
    if (isColumns) {
      this.columnSelectionModel.save();
    } else {
      this.rowSelectionModel.save();
    }
  },
  _restoreSelection: function (isColumns) {
    if (isColumns) {
      this.columnSelectionModel.restore();
    } else {
      this.rowSelectionModel.restore();
    }
    this.elementSelectionModel.restore();
  },
  setRowSortKeys: function (keys, notify) {
    this._saveSelection(false);
    for (var i = 0, nkeys = keys.length; i < nkeys; i++) {
      if (keys[i].isColumns() === undefined) {
        keys[i].setColumns(false);
      }
    }
    this.rowIndexMapper.setSortKeys(keys);
    this._restoreSelection(false);
    if (notify) {
      this.trigger(phantasus.Project.Events.ROW_SORT_ORDER_CHANGED);
    }
  },
  setColumnSortKeys: function (keys, notify) {
    this._saveSelection(true);
    for (var i = 0, nkeys = keys.length; i < nkeys; i++) {
      if (keys[i].isColumns() === undefined) {
        keys[i].setColumns(true);
      }
    }
    this.columnIndexMapper.setSortKeys(keys);
    this._restoreSelection(true);
    if (notify) {
      this.trigger(phantasus.Project.Events.COLUMN_SORT_ORDER_CHANGED);
    }
  },
  getRowSortKeys: function () {
    return this.rowIndexMapper.sortKeys;
  },
  getColumnSortKeys: function () {
    return this.columnIndexMapper.sortKeys;
  },
  convertViewColumnIndexToModel: function (viewIndex) {
    return this.columnIndexMapper.convertViewIndexToModel(viewIndex);
  },
  convertViewRowIndexToModel: function (viewIndex) {
    return this.rowIndexMapper.convertViewIndexToModel(viewIndex);
  },
  convertModelRowIndexToView: function (modelIndex) {
    return this.rowIndexMapper.convertModelIndexToView(modelIndex);
  },
  convertModelColumnIndexToView: function (modelIndex) {
    return this.columnIndexMapper.convertModelIndexToView(modelIndex);
  },
  isColumnViewIndexSelected: function (index) {
    return this.columnSelectionModel.isViewIndexSelected(index);
  },
  isRowViewIndexSelected: function (index) {
    return this.rowSelectionModel.isViewIndexSelected(index);
  }
};
phantasus.Util.extend(phantasus.Project, phantasus.Events);

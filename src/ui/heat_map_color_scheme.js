/**
 * @param type
 *            Either relative or fixed.
 * @param stops
 *            An array of objects with value and color
 */
phantasus.HeatMapColorScheme = function (project, scheme) {
  this.project = project;
  var _this = this;

  this.separateColorSchemeForRowMetadataField = null;
  this.rowValueToColorSupplier = {};
  this.value = null;
  if (scheme) {
    if (scheme.valueToColorScheme) { // json representation
      this.fromJSON(scheme);
    } else {
      this.rowValueToColorSupplier[null] = this.fromJSON(scheme);
      this.currentColorSupplier = this.rowValueToColorSupplier[this.value];
    }
  }
  project
    .on(
      'rowFilterChanged columnFilterChanged rowSortOrderChanged columnSortOrderChanged datasetChanged',
      function () {
        _this.projectUpdated();
      });
  this.projectUpdated();
};
phantasus.HeatMapColorScheme.Predefined = {};

phantasus.HeatMapColorScheme.Predefined.CN = function () {
  return {
    scalingMode: 'fixed',
    values: [-2, -0.1, 0.1, 2],
    colors: ['#0000ff', '#ffffff', '#ffffff', '#ff0000']
  };
};
phantasus.HeatMapColorScheme.Predefined.BINARY = function () {
  return {
    scalingMode: 'fixed',
    values: [0, 1],
    colors: ['#ffffff', 'black']
  };
};
phantasus.HeatMapColorScheme.Predefined.RELATIVE = function () {
  return {
    scalingMode: 'relative'
  };
};
phantasus.HeatMapColorScheme.Predefined.MAF = function () {
  // coMut plot colors
  return {
    scalingMode: 'fixed',
    stepped: true,
    values: [0, 1, 2, 3, 4, 5, 6, 7],
    names: ['', 'Synonymous', 'In Frame Indel', 'Other Non-Synonymous', 'Missense', 'Splice Site', 'Frame Shift', 'Nonsense'],
    colors: ['#ffffff', '#4daf4a', '#ffff33', '#a65628', '#377eb8', '#984ea3', '#ff7f00', '#e41a1c']
  };
};
// phantasus.HeatMapColorScheme.Predefined.MAF_NEW = function() {
// // Synonymous 1
// //In_frame_Indel 2
// //Other_non_syn. 3
// //Missense 4
// //Splice_Site 5
// //Frame_Shift 6
// //Nonsense 7
// return {
// type : 'fixed',
// stepped : true,
// map : [ {
// value : 0,
// color : 'rgb(' + [ 255, 255, 255 ].join(',') + ')',
// name : ''
// }, {
// value : 1,
// color : 'rgb(' + [ 255, 255, 179 ].join(',') + ')',
// name : 'Silent'
// }, {
// value : 2,
// color : 'rgb(' + [ 69, 117, 180 ].join(',') + ')',
// name : 'In Frame Indel'
// }, {
// value : 3,
// color : 'rgb(' + [ 247, 182, 210 ].join(',') + ')',
// name : 'Other Non-Synonymous'
// }, {
// value : 4,
// color : 'rgb(' + [ 1, 133, 113 ].join(',') + ')',
// name : 'Missense'
// }, {
// value : 5,
// color : 'rgb(' + [ 253, 180, 98 ].join(',') + ')',
// name : 'Splice Site'
// }, {
// value : 6,
// color : 'rgb(' + [ 140, 81, 10 ].join(',') + ')',
// name : 'Frame Shift'
// }, {
// value : 7,
// color : 'rgb(' + [ 123, 50, 148 ].join(',') + ')',
// name : 'Nonsense'
// } ]
// };
// };
phantasus.HeatMapColorScheme.Predefined.ZS = function () {
  return {
    scalingMode: 'fixed',
    values: [-10, -2, 2, 10],
    colors: ['#0000ff', '#ffffff', '#ffffff', '#ff0000']
  };
};
phantasus.HeatMapColorScheme.ScalingMode = {
  RELATIVE: 0,
  FIXED: 1
};

phantasus.HeatMapConditions = function () {
  this.array = [];
  // each condition is a object with: seriesName (series is old deprecated field), shape, color and
  // accept(val) function

};
phantasus.HeatMapConditions.prototype = {
  insert: function (index, c) {
    this.array.splice(index, 0, c);
  },
  add: function (c) {
    this.array.push(c);
  },
  getConditions: function () {
    return this.array;
  },
  remove: function (index) {
    this.array.splice(index, 1);
  },
  copy: function () {
    var c = new phantasus.HeatMapConditions();
    this.array.forEach(function (cond) {
      c.array.push(_.clone(cond));
    });
    return c;
  }
};

phantasus.HeatMapColorScheme.prototype = {
  getColors: function () {
    return this.currentColorSupplier.getColors();
  },
  setMissingColor: function (color) {
    this.currentColorSupplier.setMissingColor(color);
  },
  getHiddenValues: function () {
    return this.currentColorSupplier.getHiddenValues ? this.currentColorSupplier
        .getHiddenValues()
      : null;
  },
  getMissingColor: function () {
    return this.currentColorSupplier.getMissingColor();
  },
  getScalingMode: function () {
    return this.currentColorSupplier.getScalingMode();
  },
  getSizer: function () {
    return this.currentColorSupplier.getSizer();
  },
  getConditions: function () {
    return this.currentColorSupplier.getConditions();
  },
  setScalingMode: function (scalingMode) {
    this.currentColorSupplier.setScalingMode(scalingMode);
  },
  getFractions: function () {
    return this.currentColorSupplier.getFractions();
  },
  getNames: function () {
    return this.currentColorSupplier.getNames();
  },
  getMin: function () {
    return this.currentColorSupplier.getMin();
  },
  getMax: function () {
    return this.currentColorSupplier.getMax();
  },
  setMin: function (min) {
    this.currentColorSupplier.setMin(min);
  },
  setMax: function (max) {
    this.currentColorSupplier.setMax(max);
  },
  isStepped: function () {
    return this.currentColorSupplier.isStepped();
  },
  setFractions: function (options) {
    this.currentColorSupplier.setFractions(options);
  },
  setTransformValues: function (options) {
    this.currentColorSupplier.setTransformValues(options);
    this.cachedRowStats.cachedRow = -1;
  },
  getTransformValues: function () {
    return this.currentColorSupplier.getTransformValues();
  },
  setStepped: function (stepped) {
    var oldColorSupplier = this.currentColorSupplier;
    var newColorSupplier = stepped ? new phantasus.SteppedColorSupplier()
      : new phantasus.GradientColorSupplier();
    newColorSupplier.sizer = oldColorSupplier.getSizer();
    newColorSupplier.array = oldColorSupplier.getConditions();
    newColorSupplier.setScalingMode(oldColorSupplier.getScalingMode());
    newColorSupplier.setMin(oldColorSupplier.getMin());
    newColorSupplier.setMax(oldColorSupplier.getMax());
    newColorSupplier.setFractions({
      fractions: oldColorSupplier.getFractions(),
      colors: oldColorSupplier.getColors()
    });
    this.currentColorSupplier = newColorSupplier;
    this.rowValueToColorSupplier[this.value] = this.currentColorSupplier;
  },
  toJSON: function () {
    var json = {};
    var _this = this;
    if (this.separateColorSchemeForRowMetadataField != null) {
      json.separateColorSchemeForRowMetadataField = this.separateColorSchemeForRowMetadataField;
    }
    json.valueToColorScheme = {};
    _.each(_.keys(this.rowValueToColorSupplier), function (key) {
      // save each scheme
      json.valueToColorScheme[key] = phantasus.AbstractColorSupplier.toJSON(_this.rowValueToColorSupplier[key]);
    });

    return json;
  },
  fromJSON: function (json) {
    var _this = this;
    if (json.separateColorSchemeForRowMetadataField) {
      this.separateColorSchemeForRowMetadataField = json.separateColorSchemeForRowMetadataField;
      this.vector = this.project.getSortedFilteredDataset()
        .getRowMetadata().getByName(
          this.separateColorSchemeForRowMetadataField);
    }
    this.rowValueToColorSupplier = {};
    var obj = json.valueToColorScheme || json.colorSchemes;
    if (obj == null) {
      var colorSupplier = phantasus.AbstractColorSupplier
        .fromJSON(json);
      _this.rowValueToColorSupplier['null'] = colorSupplier;
    } else {
      _.each(_.keys(obj), function (key) {
        var colorSupplier = phantasus.AbstractColorSupplier
          .fromJSON(obj[key]);
        _this.rowValueToColorSupplier[key] = colorSupplier;
      });
    }
    this._ensureColorSupplierExists();

  },
  copy: function (project) {
    var _this = this;
    var c = new phantasus.HeatMapColorScheme(project);
    c.separateColorSchemeForRowMetadataField = this.separateColorSchemeForRowMetadataField;
    if (c.separateColorSchemeForRowMetadataField != null) {
      c.vector = project.getSortedFilteredDataset().getRowMetadata()
        .getByName(c.separateColorSchemeForRowMetadataField);

    }
    if (c.vector == null) {
      c.separateColorSchemeForRowMetadataField = null;
    }
    _.each(_.keys(this.rowValueToColorSupplier), function (key) {
      c.rowValueToColorSupplier[key] = _this.rowValueToColorSupplier[key]
        .copy();
    });

    c.value = this.value;
    c.currentColorSupplier = c.rowValueToColorSupplier[c.value];

    return c;
  },
  setSeparateColorSchemeForRowMetadataField: function (separateColorSchemeForRowMetadataField) {
    if (separateColorSchemeForRowMetadataField != this.separateColorSchemeForRowMetadataField) {
      this.separateColorSchemeForRowMetadataField = separateColorSchemeForRowMetadataField;
      this.vector = this.project.getSortedFilteredDataset()
        .getRowMetadata().getByName(
          separateColorSchemeForRowMetadataField);
      var _this = this;
      _.each(_.keys(this.rowValueToColorSupplier), function (key) {
        // remove old color schemes
        delete _this.rowValueToColorSupplier[key];
      });
    }
  },
  getProject: function () {
    return this.project;
  },
  getSeparateColorSchemeForRowMetadataField: function () {
    return this.separateColorSchemeForRowMetadataField;
  },
  getColorByValues: function () {
    return _.keys(this.rowValueToColorSupplier);
  },
  projectUpdated: function () {
    var dataset = this.project.getSortedFilteredDataset();
    if (this.separateColorSchemeForRowMetadataField != null) {
      this.vector = this.project.getSortedFilteredDataset()
        .getRowMetadata().getByName(
          this.separateColorSchemeForRowMetadataField);
    }
    this.cachedRowStats = new phantasus.RowStats(dataset);
  },
  setColorSupplierForCurrentValue: function (colorSupplier) {
    this.rowValueToColorSupplier[this.value] = colorSupplier;
    this.currentColorSupplier = colorSupplier;
  },
  setCurrentValue: function (value) {
    this.value = value;
    this._ensureColorSupplierExists();
  },
  isSizeBy: function () {
    this.currentColorSupplier.isSizeBy();
  },
  getCurrentColorSupplier: function () {
    return this.currentColorSupplier;
  },
  getColor: function (row, column, val) {
    if (this.vector !== undefined) {
      var tmp = this.vector.getValue(row);
      if (this.value !== tmp) {
        this.value = tmp;
        this._ensureColorSupplierExists();
      }
    }
    if (this.currentColorSupplier.getScalingMode() === phantasus.HeatMapColorScheme.ScalingMode.RELATIVE) {
      if (this.cachedRowStats.maybeUpdateRelative(row)) {
        this.currentColorSupplier
          .setMin(this.cachedRowStats.rowCachedMin);
        this.currentColorSupplier
          .setMax(this.cachedRowStats.rowCachedMax);
      }
    } else if (this.currentColorSupplier.getTransformValues() && this.cachedRowStats.cachedRow !== row) {
      this.cachedRowStats.cacheTransformValues(row, this.currentColorSupplier.getTransformValues());
      val = (val - this.cachedRowStats.rowCachedMean) / this.cachedRowStats.rowCachedStandardDeviation;
    }
    return this.currentColorSupplier.getColor(row, column, val);
  },
  /**
   * @private
   */
  _ensureColorSupplierExists: function () {
    this.currentColorSupplier = this.rowValueToColorSupplier[this.value];
    if (this.currentColorSupplier === undefined) {
      var cs = phantasus.AbstractColorSupplier.fromJSON({
        scalingMode: 'relative'
      });
      this.rowValueToColorSupplier[this.value] = cs;
      this.currentColorSupplier = cs;
    }
  }
};
phantasus.RowStats = function (dataset) {
  this.datasetRowView = new phantasus.DatasetRowView(dataset);
  this.cachedRow = -1;
  this.rowCachedMax = 0;
  this.rowCachedMin = 0;
  this.rowCachedStandardDeviation = -1;
  this.rowCachedMean = -1;
};
phantasus.RowStats.prototype = {
  cacheTransformValues: function (row, transform) {
    var meanFunction = transform === phantasus.AbstractColorSupplier.Z_SCORE ? phantasus.Mean : phantasus.Median;
    var stdevFunction = transform === phantasus.AbstractColorSupplier.Z_SCORE ? phantasus.StandardDeviation : phantasus.MAD;
    this.datasetRowView.setIndex(row);
    this.rowCachedMean = meanFunction(this.datasetRowView);
    this.rowCachedStandardDeviation = stdevFunction(this.datasetRowView, this.rowCachedMean);
  },
  maybeUpdateRelative: function (row) {
    if (this.cachedRow !== row) {
      this.cachedRow = row;
      this.datasetRowView.setIndex(row);
      this.rowCachedMax = -Number.MAX_VALUE;
      this.rowCachedMin = Number.MAX_VALUE;
      for (var j = 0, ncols = this.datasetRowView.size(); j < ncols; j++) {
        var d = this.datasetRowView.getValue(j);
        if (!isNaN(d)) {
          this.rowCachedMax = d > this.rowCachedMax ? d
            : this.rowCachedMax;
          this.rowCachedMin = d < this.rowCachedMin ? d
            : this.rowCachedMin;
        }
      }
      if (this.rowCachedMin === this.rowCachedMax) {
        this.rowCachedMin--;
      }
      return true;
    }
    return false;
  }
};

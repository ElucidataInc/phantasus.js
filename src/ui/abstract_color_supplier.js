phantasus.AbstractColorSupplier = function () {
  this.fractions = [0, 0.5, 1];
  this.colors = ['#0000ff', '#ffffff', '#ff0000'];
  this.names = null; // optional color stop names
  this.min = 0;
  this.max = 1;
  this.missingColor = '#c0c0c0';
  this.scalingMode = phantasus.HeatMapColorScheme.ScalingMode.RELATIVE;
  this.stepped = false;
  this.sizer = new phantasus.HeatMapSizer();
  this.conditions = new phantasus.HeatMapConditions();
  this.transformValues = 0;// z-score, robust z-score
};
phantasus.AbstractColorSupplier.Z_SCORE = 1;
phantasus.AbstractColorSupplier.ROBUST_Z_SCORE = 2;

phantasus.AbstractColorSupplier.toJSON = function (cs) {
  var json = {
    fractions: cs.fractions,
    colors: cs.colors,
    min: cs.min,
    max: cs.max,
    missingColor: cs.missingColor,
    scalingMode: cs.scalingMode,
    stepped: cs.stepped,
    transformValues: cs.transformValues
  };
  if (cs.names) {
    json.names = cs.names;
  }
  if (cs.conditions && cs.conditions.array.length > 0) {
    json.conditions = cs.conditions.array;
  }
  if (cs.sizer && cs.sizer.seriesName != null) {
    json.size = {
      seriesName: cs.sizer.seriesName,
      min: cs.sizer.min,
      max: cs.sizer.max
    };
  }
  return json;
};
phantasus.AbstractColorSupplier.fromJSON = function (json) {
  var cs = json.stepped ? new phantasus.SteppedColorSupplier()
    : new phantasus.GradientColorSupplier();

  if (json.scalingMode == null && json.type != null) {
    json.scalingMode = json.type; // old
  }
  if (json.scalingMode === 'relative' || json.scalingMode === 0) {
    json.scalingMode = 0;
  } else if (json.scalingMode === 'fixed' || json.scalingMode === 1) {
    json.scalingMode = 1;
  } else { // default to relative
    json.scalingMode = 0;
  }
  cs.setScalingMode(json.scalingMode);
  if (json.min != null) {
    cs.setMin(json.min);
  }
  if (json.max != null) {
    cs.setMax(json.max);
  }
  if (json.missingColor != null) {
    cs.setMissingColor(json.missingColor);
  }
  if (phantasus.HeatMapColorScheme.ScalingMode.RELATIVE !== json.scalingMode) {
    cs.setTransformValues(json.transformValues);
  }

  if (json.map) { // old
    json.values = json.map.map(function (item) {
      return item.value;
    });
    json.colors = json.map.map(function (item) {
      return item.color;
    });
  }
  var fractions = json.fractions;
  if (json.values) { // map values to fractions
    fractions = [];
    var values = json.values;
    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;
    for (var i = 0; i < values.length; i++) {
      var value = values[i];
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
    var valueToFraction = d3.scale.linear().domain(
      [min, max]).range(
      [0, 1]).clamp(true);

    for (var i = 0; i < values.length; i++) {
      fractions.push(valueToFraction(values[i]));
    }
    if (json.min == null) {
      cs.setMin(min);
    }
    if (json.max == null) {
      cs.setMax(max);
    }
  }
  if (json.colors != null && json.colors.length > 0) {
    cs.setFractions({
      colors: json.colors,
      fractions: fractions,
      names: json.names
    });
  }
  if (json.size) {
    cs.getSizer().setSeriesName(json.size.seriesName);
    cs.getSizer().setMin(json.size.min);
    cs.getSizer().setMax(json.size.max);
  }

  if (json.conditions && _.isArray(json.conditions)) {
    // load conditions
    json.conditions.forEach(function (condition) {
      var gtf = function () {
        return true;
      };
      var ltf = function () {
        return true;
      };
      if (condition.seriesName == null) {
        condition.seriesName = condition.series; // series is deprecated
      }
      if (condition.v1 != null && !isNaN(condition.v1)) {
        gtf = condition.v1Op === 'gt' ? function (val) {
          return val > condition.v1;
        } : function (val) {
          return val >= condition.v1;
        };
      }

      if (condition.v2 != null && !isNaN(condition.v2)) {
        ltf = condition.v2Op === 'lt' ? function (val) {
          return val < condition.v2;
        } : function (val) {
          return val <= condition.v2;
        };
      }
      condition.accept = function (val) {
        return gtf(val) && ltf(val);
      };
    });
    cs.conditions.array = json.conditions;
  }
  return cs;
};

phantasus.AbstractColorSupplier.prototype = {
  getTransformValues: function () {
    return this.transformValues;
  },
  setTransformValues: function (transformValues) {
    this.transformValues = transformValues;
  },
  getSizer: function () {
    return this.sizer;
  },
  getConditions: function () {
    return this.conditions;
  },
  createInstance: function () {
    throw 'not implemented';
  },
  copy: function () {
    var c = this.createInstance();
    c.stepped = this.stepped;
    c.setFractions({
      fractions: this.fractions.slice(0),
      colors: this.colors.slice(0)
    });
    if (this.names != null) {
      c.names = this.names.slice(0);
    }
    if (this.sizer) {
      c.sizer = this.sizer.copy();
    }
    if (this.conditions) {
      c.conditions = this.conditions.copy();
    }
    c.scalingMode = this.scalingMode;
    c.min = this.min;
    c.max = this.max;
    c.missingColor = this.missingColor;
    if (this.scalingMode !== phantasus.HeatMapColorScheme.ScalingMode.RELATIVE) {
      c.transformValues = this.transformValues;
    }

    return c;
  },
  setMissingColor: function (missingColor) {
    this.missingColor = missingColor;
  },
  getMissingColor: function () {
    return this.missingColor;
  },
  getScalingMode: function () {
    return this.scalingMode;
  },
  setScalingMode: function (scalingMode) {
    if (scalingMode !== this.scalingMode) {
      if (scalingMode === phantasus.HeatMapColorScheme.ScalingMode.RELATIVE) {
        this.min = 0;
        this.max = 1;
      }
      this.scalingMode = scalingMode;
    }
  },
  isStepped: function () {
    return false;
  },
  getColor: function (row, column, value) {
    throw 'not implemented';
  },
  getColors: function () {
    return this.colors;
  },
  getNames: function () {
    return this.names;
  },
  getFractions: function () {
    return this.fractions;
  },
  getMin: function () {
    return this.min;
  },
  getMax: function () {
    return this.max;
  },
  setMin: function (min) {
    this.min = min;
  },
  setMax: function (max) {
    // the min and max are set by heat map color scheme for each row
    this.max = max;
  },
  /**
   *
   * @param options.fractions
   *            Array of stop fractions
   * @param options.colors
   *            Array of stop colors
   * @param options.names
   *            Array of stop names
   */
  setFractions: function (options) {
    var index = phantasus.Util.indexSort(options.fractions, true);
    this.fractions = phantasus.Util.reorderArray(options.fractions, index);
    this.colors = phantasus.Util.reorderArray(options.colors, index);
    this.names = options.names ? phantasus.Util.reorderArray(options.names,
      index) : null;
  }
};

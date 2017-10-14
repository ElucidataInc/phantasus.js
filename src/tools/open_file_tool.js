phantasus.OpenFileTool = function (options) {
  this.options = options || {};
};
phantasus.OpenFileTool.prototype = {
  toString: function () {
    return 'Open' + (this.options.file != null ? (' - ' + this.options.file.name) : '');
  },
  gui: function () {
    var array = [{
      name: 'open_file_action',
      value: 'open',
      type: 'bootstrap-select',
      options: [{
        name: 'Open session',
        value: 'Open session'
      }, {divider: true}, {
        name: 'Annotate columns',
        value: 'Annotate Columns'
      }, {
        name: 'Annotate rows',
        value: 'Annotate Rows'
      }, {
        divider: true
      }, {
        name: 'Append rows to current dataset',
        value: 'append'
      }, {
        name: 'Append columns to current dataset',
        value: 'append columns'
      }, {
        name: 'Overlay onto current dataset',
        value: 'overlay'
      }, {
        name: 'Open dataset in new tab',
        value: 'open'
      }, {
        divider: true
      }, {
        name: 'Open dendrogram',
        value: 'Open dendrogram'
      }]
    }];
    if (this.options.file == null) {
      array.push({
        name: 'file',
        showLabel: false,
        placeholder: 'Open your own file',
        value: '',
        type: 'file',
        required: true,
        help: phantasus.DatasetUtil.DATASET_AND_SESSION_FILE_FORMATS
      });
    }
    array.options = {
      ok: this.options.file != null,
      size: 'modal-lg'
    };
    return array;
  },
  init: function (project, form, initOptions) {
    var $preloaded = $('<div></div>');
    form.$form.find('[name=open_file_action]').on(
      'change',
      function (e) {
        var action = $(this).val();
        if (action === 'append columns' || action === 'append'
          || action === 'open' || action === 'overlay') {
          form.setHelpText('file',
            phantasus.DatasetUtil.DATASET_FILE_FORMATS);
          $preloaded.show();
        } else if (action === 'Open dendrogram') {
          form.setHelpText('file',
            phantasus.DatasetUtil.DENDROGRAM_FILE_FORMATS);
          $preloaded.hide();
        } else if (action === 'Open session') {
          form.setHelpText('file', phantasus.DatasetUtil.SESSION_FILE_FORMAT);
          $preloaded.hide();
        } else {
          form.setHelpText('file',
            phantasus.DatasetUtil.ANNOTATION_FILE_FORMATS);
          $preloaded.hide();
        }
      });
    if (this.options.file == null) {
      var _this = this;
      var collapseId = _.uniqueId('phantasus');
      $('<h4><a role="button" data-toggle="collapse" href="#'
        + collapseId
        + '" aria-expanded="false" aria-controls="'
        + collapseId + '">Preloaded datasets</a></h4>').appendTo($preloaded);
      var $sampleDatasets = $('<div data-name="sampleData" id="' + collapseId + '" class="collapse"' +
        ' id="' + collapseId + '" style="overflow:auto;"></div>');
      $preloaded.appendTo(form.$form);
      var sampleDatasets = new phantasus.SampleDatasets({
        $el: $sampleDatasets,
        callback: function (heatMapOptions) {
          _this.options.file = heatMapOptions.dataset;
          _this.ok();
        }
      });
      $sampleDatasets.appendTo($preloaded);
    }
    form.on('change', function (e) {
      var value = e.value;
      if (value !== '' && value != null) {
        form.setValue('file', value);
        _this.options.file = value;
        _this.ok();
      }
    });

  },

  execute: function (options) {
    var _this = this;
    var isInteractive = this.options.file == null;
    var heatMap = options.heatMap;
    if (!isInteractive) {
      options.input.file = this.options.file;
    }
    if (options.input.file.isGEO) {
      options.input.isGEO = options.input.file.isGEO;
      options.input.file = options.input.file.name;
    }
    if (options.input.file.preloaded) {
      options.input.preloaded = options.input.file.preloaded;
      options.input.file = options.input.file.name;
    }
    var project = options.project;
    if (options.input.open_file_action === 'Open session') {
      return phantasus.Util.getText(options.input.file).done(function (text) {
        var options = JSON.parse(text);
        options.tabManager = heatMap.getTabManager();
        options.focus = true;
        options.inheritFromParent = false;
        options.landingPage = heatMap.options.landingPage;
        new phantasus.HeatMap(options);
      }).fail(function (err) {
        phantasus.FormBuilder.showMessageModal({
          title: 'Error',
          message: 'Unable to load session',
          focus: document.activeElement
        });
      });
    } else if (options.input.open_file_action === 'append columns'
      || options.input.open_file_action === 'append'
      || options.input.open_file_action === 'open'
      || options.input.open_file_action === 'overlay') {
      return new phantasus.OpenDatasetTool().execute(options);
    } else if (options.input.open_file_action === 'Open dendrogram') {
      phantasus.HeatMap.showTool(new phantasus.OpenDendrogramTool(
        options.input.file), options.heatMap);
    } else { // annotate rows or columns
      var d = $.Deferred();
      var isAnnotateColumns = options.input.open_file_action ==
        'Annotate Columns';
      var fileOrUrl = options.input.file;
      var dataset = project.getFullDataset();
      var fileName = phantasus.Util.getFileName(fileOrUrl);
      if (phantasus.Util.endsWith(fileName, '.cls')) {
        var result = phantasus.Util.readLines(fileOrUrl);
        result.always(function () {
          d.resolve();
        });
        result.done(function (lines) {
          _this.annotateCls(heatMap, dataset, fileName,
            isAnnotateColumns, lines);
        });
      } else if (phantasus.Util.endsWith(fileName, '.gmt')) {
        phantasus.ArrayBufferReader.getArrayBuffer(fileOrUrl, function (
          err,
          buf) {
          d.resolve();
          if (err) {
            throw new Error('Unable to read ' + fileOrUrl);
          }
          var sets = new phantasus.GmtReader().read(
            new phantasus.ArrayBufferReader(new Uint8Array(
              buf)));
          _this.promptSets(dataset, heatMap, isAnnotateColumns,
            sets, phantasus.Util.getBaseFileName(
              phantasus.Util.getFileName(fileOrUrl)));
        });

      } else {
        var result = phantasus.Util.readLines(fileOrUrl);
        result.done(function (lines) {
          _this.prompt(lines, dataset, heatMap, isAnnotateColumns);
        }).always(function () {
          d.resolve();
        });
        return d;
      }

    }
  },
  annotateCls: function (heatMap, dataset, fileName, isColumns, lines) {
    if (isColumns) {
      dataset = phantasus.DatasetUtil.transposedView(dataset);
    }
    var assignments = new phantasus.ClsReader().read(lines);
    if (assignments.length !== dataset.getRowCount()) {
      throw new Error(
        'Number of samples in cls file does not match dataset.');
    }
    var vector = dataset.getRowMetadata().add(
      phantasus.Util.getBaseFileName(fileName));
    for (var i = 0; i < assignments.length; i++) {
      vector.setValue(i, assignments[i]);
    }
    if (heatMap) {
      heatMap.getProject().trigger('trackChanged', {
        vectors: [vector],
        display: ['color'],
        columns: isColumns
      });
    }
  },

  annotateSets: function (dataset, isColumns, sets,
                          datasetMetadataName, setSourceFileName) {
    if (isColumns) {
      dataset = phantasus.DatasetUtil.transposedView(dataset);
    }
    var vector = dataset.getRowMetadata().getByName(datasetMetadataName);
    var idToIndices = phantasus.VectorUtil.createValueToIndicesMap(vector);
    var setVector = dataset.getRowMetadata().add(setSourceFileName);
    sets.forEach(function (set) {
      var name = set.name;
      var members = set.ids;
      members.forEach(function (id) {
        var indices = idToIndices.get(id);
        if (indices !== undefined) {
          for (var i = 0, nIndices = indices.length; i < nIndices; i++) {
            var array = setVector.getValue(indices[i]);
            if (array === undefined) {
              array = [];
            }
            array.push(name);
            setVector.setValue(indices[i], array);
          }
        }
      });
    });
    return setVector;
  },
  /**
   *
   * @param lines
   *            Lines of text in annotation file or null if a gmt file
   * @param dataset
   *            Current dataset
   * @param isColumns
   *            Whether annotating columns
   * @param sets
   *            Sets if a gmt file or null
   * @param metadataName
   *            The dataset metadata name to match on
   * @param fileColumnName
   *            The metadata file name to match on
   * @param fileColumnNamesToInclude
   *            An array of column names to include from the metadata file or
   *            null to include all
   * @param tranposed For text/Excel files only. If <code>true</code>, different annotations are on each row.
   */
  annotate: function (lines, dataset, isColumns, sets, metadataName,
                      fileColumnName, fileColumnNamesToInclude, transposed) {
    if (isColumns) {
      dataset = phantasus.DatasetUtil.transposedView(dataset);
    }
    var vector = dataset.getRowMetadata().getByName(metadataName);
    if (!vector) {
      throw new Error('vector ' + metadataName + ' not found.');
    }
    var fileColumnNamesToIncludeSet = null;
    if (fileColumnNamesToInclude) {
      fileColumnNamesToIncludeSet = new morpheus.Set();
      fileColumnNamesToInclude.forEach(function (name) {
        fileColumnNamesToIncludeSet.add(name);
      });
    }
    var vectors = [];
    var idToIndices = phantasus.VectorUtil.createValueToIndicesMap(vector);
    if (!lines) {
      _.each(
        sets,
        function (set) {
          var name = set.name;
          var members = set.ids;

          var v = dataset.getRowMetadata().add(name);
          vectors.push(v);
          _.each(
            members,
            function (id) {
              var indices = idToIndices.get(id);
              if (indices !== undefined) {
                for (var i = 0, nIndices = indices.length; i < nIndices; i++) {
                  v.setValue(
                    indices[i],
                    name);
                }
              }
            });
        });
    } else {
      var tab = /\t/;
      if (!transposed) {
        var header = lines[0].split(tab);
        var fileMatchOnColumnIndex = _.indexOf(header, fileColumnName);
        if (fileMatchOnColumnIndex === -1) {
          throw new Error(fileColumnName + ' not found in header:'
            + header);
        }
        var columnIndices = [];
        var nheaders = header.length;
        for (var j = 0; j < nheaders; j++) {
          var name = header[j];
          if (j === fileMatchOnColumnIndex) {
            continue;
          }
          if (fileColumnNamesToIncludeSet
            && !fileColumnNamesToIncludeSet.has(name)) {
            continue;
          }
          var v = dataset.getRowMetadata().getByName(name);
          if (!v) {
            v = dataset.getRowMetadata().add(name);
          }
          columnIndices.push(j);
          vectors.push(v);
        }
        var nheaders = columnIndices.length;
        for (var i = 1, nrows = lines.length; i < nrows; i++) {
          var line = lines[i].split(tab);
          var id = line[fileMatchOnColumnIndex];
          var indices = idToIndices.get(id);
          if (indices !== undefined) {
            var nIndices = indices.length;
            for (var j = 0; j < nheaders; j++) {
              var token = line[columnIndices[j]];
              var v = vectors[j];
              for (var r = 0; r < nIndices; r++) {
                v.setValue(indices[r], token);
              }
            }
          }
        }
      }
      else {
        // transposed
        var splitLines = [];
        var matchOnLine;
        for (var i = 0, nrows = lines.length; i < nrows; i++) {
          var line = lines[i].split(tab);
          var name = line[0];
          if (fileColumnName === name) {
            matchOnLine = line;
          } else {
            if (fileColumnNamesToIncludeSet
              && !fileColumnNamesToIncludeSet.has(name)) {
              continue;
            }
            splitLines.push(line);
            var v = dataset.getRowMetadata().getByName(name);
            if (!v) {
              v = dataset.getRowMetadata().add(name);
            }
            vectors.push(v);
          }
        }
        if (matchOnLine == null) {
          throw new Error(fileColumnName + ' not found in header.');
        }

        for (var fileColumnIndex = 1, ncols = matchOnLine.length; fileColumnIndex < ncols; fileColumnIndex++) {
          var id = matchOnLine[fileColumnIndex];
          var indices = idToIndices.get(id);
          if (indices !== undefined) {
            var nIndices = indices.length;
            for (var j = 0; j < splitLines.length; j++) {
              var token = splitLines[j][fileColumnIndex];
              var v = vectors[j];
              for (var r = 0; r < nIndices; r++) {
                v.setValue(indices[r], token);
              }
            }
          }

        }
      }
    }
    for (var i = 0; i < vectors.length; i++) {
      phantasus.VectorUtil.maybeConvertStringToNumber(vectors[i]);
    }
    return vectors;
  },
  // prompt for metadata field name in dataset
  promptSets: function (dataset, heatMap, isColumns, sets, setSourceFileName) {
    var promptTool = {};
    var _this = this;
    promptTool.execute = function (options) {
      var metadataName = options.input.dataset_field_name;
      var vector = _this.annotateSets(dataset, isColumns, sets,
        metadataName, setSourceFileName);

      heatMap.getProject().trigger('trackChanged', {
        vectors: [vector],
        display: ['text'],
        columns: isColumns
      });
    };
    promptTool.toString = function () {
      return 'Select Fields To Match On';
    };
    promptTool.gui = function () {
      return [
        {
          name: 'dataset_field_name',
          options: phantasus.MetadataUtil.getMetadataNames(
            isColumns ? dataset.getColumnMetadata() : dataset.getRowMetadata()),
          type: 'select',
          value: 'id',
          required: true
        }];

    };
    phantasus.HeatMap.showTool(promptTool, heatMap);

  },
  prompt: function (lines, dataset, heatMap, isColumns) {
    var promptTool = {};
    var _this = this;
    var header = lines != null ? lines[0].split('\t') : null;
    promptTool.execute = function (options) {
      var metadataName = options.input.dataset_field_name;
      var fileColumnName = options.input.file_field_name;
      var vectors = _this.annotate(lines, dataset, isColumns, null,
        metadataName, fileColumnName);

      var nameToIndex = new phantasus.Map();
      var display = [];
      for (var i = 0; i < vectors.length; i++) {
        display.push(isColumns ? 'color' : 'text');
        nameToIndex.set(vectors[i].getName(), i);
      }
      if (lines.colors) {
        var colorModel = isColumns
          ? heatMap.getProject().getColumnColorModel()
          : heatMap.getProject().getRowColorModel();
        lines.colors.forEach(function (item) {
          var index = nameToIndex.get(item.header);
          var vector = vectors[index];
          display[index] = 'color';
          colorModel.setMappedValue(vector, item.value, item.color);
        });
      }
      heatMap.getProject().trigger('trackChanged', {
        vectors: vectors,
        display: display,
        columns: isColumns
      });
    };
    promptTool.toString = function () {
      return 'Select Fields To Match On';
    };
    promptTool.gui = function () {
      var items = [
        {
          name: 'dataset_field_name',
          options: phantasus.MetadataUtil.getMetadataNames(
            isColumns ? dataset.getColumnMetadata() : dataset.getRowMetadata()),
          type: 'select',
          required: true
        }];
      if (lines) {
        items.push({
          name: 'file_field_name',
          type: 'select',
          options: _.map(header, function (item) {
            return {
              name: item,
              value: item
            };
          }),
          required: true
        });
      }
      return items;
    };
    phantasus.HeatMap.showTool(promptTool, heatMap);
  }
};

phantasus.DESeqTool = function () {

};

phantasus.DESeqTool.prototype = {
  toString: function () {
    return "DESeq2 (experimental)";
  },
  init: function (project, form) {
    var _this = this;
    var updateAB = function (fieldNames) {
      var ids = [];
      if (fieldNames != null) {
        var vectors = phantasus.MetadataUtil.getVectors(project
          .getFullDataset().getColumnMetadata(), fieldNames);
        var idToIndices = phantasus.VectorUtil
          .createValuesToIndicesMap(vectors);
        idToIndices.forEach(function (indices, id) {
          ids.push(id);
        });
      }
      ids.sort();
      form.setOptions("class_a", ids);
      form.setOptions("class_b", ids);
    };
    var $field = form.$form.find("[name=field]");
    $field.on("change", function (e) {
      updateAB($(this).val());
    });
    if ($field[0].options.length > 0) {
      $field.val($field[0].options[0].value);
    }
    updateAB($field.val());
  },
  gui: function (project) {
    var dataset = project.getFullDataset();

    if (_.size(project.getRowFilter().enabledFilters) > 0 || _.size(project.getColumnFilter().enabledFilters) > 0) {
      phantasus.FormBuilder.showInModal({
        title: 'Warning',
        html: 'Your dataset is filtered.<br/>' + this.toString() + ' will apply to unfiltered dataset. Consider using New Heat Map tool.',
        z: 10000
      });
    }

    var fields = phantasus.MetadataUtil.getMetadataNames(dataset
      .getColumnMetadata());
    return [{
      name: "field",
      options: fields,
      type: "select",
      multiple: true
    }, {
      name: "class_a",
      title: "Class A",
      options: [],
      value: "",
      type: "checkbox-list",
      multiple: true
    }, {
      name: "class_b",
      title: "Class B",
      options: [],
      value: "",
      type: "checkbox-list",
      multiple: true
    }];
  },
  execute: function (options) {
    var project = options.project;
    var field = options.input.field;
    var classA = options.input.class_a;
    var classB = options.input.class_b;
    var dataset = project.getFullDataset();
    var promise = $.Deferred();

    if (classA.length == 0 || classB.length == 0) {
      throw new Error("You must choose at least one option in each class");
    }

    // console.log(dataset);
    var v = dataset.getColumnMetadata().getByName("Comparison");
    if (v == null) {
      v = dataset.getColumnMetadata().add("Comparison");
    }
    var vs = [];
    field.forEach(function (name) {
      vs.push(dataset.getColumnMetadata().getByName(name));
    });

    var checkCortege = function (vectors, curClass, curColumn) {
      var columnInClass = false;
      var isEqual = true;
      for (j = 0; j < curClass.length; j += 1) {
        isEqual = true;
        for (var k = 0; k < vectors.length; k += 1) {
          isEqual &= vectors[k].getValue(curColumn) == curClass[j].array[k];
        }
        columnInClass |= isEqual;
      }
      return columnInClass;
    };
    for (var i = 0; i < dataset.getColumnCount(); i++) {
      var columnInA = checkCortege(vs, classA, i);
      var columnInB = checkCortege(vs, classB, i);
      if (columnInA && columnInB) {
        var warning = "Chosen classes have intersection in column " + i;
        promise.reject();
        throw new Error(warning);
      }
      v.setValue(i, columnInA ? "A" : (columnInB ? "B" : ""));
    }

    var vecArr = phantasus.VectorUtil.toArray(v);
    var count = _.countBy(vecArr);
    if (count['A'] === 1 || count['B'] === 1) {
      promise.reject();
      throw new Error('Chosen classes have only single sample');
    }

    project.trigger("trackChanged", {
      vectors: [v],
      display: ["color"],
      columns: true
    });

    var values = Array.apply(null, Array(project.getFullDataset().getColumnCount()))
      .map(String.prototype.valueOf, "");

    for (var j = 0; j < dataset.getColumnCount(); j++) {
      values[j] = v.getValue(j);
    }

    dataset.getESSession().then(function (essession) {
      var args = {
        es: essession,
        fieldValues: values
      };

      var req = ocpu.call("deseqAnalysis/print", args, function (session) {
        var r = new FileReader();
        var filePath = phantasus.Util.getFilePath(session, JSON.parse(session.txt)[0]);

        r.onload = function (e) {
          var contents = e.target.result;
          var ProtoBuf = dcodeIO.ProtoBuf;
          ProtoBuf.protoFromFile("./message.proto", function (error, success) {
            if (error) {
              alert(error);
            }
            var builder = success,
              rexp = builder.build("rexp"),
              REXP = rexp.REXP,
              rclass = REXP.RClass;
            var res = REXP.decode(contents);
            var data = phantasus.Util.getRexpData(res, rclass);
            var names = phantasus.Util.getFieldNames(res, rclass);
            var vs = [];

            names.forEach(function (name) {
              if (name !== "symbol") {
                var v = dataset.getRowMetadata().add(name);
                for (var i = 0; i < dataset.getRowCount(); i++) {
                  v.setValue(i, data[name].values[i]);
                }
                vs.push(v);
              }

            });

            dataset.setESSession(Promise.resolve(session));
            project.trigger("trackChanged", {
              vectors: vs,
              display: []
            });
            promise.resolve();
          })
        };
        phantasus.BlobFromPath.getFileObject(filePath, function (file) {
          r.readAsArrayBuffer(file);
        });
      }, false, "::es");
      req.fail(function () {
        promise.reject();
        throw new Error("Deseq call failed" + req.responseText);
      });
    });

    return promise;
  }
};

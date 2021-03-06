/**
 *
 *@implements {phantasus.MetadataModelInterface}
 */
phantasus.MetadataModelAdapter = function (model) {
  this.model = model;
};
phantasus.MetadataModelAdapter.prototype = {
  add: function (name) {
    return this.model.add(name);
  },
  getItemCount: function () {
    return this.model.getItemCount();
  },
  get: function (index) {
    return this.model.get(index);
  },
  remove: function (index) {
    return this.model.remove(index);
  },
  getByName: function (name) {
    return this.model.getByName(name);
  },
  getMetadataCount: function () {
    return this.model.getMetadataCount();
  }
};

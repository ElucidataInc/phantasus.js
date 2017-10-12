phantasus.DiscreteColorSchemeChooser = function (options) {
  var formBuilder = new phantasus.FormBuilder();
  var map = options.colorScheme.scale;
  var html = ['<select name="colorPicker" class="selectpicker" data-live-search="true">'];
  map.forEach(function (val, key) {
    html.push('<option');
    html.push(' value="');
    html.push(key);
    html.push('">');
    html.push(key);
    html.push('</option>');
  });
  html.push('</select>');
  formBuilder.append({
    name: 'selected_value',
    type: 'custom',
    value: html.join('')
  });
  var $select = formBuilder.$form.find('[name=colorPicker]');
  formBuilder.append({
    style: 'max-width:50px;',
    name: 'selected_color',
    type: 'color'
  });
  var selectedVal = $select.val();
  var _this = this;
  var $color = formBuilder.$form.find('[name=selected_color]');
  $color.val(map.get(selectedVal));
  $color.on('change', function (e) {
    var color = $(this).val();
    map.set(selectedVal, color);
    _this.trigger('change', {
      value: selectedVal,
      color: color
    });
  });
  $select.selectpicker().change(function () {
    // var optionIndex = sel.prop("selectedIndex");
    selectedVal = $select.val();
    var c = map.get(selectedVal);
    $color.val(c);
  });
  this.$div = formBuilder.$form;
};
phantasus.DiscreteColorSchemeChooser.prototype = {
  dispose: function () {
  }
};
phantasus.Util.extend(phantasus.DiscreteColorSchemeChooser, phantasus.Events);

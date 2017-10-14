describe('collapse_tool_test', function () {
  it('mean',
    function () {
      var heatmap = new phantasus.HeatMap({
        dataset: new phantasus.Dataset({
          array: [[1, 2], [3, 4], [5, 6], [7, 8]],
          rows: 4,
          columns: 2
        })
      });

      heatmap.getProject().getFullDataset().getRowMetadata()
      .add('id').array = ['a', 'b', 'a', 'a'];
      var newHeatMap = new phantasus.CollapseDatasetTool().execute({
        heatMap: heatmap,
        project: heatmap.getProject(),
        input: {
          collapse_method: 'Mean',
          collapse: 'Rows',
          collapse_to_fields: ['id']
        }
      });
      expect(newHeatMap.getProject().getFullDataset())
      .toBeDatasetValues(new phantasus.Dataset({
        array: [[13 / 3, 16 / 3], [3, 4]],
        rows: 2,
        columns: 2
      }), 0.00001);

    });
  it('median',
    function () {
      var heatmap = new phantasus.HeatMap({
        dataset: new phantasus.Dataset({
          array: [[1, 2], [3, 4], [5, 6], [7, 8]],
          rows: 4,
          columns: 2
        })
      });

      heatmap.getProject().getFullDataset().getRowMetadata()
      .add('id').array = ['a', 'b', 'a', 'a'];
      var newHeatMap = new phantasus.CollapseDatasetTool().execute({
        heatMap: heatmap,
        project: heatmap.getProject(),
        input: {
          collapse_method: 'Percentile',
          collapse: 'Rows',
          percentile: '50',
          collapse_to_fields: ['id']
        }
      });
      expect(newHeatMap.getProject().getFullDataset())
      .toBeDatasetValues(new phantasus.Dataset({
        array: [[5, 6], [3, 4]],
        rows: 2,
        columns: 2
      }), 0.00001);

    });

});

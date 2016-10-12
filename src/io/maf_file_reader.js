morpheus.MafFileReader = function () {
	this.geneFilter = null;
};
morpheus.MafFileReader.summarizeMutations = function (dataset) {
	var vector = dataset.getRowMetadata().add('mutation_summary');
	vector.getProperties().set(
		morpheus.VectorKeys.FIELDS,
		['Synonymous', 'In Frame Indel', 'Other Non-Synonymous',
			'Missense', 'Splice Site', 'Frame Shift', 'Nonsense']);
	vector.getProperties().set(morpheus.VectorKeys.DATA_TYPE, '[number]');

	// v.getProperties().set(morpheus.VectorKeys.RECOMPUTE_FUNCTION, true);
	// v.getProperties().set(morpheus.VectorKeys.FUNCTION, function (view) {
	// 	var bins = new Int32Array(7); // 1-7
	// 	for (var i = 0, size = view.size(); i < size; i++) {
	// 		var value = view.getValue(i);
	// 		if (value > 0) {
	// 			bins[value - 1]++;
	// 		}
	// 	}
	// 	return bins;
	// });
	// computing dynamically screws things up b/c summary is computed for other data types (e.g. CN)
	for (var i = 0, nrows = dataset.getRowCount(); i < nrows; i++) {
		var bins = new Int32Array(7); // 1-7
		for (var j = 0, ncols = dataset.getColumnCount(); j < ncols; j++) {
			var value = dataset.getValue(i, j);
			if (value > 0) {
				bins[value - 1]++;
			}
		}
		vector.setValue(i, bins);
	}
};

morpheus.MafFileReader.getField = function (fieldNames, fieldNameToIndex,
											options) {
	options = $.extend({}, {
		remove: true,
		lc: false
	}, options);
	var name;
	var index;

	for (var i = 0; i < fieldNames.length; i++) {
		name = fieldNames[i];
		if (options.lc) {
			var lc = name.toLowerCase();
			index = fieldNameToIndex[lc];
		} else {
			index = fieldNameToIndex[name];
		}
		if (index !== undefined) {
			break;
		}
	}
	if (index !== undefined && options.remove) {
		for (var i = 0; i < fieldNames.length; i++) {
			if (i !== index) {
				delete fieldNameToIndex[fieldNames[i]];
			}
		}

	}
	if (index !== undefined) {
		return {
			name: name,
			index: index
		};
	}
};

morpheus.MafFileReader.VARIANT_MAP = new morpheus.Map();
// silent
morpheus.MafFileReader.VARIANT_MAP.set('Silent', 1);
// in-frame indel
morpheus.MafFileReader.VARIANT_MAP.set('In_Frame_Del', 2);
morpheus.MafFileReader.VARIANT_MAP.set('In_Frame_Ins', 2);
// other
morpheus.MafFileReader.VARIANT_MAP.set('Translation_Start_Site', 3);
morpheus.MafFileReader.VARIANT_MAP.set('Nonstop_Mutation', 3);
morpheus.MafFileReader.VARIANT_MAP.set('3\'UTR', 3);
morpheus.MafFileReader.VARIANT_MAP.set('3\'Flank', 3);
morpheus.MafFileReader.VARIANT_MAP.set('5\'UTR', 3);
morpheus.MafFileReader.VARIANT_MAP.set('5\'Flank', 3);
morpheus.MafFileReader.VARIANT_MAP.set('IGR', 3);
morpheus.MafFileReader.VARIANT_MAP.set('Intron', 3);
morpheus.MafFileReader.VARIANT_MAP.set('RNA', 3);
morpheus.MafFileReader.VARIANT_MAP.set('Targeted_Region', 3);
morpheus.MafFileReader.VARIANT_MAP.set('Unknown', 3);
// mis-sense
morpheus.MafFileReader.VARIANT_MAP.set('Missense_Mutation', 4);
// splice site
morpheus.MafFileReader.VARIANT_MAP.set('Splice_Site', 5);
// frame shift indel
morpheus.MafFileReader.VARIANT_MAP.set('Frame_Shift_Del', 6);
morpheus.MafFileReader.VARIANT_MAP.set('Frame_Shift_Ins', 6);
// non-sense
morpheus.MafFileReader.VARIANT_MAP.set('Nonsense_Mutation', 7);
morpheus.MafFileReader.prototype = {
	setGeneFilter: function (geneFilter) {
		this.geneFilter = geneFilter;
	},
	getFormatName: function () {
		return 'maf';
	},
	_getGeneLevelDataset: function (datasetName, reader) {
		var _this = this;
		var tab = /\t/;
		var header = reader.readLine().split(tab);
		var headerToIndex = {};
		for (var i = 0, length = header.length; i < length; i++) {
			var name = header[i].toLowerCase();
			headerToIndex[name] = i;
		}
		// TODO six classes of base substitution—C>A, C>G, C>T, T>A, T>C, T>G
		// (all substitutions are referred to by the pyrimidine of the mutated
		// Watson–Crick base pair)
		var fields = ['Hugo_Symbol', 'Chromosome', 'Start_position',
			'Reference_Allele', 'Tumor_Seq_Allele2',
			'Variant_Classification', 'Protein_Change', 'ccf_hat',
			'tumor_f', 'i_tumor_f', 'Tumor_Sample_Barcode', 'tumor_name',
			'Tumor_Sample_UUID'];
		var fieldNameToIndex = {};

		for (var i = 0, length = fields.length; i < length; i++) {
			var index = headerToIndex[fields[i].toLowerCase()];
			if (index !== undefined) {
				fieldNameToIndex[fields[i].toLowerCase()] = index;
			}
		}
		var sampleField = morpheus.MafFileReader.getField([
				'Tumor_Sample_Barcode', 'tumor_name', 'Tumor_Sample_UUID'],
			fieldNameToIndex, {
				lc: true,
				remove: true
			});
		if (sampleField == null) {
			throw new Error('Sample id column not found.');
		}
		var sampleColumnName = sampleField.name;
		var sampleIdColumnIndex = sampleField.index;
		var tumorFractionField = morpheus.MafFileReader.getField(['ccf_hat',
			'tumor_f', 'i_tumor_f'], fieldNameToIndex, {
			lc: true,
			remove: true
		});
		var ccfColumnName;
		var ccfColumnIndex;
		if (tumorFractionField !== undefined) {
			ccfColumnName = tumorFractionField.name;
			ccfColumnIndex = tumorFractionField.index;
		}
		var chromosomeColumn = fieldNameToIndex['Chromosome'.toLowerCase()];
		var startPositionColumn = fieldNameToIndex['Start_position'
		.toLowerCase()];
		var refAlleleColumn = fieldNameToIndex['Reference_Allele'.toLowerCase()];
		var tumorAllelColumn = fieldNameToIndex['Tumor_Seq_Allele2'
		.toLowerCase()];
		var proteinChangeColumn = fieldNameToIndex['Protein_Change'
		.toLowerCase()];
		var geneSymbolColumn = fieldNameToIndex['Hugo_Symbol'.toLowerCase()];
		if (geneSymbolColumn == null) {
			throw new Error('Gene symbol column not found.');
		}
		var variantColumnIndex = headerToIndex['Variant_Classification'
		.toLowerCase()];
		if (variantColumnIndex === undefined) {
			throw new Error('Variant_Classification not found');
		}
		// keep fields that are in file only
		fields = [];
		var geneFields = [];
		for (var key in fieldNameToIndex) {
			if (key !== sampleColumnName && key !== ccfColumnName) {
				geneFields.push(key);
			}
			fields.push(key);
		}
		var geneColumnIndices = geneFields.map(function (field) {
			return fieldNameToIndex[field];
		});
		var nGeneFields = geneColumnIndices.length;
		var geneSymbolToIndex = new morpheus.Map();
		var sampleIdToIndex = new morpheus.Map();
		var variantMatrix = [];
		var ccfMatrix = [];
		var s;
		while ((s = reader.readLine()) !== null) {
			var tokens = s.split(tab);
			var sample = String(tokens[sampleIdColumnIndex]);
			var columnIndex = sampleIdToIndex.get(sample);
			if (columnIndex === undefined) {
				columnIndex = sampleIdToIndex.size();
				sampleIdToIndex.set(sample, columnIndex);
			}
			var gene = String(tokens[geneSymbolColumn]);
			if (gene === 'Unknown') {
				continue;
			}
			if (this.geneFilter == null
				|| this.geneFilter.has(tokens[geneSymbolColumn])) {
				var rowIndex = geneSymbolToIndex.get(gene);
				if (rowIndex === undefined) {
					rowIndex = geneSymbolToIndex.size();
					geneSymbolToIndex.set(gene, rowIndex);
				}
				var value = String(tokens[variantColumnIndex]);
				var variantCode = morpheus.MafFileReader.VARIANT_MAP.get(value);
				if (variantCode === undefined) {
					variantCode = 3;
				}
				var variantObject = {};
				var Protein_Change = tokens[proteinChangeColumn];
				if (Protein_Change) {
					variantObject.Protein = String(Protein_Change);
				}
				variantObject.__v = variantCode;
				variantObject.Variant = value;
				variantObject.Mutation = String(tokens[chromosomeColumn]) + ':'
					+ String(tokens[startPositionColumn]) + ' '
					+ String(tokens[refAlleleColumn]) + ' > '
					+ String(tokens[tumorAllelColumn]);
				var wrappedVariant = morpheus.Util.wrapNumber(variantCode,
					variantObject);
				var variantRow = variantMatrix[rowIndex];
				if (variantRow === undefined) {
					variantRow = [];
					variantMatrix[rowIndex] = variantRow;
				}
				var ccf = -1;
				var priorCcf = -1;
				if (ccfColumnIndex !== undefined) {
					var ccfRow = ccfMatrix[rowIndex];
					if (ccfRow === undefined) {
						ccfRow = [];
						ccfMatrix[rowIndex] = ccfRow;
					}
					ccf = parseFloat(tokens[ccfColumnIndex]);
					priorCcf = ccfRow[columnIndex] || -1;
				}
				var priorValue = variantRow[columnIndex] || -1;
				if (variantCode > priorValue) { // take most severe mutation
					variantRow[columnIndex] = wrappedVariant;
					if (ccfColumnIndex !== undefined) {
						ccfRow[columnIndex] = ccf;
					}
				} else if (variantCode === priorValue && ccf > priorCcf) {
					variantRow[columnIndex] = wrappedVariant;
					ccfRow[columnIndex] = ccf;
				}
			}
		}
		var dataset = new morpheus.Dataset({
			name: datasetName,
			array: variantMatrix,
			dataType: 'object',
			rows: geneSymbolToIndex.size(),
			columns: sampleIdToIndex.size()
		});
		var columnIds = dataset.getColumnMetadata().add('id');
		sampleIdToIndex.forEach(function (index, id) {
			columnIds.setValue(index, id);
		});
		var rowIds = dataset.getRowMetadata().add('id');
		geneSymbolToIndex.forEach(function (index, id) {
			rowIds.setValue(index, id);
		});
		for (var i = 0, nrows = dataset.getRowCount(), ncols = dataset
		.getColumnCount(); i < nrows; i++) {
			for (var j = 0; j < ncols; j++) {
				if (variantMatrix[i][j] === undefined) {
					variantMatrix[i][j] = 0;
				}
			}
		}
		if (ccfColumnIndex !== undefined) {
			dataset.addSeries({
				dataType: 'object',
				name: 'allelic_fraction',
				array: ccfMatrix
			});
		}
		if (this.geneFilter) {
			var orderVector = dataset.getRowMetadata().add('order');
			for (var i = 0, size = orderVector.size(); i < size; i++) {
				var gene = rowIds.getValue(i);
				var order = this.geneFilter.get(gene);
				orderVector.setValue(i, order);
			}
			var project = new morpheus.Project(dataset);
			project.setRowSortKeys([new morpheus.SortKey('order',
				morpheus.SortKey.SortOrder.ASCENDING)], true); // sort
			// collapsed
			// dataset
			var tmp = project.getSortedFilteredDataset();
			project = new morpheus.Project(tmp);
			var columnIndices = morpheus.Util.seq(tmp.getColumnCount());
			columnIndices
			.sort(function (a, b) {
				for (var i = 0, nrows = tmp.getRowCount(); i < nrows; i++) {
					for (var seriesIndex = 0, nseries = tmp
					.getSeriesCount(); seriesIndex < nseries; seriesIndex++) {
						var f1 = tmp.getValue(i, a, seriesIndex);
						if (isNaN(f1)) {
							f1 = Number.NEGATIVE_INFINITY;
						}
						f1 = f1.valueOf();
						var f2 = tmp.getValue(i, b, seriesIndex);
						if (isNaN(f2)) {
							f2 = Number.NEGATIVE_INFINITY;
						}
						f2 = f2.valueOf();
						var returnVal = (f1 === f2 ? 0 : (f1 < f2 ? 1
							: -1));
						if (returnVal !== 0) {
							return returnVal;
						}
					}
				}
				return 0;
			});
			dataset = new morpheus.SlicedDatasetView(dataset, null,
				columnIndices);
		}
		morpheus.MafFileReader.summarizeMutations(dataset);
		morpheus.MafFileReader
		.summarizeMutations(new morpheus.TransposedDatasetView(dataset));
		return dataset;
	},
	read: function (fileOrUrl, callback) {
		var _this = this;
		var name = morpheus.Util.getBaseFileName(morpheus.Util
		.getFileName(fileOrUrl));
		morpheus.ArrayBufferReader.getArrayBuffer(fileOrUrl, function (err,
																	arrayBuffer) {
			if (err) {
				callback(err);
			} else {
				try {
					callback(null, _this._getGeneLevelDataset(name,
						new morpheus.ArrayBufferReader(new Uint8Array(
							arrayBuffer))));
				} catch (err) {
					callback(err);
				}
			}
		});

	}
};

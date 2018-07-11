// https://developers.google.com/analytics/devguides/reporting/core/v4/rest/v4/reports/batchGet
// https://developers.google.com/analytics/devguides/reporting/core/dimsmets

var defaultRequest = {
	viewId: null,
	dateRanges: [],
	metrics: [],
	dimensions: [],
	orderBys: [],
	dimensionFilterClauses: [],
	metricFilterClauses: [],
	filtersExpression: null,
	hideTotals: true,
	hideValueRanges: true,
	pageSize: 10,
	pageToken: "0"
};

var RequestBuilder = function() {
	this.request = defaultRequest;
};

RequestBuilder.prototype.reset = function() {
	this.request = defaultRequest;
	return this;
};

RequestBuilder.prototype.setView = function(view) {
	this.request.viewId = `ga:${view}`;
	return this;
};

RequestBuilder.prototype.showTotals = function() {
	this.request.hideTotals = false;
	return this;
};

RequestBuilder.prototype.showValueRanges = function() {
	this.request.hideValueRanges = false;
	return this;
};

RequestBuilder.prototype.setPageSize = function(size) {
	this.request.pageSize = size;
	return this;
};

RequestBuilder.prototype.setPageToken = function(token) {
	this.request.pageToken = token;
	return this;
};

RequestBuilder.prototype.make = function() {
	return JSON.parse(JSON.stringify(this.request));
};

RequestBuilder.prototype.setFastSampling = function() {
	this.request.samplingLevel = "SMALL";
	return this;
};

RequestBuilder.prototype.setPreciseSample = function() {
	this.request.samplingLevel = "LARGE";
	return this;
};

RequestBuilder.prototype.addDate = function(params) {
	var dateRange = {};
	if (params.from) {
		dateRange.startDate = params.from;
	}
	if (params.to) {
		dateRange.endDate = params.to;
	}
	this.request.dateRanges.push(dateRange);
	return this;
};

RequestBuilder.prototype.addDimension = function(dimension, histogramBuckets) {
	var obj = { name: `ga:${dimension}` };
	if (histogramBuckets) {
		obj.histogramBuckets = histogramBuckets.forEach(function(bucket) {
			return bucket.toString();
		});
	}
	this.request.dimensions.push(obj);
	return this;
};

RequestBuilder.prototype.addDimensions = function(dimensions) {
	dimensions.forEach(
		function(dimension) {
			this.addDimension(dimension);
		}.bind(this)
	);
	return this;
};

RequestBuilder.prototype.clearDimensions = function() {
	this.request.dimensions = [];
	return this;
};

RequestBuilder.prototype.addMetric = function(metric, type) {
	this.request.metrics.push({
		expression: `ga:${metric}`,
		formattingType: type ? type : "INTEGER"
	});
	return this;
};

RequestBuilder.prototype.addMetrics = function(metrics) {
	metrics.forEach(
		function(metric) {
			this.addMetric(metric);
		}.bind(this)
	);
	return this;
};

RequestBuilder.prototype.removeDimension = function(name) {
	this.request.dimensions = this.request.dimensions.filter(function(dimension) {
		return dimension.name !== `ga:${name}`;
	});
	return this;
};

RequestBuilder.prototype.removeDimensions = function(dimensions) {
	dimensions.forEach(
		function(name) {
			this.removeDimension(name);
		}.bind(this)
	);
	return this;
};

RequestBuilder.prototype.addMetricInt = function(metric) {
	return this.addMetric(metric, "INTEGER");
};

RequestBuilder.prototype.addMetricFloat = function(metric) {
	return this.addMetric(metric, "FLOAT");
};

RequestBuilder.prototype.addMetricCurrency = function(metric) {
	return this.addMetric(metric, "CURRENCY");
};

RequestBuilder.prototype.addMetricPercent = function(metric) {
	return this.addMetric(metric, "PERCENT");
};

RequestBuilder.prototype.addMetricTime = function(metric) {
	return this.addMetric(metric, "TIME");
};

RequestBuilder.prototype.clearMetrics = function() {
	this.request.metrics = [];
	return this;
};

RequestBuilder.prototype.removeMetric = function(name) {
	this.request.metrics = this.request.metrics.filter(function(metric) {
		return metric.expression !== `ga:${name}`;
	});
	return this;
};

RequestBuilder.prototype.removeMetrics = function(metrics) {
	metrics.forEach(
		function(name) {
			this.removeMetric(name);
		}.bind(this)
	);
	return this;
};

RequestBuilder.prototype.setFiltersExpression = function(expression) {
	this.request.filtersExpression = expression;
	return this;
};

RequestBuilder.prototype.clearFiltersExpression = function() {
	this.request.filtersExpression = null;
	return this;
};

RequestBuilder.prototype.orderBy = function(params) {
	this.request.orderBys.push({
		fieldName: `ga:${params.name}`,
		orderType: params.type ? params.type : "VALUE",
		sortOrder: params.order ? params.order : "DESCENDING"
	});
	return this;
};

RequestBuilder.prototype.orderAsc = function(name) {
	return this.orderBy({
		name: name,
		order: "ASCENDING"
	});
};

RequestBuilder.prototype.orderDesc = function(name) {
	return this.orderBy({
		name: name
	});
};

RequestBuilder.prototype.orderHistogram = function(name) {
	return this.orderBy({
		name: name,
		type: "HISTOGRAM_BUCKET"
	});
};

RequestBuilder.prototype.addMetricOrFilters = function(filters) {
	return this.addFilters("metricFilterClauses", filters, "OR");
};

RequestBuilder.prototype.addMetricFilters = function(
	filters,
	operator = "AND"
) {
	return this.addFilters("metricFilterClauses", filters);
};

RequestBuilder.prototype.addMetricFilter = function(filter) {
	return this.addFilter("metricFilterClauses", filter);
};

RequestBuilder.prototype.addDimensionOrFilters = function(filters) {
	return this.addFilters("dimensionFilterClauses", filters, "OR");
};

RequestBuilder.prototype.addDimensionFilters = function(
	filters,
	operator = "AND"
) {
	return this.addFilters("dimensionFilterClauses", filters);
};

RequestBuilder.prototype.addDimensionFilter = function(filter) {
	return this.addFilter("dimensionFilterClauses", filter);
};

RequestBuilder.prototype.addFilters = function(
	type,
	filters,
	operator = "AND"
) {
	this.request[type].push({
		operator,
		filters: filters.map(function(filter) {
			return filter.make();
		})
	});

	return this;
};

RequestBuilder.prototype.addFilter = function(type, filter) {
	this.request[type].push({
		operator: "AND",
		filters: [filter.make()]
	});

	return this;
};

module.exports = RequestBuilder;

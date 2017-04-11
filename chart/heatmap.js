export const HeatmapParameter = {
  'plotBorderWidth': { valueType: 'int', defaultValue: 1, description: 'border width of plot', },
  'seriesBorderWidth': { valueType: 'int', defaultValue: 1, description: 'border width of series', },
  'yAxisGridLineWidth': { valueType: 'int', defaultValue: 1, description: 'width of yAxis grid line', },
  'colorAxisStops': { valueType: 'JSON', defaultValue: '', description: 'colorAxis.stops', widget: 'textarea', },
  'useColorAxisMax': { valueType: 'boolean', defaultValue: false, description: 'use colorAxis.max', widget: 'checkbox', },
  'colorAxisMaxValue': { valueType: 'int', defaultValue: 1, description: 'colorAxis.max', },
  'useColorAxisMin': { valueType: 'boolean', defaultValue: false, description: 'use colorAxis.min', widget: 'checkbox', },
  'colorAxisMinValue': { valueType: 'int', defaultValue: 0, description: 'colorAxis.min', },
  'colorAxisMaxColor': { valueType: 'string', defaultValue: '#7cb5ec', description: 'max color of color axis', },
  'colorAxisMinColor': { valueType: 'string', defaultValue: '#FFFFFF', description: 'min color of color axis', },
  'seriesBorderColor': { valueType: 'string', defaultValue: 'rgb(124, 181, 236)', description: 'border color of series', },
  'floatingLegend': { valueType: 'string', defaultValue: 'default', description: 'floating legend', widget: 'option', optionValues: [ 'default', 'top-right', 'top-left', ], },
  'rotateXAxisLabel': { valueType: 'int', defaultValue: -45, description: 'rotate xAxis labels', },
  'rotateYAxisLabel': { valueType: 'int', defaultValue: 0, description: 'rotate yAxis labels', },
  'tooltipPrecision': { valueType: 'string', defaultValue: '.1f', description: 'precision of tooltip format without <code>:</code> (<a href="http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting">doc</a>)', },
  'legendLabelFormat': { valueType: 'string', defaultValue: '', description: 'text format of legend (<a href="http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting">doc</a>)', },
  'xAxisPosition': { valueType: 'string', defaultValue: 'bottom', description: 'xAxis position', widget: 'option', optionValues: [ 'bottom', 'top', ], },
  'yAxisPosition': { valueType: 'string', defaultValue: 'left', description: 'yAxis position', widget: 'option', optionValues: [ 'left', 'right', ], },
  'showDataLabel': { valueType: 'boolean', defaultValue: true, description: 'show data label', widget: 'checkbox', },
  'showLegend': { valueType: 'boolean', defaultValue: true, description: 'show legend', widget: 'checkbox', },
  'legendPosition': { valueType: 'string', defaultValue: 'bottom', description: 'position of legend', widget: 'option', optionValues: [ 'bottom', 'top', 'left', 'right', ], },
  'legendLayout': { valueType: 'string', defaultValue: 'horizontal', description: 'layout of legend', widget: 'option', optionValues: [ 'vertical', 'horizontal', ], },
  'legendAlign': { valueType: 'string', defaultValue: 'center', description: 'layout of legend', widget: 'option', optionValues: [ 'center', 'right', 'left', ] },
  'subTitle': { valueType: 'string', defaultValue: '', description: 'sub title of chart', },
  'mainTitle': { valueType: 'string', defaultValue: '', description: 'main title of chart', },
  'xAxisUnit': { valueType: 'string', defaultValue: '', description: 'unit of xAxis', },
  'yAxisUnit': { valueType: 'string', defaultValue: '', description: 'unit of yAxis', },
  'zAxisUnit': { valueType: 'string', defaultValue: '', description: 'unit of zAxis', },
  'xAxisName': { valueType: 'string', defaultValue: '', description: 'name of xAxis', },
  'yAxisName': { valueType: 'string', defaultValue: '', description: 'name of yAxis', },
}

export function getPrecisionFormat(precision, prefix) {
  return (precision === '') ? `{${prefix}:.1f}` : `{${prefix}:${precision}}`
}

export function createHeatmapChartDataStructure(rows,
                                                key1NameWithIndex, key2NameWithIndex,
                                                selectors, parameter) {
  const { showDataLabel, seriesBorderColor, seriesBorderWidth, } = parameter

  const series = []

  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i]
    const s = {
      name: selector, data: [],
      borderWidth: seriesBorderWidth,
      borderColor: seriesBorderColor,
      dataLabels: { enabled: showDataLabel, color: '#000000' },
    }

    const selectorRows = rows[i].value
    for (let j = 0; j < selectorRows.length; j++) {
      const r = selectorRows[j]

      try {
        const xValueIndex = key1NameWithIndex[r.key1]
        const yValueIndex = key2NameWithIndex[r.key2]
        const zValue = (typeof r.aggregated !== 'number') ? parseFloat(r.aggregated) : r.aggregated

        if (typeof xValueIndex !== 'undefined' && typeof yValueIndex !== 'undefined') {
          s.data.push([xValueIndex, yValueIndex, zValue])
        }

      } catch (error) {
        /** ignore parsing error */
      }
    }

    series.push(s)
  }


  return series
}

export function createHeatmapChartOption(Highcharts, data, parameter, key1Names, key2Names) {
  const {
    xAxisName, yAxisName, xAxisUnit, yAxisUnit, zAxisUnit,
    xAxisPosition, yAxisPosition,
    legendPosition, legendLayout, legendAlign, rotateXAxisLabel, rotateYAxisLabel,
    showLegend, legendLabelFormat, floatingLegend,
    tooltipPrecision, colorAxisMaxColor, colorAxisMinColor,
    useColorAxisMin, colorAxisMinValue, useColorAxisMax, colorAxisMaxValue,
    colorAxisStops,
    mainTitle, subTitle, plotBorderWidth,
    yAxisGridLineWidth,
  } = parameter

  // TODO alertType: greaterThan, equal, lessThan

  const option = {
    chart: { type: 'heatmap', plotBorderWidth: plotBorderWidth, },
    title: { text: ' ', },
    xAxis: {
      labels: { rotation: rotateXAxisLabel, },
      categories: key1Names,
    },
    yAxis: {
      labels: { rotation: rotateYAxisLabel, },
      categories: key2Names,
      gridLineWidth: yAxisGridLineWidth,
    },
    colorAxis: { minColor: colorAxisMinColor, maxColor: colorAxisMaxColor, },
    labels: {},
    legend: {
      enabled: showLegend, labelFormat: '{name}',
      verticalAlign: legendPosition, layout: legendLayout, align: legendAlign,
    },
    tooltip: {
      pointFormatter: function() {
        let zValue = parseNumberUsingHighchartPrecision(Highcharts, tooltipPrecision, this.value)

        return `
              x: <b>${this.series.xAxis.categories[this.x]}</b> ${xAxisUnit}
              <br>
              y: <b>${this.series.yAxis.categories[this.y]}</b> ${yAxisUnit}
              <br>
              z: <b>${zValue}</b> ${zAxisUnit}
            `
      },
    },
    series: data,
  }

  if (mainTitle !== '') { option.title.text = mainTitle  }
  if (subTitle !== '') { option.subtitle = { text: subTitle, } }
  if (xAxisName !== '') { option.xAxis.title = { text: xAxisName, } }
  if (yAxisName !== '') { option.yAxis.title = { text: yAxisName, } }
  if (xAxisPosition === 'top') { option.xAxis.opposite = true }
  if (yAxisPosition === 'right') { option.yAxis.opposite = true }
  if (legendLabelFormat !== '') { option.legend.labelFormat = legendLabelFormat }
  if (floatingLegend !== 'default') {
    option.legend.x = -30
    option.legend.y = 25
    option.legend.verticalAlign = 'top'
    option.legend.floating = true
    option.legend.backgroundColor = 'white'
    option.legend.borderColor = '#CCC'
    option.legend.borderWidth = 1
    option.legend.shadow = false

    if (floatingLegend === 'top-right') {
      option.legend.align = 'right'; option.legend.x = -30; option.legend.y = 25
    } else {
      option.legend.align = 'left'; option.legend.x = +50; option.legend.y = 25
    }
  }

  if (useColorAxisMin) { option.colorAxis.min = colorAxisMinValue }
  if (useColorAxisMax) { option.colorAxis.min = colorAxisMaxValue }
  if (colorAxisStops !== '' && Array.isArray(colorAxisStops)) {
    option.colorAxis.stops = colorAxisStops
  }

  if (legendLayout === 'horizontal') {
    option.legend.symbolWidth = 480
  }

  return option
}

export function parseNumberUsingHighchartPrecision(Highcharts, precision, value) {
  try {
    if (precision !== '' &&
      precision.startsWith('.') &&
      precision.endsWith('f')) {
      precision = precision.slice(1, -1)
    }

    if (typeof precision !== 'number') {
      precision = Number.parseInt(precision)
    }
  } catch (error) { /** ignore precision parsing error */ }
  return Highcharts.numberFormat(Math.abs(value), precision, '.', '')
}


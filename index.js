import Visualization from 'zeppelin-vis'
import AdvancedTransformation from 'zeppelin-tabledata/advanced-transformation'

import Highcharts from 'highcharts/highcharts'
require('highcharts/modules/heatmap')(Highcharts);
require('highcharts/modules/data')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)

import { HeatmapParameter, createHeatmapChartDataStructure, createHeatmapChartOption, } from './chart/heatmap'

export default class Chart extends Visualization {
  constructor(targetEl, config) {
    super(targetEl, config)

    const spec = {
      charts: {
        'heatmap': {
          transform: { method: 'array:2-key', },
          sharedAxis: false,
          axis: {
            'xAxis': { dimension: 'multiple', axisType: 'key', minAxisCount: 1, description: 'categorical', },
            'yAxis': { dimension: 'multiple', axisType: 'key', minAxisCount: 1, description: 'categorical', },
            'zAxis': { dimension: 'single', axisType: 'aggregator', minAxisCount: 1, description: 'numeric', },
          },
          parameter: HeatmapParameter,
        },

      },
    }

    this.transformation = new AdvancedTransformation(config, spec)
  }

  getChartElementId() {
    return this.targetEl[0].id
  }

  refresh() {
    try {
      this.chartInstance && this.chartInstance.setSize(this.targetEl.width())
    } catch (e) {
      console.warn(e)
    }
  }

  getChartElement() {
    return document.getElementById(this.getChartElementId())
  }

  clearChart() {
    if (this.chartInstance) { this.chartInstance.destroy() }
  }

  hideChart() {
    this.clearChart()
    this.getChartElement().innerHTML = `
        <div style="margin-top: 60px; text-align: center; font-weight: 100">
            <span style="font-size:30px;">
                Please set axes in
            </span>
            <span style="font-size: 30px; font-style:italic;">
                Settings
            </span>
        </div>`
  }

  showError(error) {
    this.clearChart()
    this.getChartElement().innerHTML = `
        <div style="margin-top: 60px; text-align: center; font-weight: 300">
            <span style="font-size:30px; color: #e4573c;">
                ${error.message} 
            </span>
        </div>`
  }

  drawHeatmapChart(parameter, column, transformer) {
    if (column.aggregator.length === 0 || column.key.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const { rows, selectors, key1Names, key2Names,
      key1NameWithIndex, key2NameWithIndex } = transformer()

    const data = createHeatmapChartDataStructure(rows, key1NameWithIndex, key2NameWithIndex,
      selectors, parameter)
    const chartOption = createHeatmapChartOption(Highcharts, data, parameter, key1Names, key2Names)

    this.chartInstance = Highcharts.chart(this.getChartElementId(), chartOption)
  }

  drawTreeChart(parameter, column, transformer) {
    if (column.aggregator.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const { rows, selectors, key1Names, key2Names,
      key1NameWithIndex, key2NameWithIndex } = transformer()

    const data = createTreeChartDataStructure(rows, selectors)
    const chartOption = createTreeChartOption(Highcharts, data, parameter)

    this.chartInstance = Highcharts.chart(this.getChartElementId(), chartOption)
  }

  render(data) {
    const {
      chartChanged, parameterChanged,
      chart, parameter, column, transformer,
    } = data

    if (!chartChanged && !parameterChanged) { return }

    try {
      if (chart === 'heatmap') {
        this.drawHeatmapChart(parameter, column, transformer)
      }
    } catch (error) {
      console.error(error)
      this.showError(error)
    }
  }

  getTransformation() {
    return this.transformation
  }
}



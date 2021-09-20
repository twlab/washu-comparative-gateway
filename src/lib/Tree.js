import * as d3 from 'd3';
import '../css/tree2.css';
import {toast} from '@zerodevx/svelte-toast'

class TreeComponent {

  /**
   * @param {Object} _config
   * @param {Array} _data
   * @param {any} _dispatcher
   */
  constructor(_config, _dispatcher, _data) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 260,
      containerHeight: _config.containerHeight || 300,
      margin: _config.margin || {
        top: 25,
        right: 20,
        bottom: 20,
        left: 60
      },
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.dispatcher = _dispatcher;
    this.data = _data;
    this.filterTargets = [];
    this.source = undefined;
    this.initVis();
    this.handleClick = function (e) {
      console.log(e);
    }
  }

  /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis
      .svg
      .append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    // Append axis title
    /*
    vis
      .svg
      .append('text')
      .attr('class', 'axis-title')
      .attr('x', 20)
      .attr('y', 10)
      .attr('dy', '.71em')
      .text('Washu Comparative Browser');*/

  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis(_filterTargets, _source) {
    let vis = this;
    vis.filterTargets = _filterTargets || []
    vis.source = _source;
    console.log(vis.source)
    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  async renderVis() {
    let vis = this;
    const {height, width} = vis;

    // x-scale and x-axis
    var experienceName = [
      "",
      "",
      "",
      "",
      "",
      ""
    ];
    var formatSkillPoints = function (d) {
      return experienceName[d % 6];
    }
    var xScale = d3
      .scaleLinear()
      .domain([0, 28000])
      .range([0, 280]);

    var xAxis = d3
      .axisTop()
      .scale(xScale)
      .ticks(5)
      .tickFormat(formatSkillPoints);

    // Setting up a way to handle the data
    var tree = d3.cluster() // This D3 API method setup the Dendrogram datum position.
      .size([
      height, width - 460
    ]) // Total width - bar chart width = Dendrogram chart width
      .separation(function separate(a, b) {
        return a.parent == b.parent // 2 levels tree grouping for category || a.parent.parent == b.parent || a.parent == b.parent.parent
          ? 0.4
          : 0.8;
      });

    var stratify = d3.stratify() // This D3 API method gives cvs file flat data array dimensions.
      .parentId(function (d) {
        return d
          .id
          .substring(0, d.id.lastIndexOf("."));
      });

    const res = await d3.csv("data/organisms.csv");

    const data = res.map(d => {
      return {
        id: d.id,
        value: + d.value,
        color: d.color
      };
    })

    if (vis.filterTargets.length > 0) {
      // vis   .chart   .remove();
    }
    var root = stratify(data);
    tree(root);
    // Draw every datum a line connecting to its parent.
    var link = vis
      .chart
      .selectAll(".link")
      .data(root.descendants().slice(1))
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", function (d) {
        return "M" + d.y + "," + d.x + "C" + (d.parent.y + 100) + "," + d.x + " " + (d.parent.y + 100) + "," + d.parent.x + " " + d.parent.y + "," + d.parent.x;
      });

    // Setup position for every datum; Applying different css classes to parents and
    // leafs.
    var node = vis
      .chart
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", function (d) {
        return "node" + (d.children
          ? " node--internal"
          : " node--leaf");
      })
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    // Draw every datum a small circle.
    node
      .append("circle")
      .attr("r", 4);

    // Setup G for every leaf datum.
    var leafNodeG = vis
      .chart
      .selectAll(".node--leaf")
      .append("g")
      .attr("class", "node--leaf-g")
      .attr("transform", "translate(" + 8 + "," + -13 + ")");

    leafNodeG
      .append("rect")
      .attr("class", "shadow")
      .style("fill", function (d) {
        const name = d
          .data
          .id
          .substring(d.data.id.lastIndexOf(".") + 1);

        if (vis.source === name) {
          return "#d7e100";
        }
        if (vis.filterTargets.includes(name)) {
          return d.data.color;
        } else {
          return "#d3d3d3"
        }
      })
      .attr("width", 2)
      .attr("height", 30)
      .attr("rx", 2)
      .attr("ry", 2)
      .transition()
      .duration(800)
      .attr("width", function (d) {
        return xScale(d.data.value);
      });

    leafNodeG
      .append("text")
      .attr("dy", 19.5)
      .attr("x", 8)
      .style("text-anchor", "start")
      .text(function (d) {
        return d
          .data
          .id
          .substring(d.data.id.lastIndexOf(".") + 1);
      });

    // Write down text for every parent datum
    var internalNode = vis
      .chart
      .selectAll(".node--internal");
    /*

    var ballG = vis
      .svg
      .insert("g")
      .attr("class", "ballG")
      .attr("transform", "translate(" + 1100 + "," + height / 2 + ")");
    ballG
      .insert("circle")
      .attr("class", "shadow")
      .style("fill", "steelblue")
      .attr("r", 8);

    ballG
      .insert("text")
      .style("text-anchor", "middle")
      .attr("dy", 8)
    // .text("0.0"); Animation functions for mouse on and off events.
    d3
      .selectAll(".node--leaf-g")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
      */

    d3
      .selectAll(".node--leaf-g")
      .on("click", function (event, d) {
        const {id} = d.data;
        const idElements = id.split('.');
        const genomeName = idElements[idElements.length - 1];
        console.log(vis.source, genomeName)
        if (vis.source === genomeName || vis.source === undefined || vis.filterTargets.includes(genomeName)) {
          vis
            .dispatcher
            .call('filterCategories', event, d);
        } else {
          toast.push('Not a valid combination')
        }
      })

    function handleMouseOver(event, d) {
      var leafG = d3.select(this);

      leafG
        .select("rect")
        .attr("stroke", "#4D4D4D")
        .attr("stroke-width", "2");

      var ballGMovement = ballG
        .transition()
        .duration(400)
        .attr("transform", "translate(" + (d.y + xScale(d.data.value) + 90) + "," + (d.x + 1.5) + ")");

      ballGMovement.select("circle")
      // .style("fill", d.data.color)
        .style("fill", '#FFC0CB')
        .attr("r", 18)

      ballGMovement
        .select("text")
        .delay(300)
        .text("+")
        .attr('font-size', 24)
      // .text(Number(d.data.value).toFixed(1));

    }
    function handleMouseOut() {
      var leafG = d3.select(this);

      leafG
        .select("rect")
        .attr("stroke-width", "0");
    }
  }
}

export default TreeComponent;
import * as d3 from 'd3';
class ArcComponent {

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
    vis
      .svg
      .append('text')
      .attr('class', 'axis-title')
      .attr('x', 20)
      .attr('y', 10)
      .attr('dy', '.71em')
    // .text('Select two organisms');

  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    let vis = this;
    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;
    console.log(this)
    // List of node names
    const allNodes = vis
      .data
      .nodes
      .map(function (d) {
        return d.name;
      });
    // console.log(allNodes) A linear scale to position the nodes on the X axis
    const x = d3
      .scalePoint()
      .range([0, vis.width])
      .domain(allNodes);

    let nodeBase = vis
      .chart
      .selectAll("g.node")
      .data(vis.data.nodes, function (d) {
        return d.name;
      })

    var nodeEnter = nodeBase
      .enter()
      .append("svg:g")
      .attr("class", "node")

    let node = nodeEnter
      .append('circle')
      .attr('cx', function (d) {
        console.log(d)
        return x(d.name);
      })
      .attr('cy', vis.height - 30)
      .attr('r', 10)
      .style('fill', '#999')
      // .attr("fill", function (d) {   return "url(#image" + d.name + ")" })
      .on('mouseover', function (event, d) {
        node.style('fill', null);
        d3
          .select(this)
          .style('fill', 'black')
          .attr('r', 15);
        var nodesToHighlight = vis
          .data
          .links
          .map(function (e) {
            return e.source === d.id
              ? e.target
              : e.target === d.id
                ? e.source
                : 0;
          })
          .filter(function (d) {
            return d;
          });

        node.filter(function (d) {
          return nodesToHighlight.indexOf(d.id) >= 0;
        })
          .style('fill', '#555')
          .attr('r', 15);
        link.style('stroke', function (link_d) {
          return (link_d.source === d.id) | (link_d.target === d.id)
            ? '#d62333'
            : null;
        });
      })
      .on('mouseout', function (event, d) {
        node
          .style('fill', null)
          .attr('r', 8);
        link.style('stroke', null);
      });
    /*
    let defs = nodeEnter.append("defs");
    defs
      .append('pattern')
      .attr("id", function (d) {
        return "image" + d.name;
      })
      .attr("width", 1)
      .attr("height", 1)
      .append("svg:image")
      .attr("xlink:href", function (d) {
        return d.url;
      })
      .attr("width", 100)
      .attr("height", 150);
*/

    // And give them a label
    vis
      .chart
      .selectAll('mylabels')
      .data(vis.data.nodes)
      .enter()
      .append('text')
      .attr('x', function (d) {
        return x(d.name);
      })
      .attr('y', vis.height - 10)
      .text(function (d) {
        return d.name;
      })
      .style('text-anchor', 'middle');

    // Add links between nodes. Here is the tricky part. In my input data, links are
    // provided between nodes -id-, NOT between node names. So I have to do a link
    // between this id and the name
    let idToNode = {};
    vis
      .data
      .nodes
      .forEach(function (n) {
        idToNode[n.id] = n;
      });

    // Cool, now if I do idToNode["2"].name I've got the name of the node with id 2
    // Add the links
    let link = vis
      .chart
      .append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(vis.data.links)
      .enter()
      .append('path')
      .attr('d', function (d) {
        let start = x(idToNode[d.source].name); // X position of start node on the X axis
        let end = x(idToNode[d.target].name); // X position of end node
        return [
          'M', start, vis.height - 30, // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
          'A', // This means we're gonna build an elliptical arc
          (start - end) / 2,
          ',', // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
          (start - end) / 2,
          0,
          0,
          ',',
          start < end
            ? 1
            : 0,
          end,
          ',',
          vis.height - 30
        ] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
          .join(' ');
      })
      // .style('fill', 'none') .attr('stroke', 'black')
      .attr('stroke-width', 5)
      .on('mouseover', function (event, d) {
        link.style('stroke', null);
        d3
          .select(this)
          .style('stroke', '#d62333')
          .style('stroke-width', 15);
        node.style('fill', function (node_d) {
          return node_d === d.source || node_d === d.target
            ? 'black'
            : null;
        });
      })
      .on('mouseout', function (event, d) {
        link
          .style('stroke-width', function (link_d) {
            return d3
              .select(this)
              .classed('active')
              ? 15
              : 5;
          });
        link.style('stroke', function (link_d) {
          return d3
            .select(this)
            .classed('active')
            ? '#170D64'
            : null;
        });
        node.style('fill', null);
      })
      .on('click', function (event, d) {

        const isActive = d3
          .select(this)
          .classed('active');

        // remove select from all the other links
        d3
          .selectAll('.active')
          .classed('active', false);
        link.style('stroke-width', function (link_d) {
          return d3
            .select(this)
            .classed('active')
            ? 5
            : null;
        });
        vis
          .dispatcher
          .call('filterCategories', event, d);

        d3
          .select(this)
          .classed('active', !isActive);
      });
  }
}

export default ArcComponent;
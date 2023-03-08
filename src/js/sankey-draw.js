// d3js
import * as d3Base from './d3.min';
import * as d3Sankey from './d3-sankey';
// import & build Data
import { dataGet } from './dataGet';
// highlighting flow of node selection
import {
  linksConnect,
  nodesConnect,
  highlight_flow,
  moveNodes,
  overNodes,
  outNodes,
  overlink,
  outlink,
  linkTooltip,
} from './sankey-highlight';

// join d3 libraries
const d3 = {
  ...d3Base,
  ...d3Sankey,
};
// main data container
let sData;
// column name => store nodes by layers
let column = ['autores', 'periodos', 'proyectos', 'annos', 'temas'];

// build sankey chart
const createSankey = async () => {
  // load CSV file
  sData = await dataGet();
  drawSankey();
};

// tooltip div
const sTooltip = d3.select('body').append('div').attr('id', 'sTooltip');
sTooltip.append('div').attr('id', 'sTipBox');
sTooltip.append('div').attr('id', 'sTipMark');

// append the svg object to the body of the page
const svg = d3
  .select('#dataviz')
  .append('svg')
  .attr('id', 'sankey')
  .append('g')
  .attr('id', 'sankeyBox');

// Set the sankey diagram properties
const sankey = d3.sankey();

// const defs = svg.append('defs');
let nodesFix;
let links = svg.append('g').attr('id', 'links');
let guides = svg.append('g').attr('id', 'guides');
let nodes = svg.append('g').attr('id', 'nodes');

//
// append elements of the graph
const drawSankey = () => {
  graph = sankey(sData);

  // year guides by column
  for (let i = 0; i < column.length - 1; ++i) {
    for (let j = 0; j < 4; ++j) {
      guides.append('path').attr('class', 'guide');
    }
  }
  guides = d3.selectAll('.guide');

  // add in the links
  links = links
    .selectAll('.link')
    .data(graph.links)
    .enter()
    .append('g')
    .attr('id', (d, i) => {
      d.id = `link${i + 1}`;
      return d.id;
    })
    .each((d) => (d.connect = linksConnect(d.id)))
    .on('mouseover', overlink)
    .on('mouseout', outlink);

  links.filter((d) => d.lColumn === 1).on('mousemove', linkTooltip);

  // add in the nodes
  nodes = nodes
    .selectAll('.node')
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('id', (d) => `node${d.id}`)
    .each((d) => (d.connect = nodesConnect(d.id)))
    .on('mousemove', moveNodes)
    .on('mouseover', overNodes)
    .on('mouseout', outNodes)
    .on('click', highlight_flow);

  // selectAll nodes by layer(column)
  for (let i = 0; i < column.length; ++i) {
    column[i] = nodes.filter((d) => d.depth === i);
  }

  // assigment tp nodes & links paraPol value
  d3.selectAll([...column[2], ...column[3], ...column[4]]).each((d) => {
    let para = Math.round(
      (d3.sum(d.targetLinks, (e) => e.paraPol) / (d.targetLinks.length * 100)) * 100
    );
    para < 20
      ? (para = 0)
      : para >= 20 && para < 40
      ? (para = 20)
      : para >= 40 && para < 60
      ? (para = 40)
      : para >= 60 && para < 80
      ? (para = 60)
      : para >= 80 && para < 100
      ? (para = 80)
      : (para = para);
    d.paraPol = para;
    d.sourceLinks.forEach((e) => (e.paraPol = para));
  });

  nodes.attr('class', (d) =>
    d.depth === 0
      ? `node autor para`
      : d.depth === 1
      ? `node lapse para`
      : d.depth === 2
      ? `node proj para`
      : d.depth === 3
      ? `node anno para`
      : `node topic t--${d.idTema} para`
  );

  // assigment links classes
  links.attr('class', (d) =>
    d.lColumn === 0
      ? `link aut pp--${d.idPartido} con--${d.idCongreso} para`
      : d.lColumn === 1
      ? `link proj pp--${d.idPartido} con--${d.idCongreso} para`
      : `link topic tem--${d.idTema} para`
  );

  // add links path
  links.append('path').attr('class', (d) => `para--${d.paraPol}`);

  // add the rectangles for the nodes
  column[0]
    .append('rect')
    .attr('class', (d) => (d.old > 1 ? `old old--${d.old} para--${d.paraPol}` : `old`));

  // nodesFix
  nodesFix = column[0].filter((d) => d.fix > 0);

  nodesFix.each(function (d) {
    let self = d3.select(this);
    d3.range(d.fix).forEach(function () {
      self.append('path').attr('class', `fix`);
    });
  });

  nodes
    .append('rect')
    .attr('class', (d) =>
      d.depth === 0
        ? `nRect para--${d.paraPol}`
        : d.depth === 1
        ? `nRect pp--${d.idPartido}`
        : `nRect para--${d.paraPol}`
    );

  column[2].each(function (d) {
    let self = d3.select(this);
    for (let i = 0; i < d.targetLinks.length; ++i) {
      self.append('rect').attr('class', 'pRect');
    }
  });

  // add in the title for the nodes
  column[0]
    .append('text')
    .attr('class', (d) => `title--nombre para--${d.paraPol}`)
    .text((d) => d.nombre);

  column[0]
    .append('text')
    .attr('class', (d) => `title--apellido para--${d.paraPol}`)
    .text((d) => d.apellido);

  d3.selectAll([...column[1], ...column[2], ...column[3], ...column[4]])
    .append('text')
    .attr('class', (d) => `title--value para--${d.paraPol}`)
    .text((d) => d.value);

  column[4]
    .append('text')
    .attr('class', (d) => `title--topic para--${d.paraPol}`)
    .text((d) => d.nombre);
};

export { sData, column, sTooltip, sankey, nodesFix, guides, links, nodes, createSankey };

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
  moveLinks,
  overLinks,
  outLinks,
} from './sankey-highlight';

// join d3 libraries
const d3 = {
  ...d3Base,
  ...d3Sankey,
};
// main data container
let sData;
// column name => store nodes by layers
let column = ['autores', 'periodos', 'partidos', 'proyectos', 'annos', 'temas'];

// delay function
const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

// build sankey chart
const createSankey = async () => {
  // load CSV file
  sData = await dataGet();
  drawSankey();
};

// tooltip div
const sTooltip = d3.select('body').append('div').attr('id', 'sTooltip');
sTooltip.append('div').attr('id', 'sTooltip--content');
sTooltip.append('div').attr('id', 'sTooltip--mark');

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
  for (let i = 1; i < column.length - 2; ++i) {
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
      d.id = `l${i + 1}`;
      return d.id;
    })
    .each((d) => (d.connect = linksConnect(d.id)))
    .on('mouseover', overLinks)
    .on('mouseout', outLinks);

  links.filter((d) => d.lColumn === 1).on('mousemove', moveLinks);

  // add in the nodes
  nodes = nodes
    .selectAll('.node')
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('id', (d) => `n${d.id}`)
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
  d3.selectAll([...column[2], ...column[3], ...column[4], ...column[5]]).each((d) => {
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
    d.sourceLinks.forEach((e) => {
      d.lColumn == 2 ? (e.paraPol = e.paraPol) : (e.paraPol = para);
    });
  });

  nodes.attr('class', (d) =>
    d.depth === 0
      ? `node autor para`
      : d.depth === 1
      ? `node lapse para`
      : d.depth === 2
      ? `node pol para`
      : d.depth === 3
      ? `node proj para`
      : d.depth === 4
      ? `node anno para`
      : `node topic t--${d.idTema} para`
  );

  // assigment links classes
  links.attr('class', (d) =>
    d.lColumn === 0
      ? `link aut pp--${d.idPartido} con--${d.idCongreso} para`
      : d.lColumn === 1
      ? `link pol pp--${d.idPartido} con--${d.idCongreso} para`
      : d.lColumn === 2
      ? `link proj pp--${d.idPartido} con--${d.idCongreso} para`
      : `link topic tem--${d.idTema} para`
  );

  // add links path
  links.append('path').attr('class', (d) => (d.lColumn == 0 ? `` : `para--${d.paraPol}`));

  // add the rectangles for the nodes old
  column[0]
    .append('rect')
    .attr('class', (d) => (d.old > 1 ? `old old--${d.old}` : `old`));

  d3.selectAll([...column[1], ...column[2], ...column[3]])
    .append('rect')
    .attr('class', 'nBg');

  nodes
    .append('rect')
    .attr('class', (d) => (d.lColumn == 0 ? `nRect` : `nRect para--${d.paraPol}`));

  d3.selectAll([...column[1], ...column[2]])
    .append('rect')
    .attr('class', (d) => `ppRect pp--${d.idPartido}`);

  column[3].each(function (d) {
    let self = d3.select(this);
    for (let i = 0; i < d.targetLinks.length; ++i) {
      self.append('rect').attr('class', 'ppRect');
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

  d3.selectAll([...column[1], ...column[2], ...column[3], ...column[4], ...column[5]])
    .append('text')
    .attr('class', `title--value`)
    .text((d) => d.value);

  column[5]
    .append('text')
    .attr('class', `title--topic`)
    .text((d) => d.tema);
};

export { sData, column, delay, sTooltip, sankey, guides, links, nodes, createSankey };

// d3js
import * as d3Base from './d3.min';
import * as d3Sankey from './d3-sankey';
// import & build Data
import { getData } from './getData';

// join d3 libraries
const d3 = {
  ...d3Base,
  ...d3Sankey,
};
//
// main data container
let sData;
//
// size of graph container
let newSize = {
  width: 0,
  height: 0,
};
// set the dimensions and margins of the graph
let margin = 40;
let nWidth = 10;
let nPadding = 6;
let autoresWid = 0;
let temasWid = 0;
let textWid = 0;
let layerPos;

// build sankey chart
const buildDraw = async () => {
  // load CSV file
  sData = await getData();
  await drawGraph();
  ro.observe(sankeyBox);
};
buildDraw();

// format variables
const formatNumber = d3.format(',.0f'), // zero decimal
  format = (d) => formatNumber(d);

// append the svg object to the body of the page
const svg = d3
  .select('#dataviz')
  .append('svg')
  .attr('id', 'sankey')
  .append('g')
  .attr('id', 'sankeyBox');

// Set the sankey diagram properties
const sankey = d3.sankey().nodeWidth(nWidth).nodePadding(nPadding).iterations(0);

let links = svg.append('g');
let nodes = svg.append('g');
let nAutores, nPeriodos, nProyectos, nAnno, nTemas, temaNodes;
//
//
// append elements
const drawGraph = () => {
  // sankey
  // .nodeSort((a, b) => d3.ascending(a.id, b.id))
  // .linkSort((a, b) => d3.ascending(a.anno, b.anno));

  graph = sankey(sData);

  // add in the links
  links = links.selectAll('.link').data(graph.links).enter().append('path');

  // add in the nodes
  nodes = nodes
    .selectAll('.node')
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('class', 'node');

  nAutores = nodes.filter((d) => d.depth === 0);
  nPeriodos = nodes.filter((d) => d.depth === 1);
  nProyectos = nodes.filter((d) => d.depth === 2);
  nAnno = nodes.filter((d) => d.depth === 3);
  nTemas = nodes.filter((d) => d.depth === 4);
  temaNodes = d3.selectAll([...nProyectos, ...nAnno, ...nTemas]);

  // add the rectangles for the nodes
  nAutores
    .filter((d) => d.fix > 0)
    .append('rect')
    .attr('class', 'fix');

  nodes.append('rect');

  // add in the title for the nodes
  nAutores
    .append('text')
    .attr('class', 'nombre')
    .text((d) => d.nombre);

  nAutores
    .append('text')
    .attr('class', 'apellido')
    .text((d) => d.apellido);

  nTemas.append('text').text((d) => d.nombre);

  // update nodeWidth in data
  nodes.data(graph.nodes, (d) => (d.nodeWid = nWidth));

  temaNodes.each((d) => {
    let para = Math.round(
      (d3.sum(d.targetLinks, (e) => e.paraPol) / (d.targetLinks.length * 100)) * 100
    );
    d.paraPol = para;
    let lSource = [...d.sourceLinks];
    lSource.forEach((e) => (e.paraPol = para));
  });

  links.attr('class', (d) =>
    d.lColumn === 0
      ? `link pp${d.idPartido} para${d.paraPol}`
      : d.lColumn === 1
      ? `link pp${d.idPartido} c${d.congreso} para${d.paraPol}`
      : `link t${d.idTema} para${d.paraPol}`
  );

  nodes
    .selectAll('rect')
    .attr('class', (d) =>
      d.depth === 0
        ? `autor para${d.paraPol}`
        : d.depth === 1
        ? `pp${d.idPartido} c${d.congreso}`
        : `t${d.idTema} para${d.paraPol}`
    );
};

// get max width of autor titles & tema titles
const getText = () => {
  let titleAutores = [],
    titleTemas = [];
  nAutores.selectAll('text').each(function () {
    titleAutores.push(Math.ceil(this.getBBox().width));
  });
  nTemas.selectAll('text').each(function () {
    titleTemas.push(Math.ceil(this.getBBox().width));
  });
  autoresWid = d3.max(titleAutores);
  temasWid = d3.max(titleTemas);

  return autoresWid + temasWid;
};

// calc percentage function
const calcPercent = (num, percentage) => Math.floor((num / 100) * percentage);

// get array of layers X position
const getLayers = () => {
  // sankey total width
  let wTotal = newSize.width - margin - textWid - nWidth;
  // custom layers position
  return new Array(
    0,
    calcPercent(wTotal, 20),
    calcPercent(wTotal, 80),
    calcPercent(wTotal, 90),
    wTotal
  );
};

//
// update graph size
const updateGraph = async () => {
  // console.clear();
  // console.log('//');

  textWid = await getText();
  layerPos = await getLayers();

  d3.select('#sankey').attr('width', newSize.width).attr('height', newSize.height);

  d3.select('#sankeyBox').attr('transform', `translate(${margin / 2}, ${margin})`);

  sankey.size([newSize.width - margin - textWid, newSize.height - margin]);
  ``;

  graph = sankey(sData);

  links
    .data(graph.links)
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('stroke-width', (d) => d.width - 1);

  nodes
    .selectAll('rect')
    .attr('x', (d) => d.x0)
    .attr('y', (d) => d.y0 + 0.5)
    .attr('height', (d) => d.y1 - d.y0 - 1)
    .attr('width', () => nWidth);

  nAutores
    .select('.fix')
    .attr('x', (d) => d.x0 - nWidth * d.fix)
    .attr('y', (d) => d.y0 + 0.5)
    .attr('height', (d) => d.y1 - d.y0 - 1)
    .attr('width', (d) => nWidth * d.fix);

  // add in the title for the nodes
  nAutores
    .selectAll('text')
    .attr('x', (d) => d.x0 - nWidth * d.fix - 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('text-anchor', 'end');

  nAutores.selectAll('.nombre').attr('dy', '-0.1em');
  nAutores.selectAll('.apellido').attr('dy', '0.9em');

  nTemas
    .selectAll('text')
    .attr('x', (d) => d.x0 + nWidth + 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'start');
};

const sankeyBox = document.querySelector('#dataviz');
const ro = new ResizeObserver((entries) => {
  for (let entry of entries) {
    newSize.width = entry.contentRect.width;
    newSize.height = entry.contentRect.height;
  }
  updateGraph();
});

//
const getNodes = () => {};
// buttons
const button = document.querySelector('#update');
button.addEventListener('click', getNodes);
//

//  get max text width
const getWid = () => autoresWid;
//  get max text width
const getLayerPos = () => layerPos;

// exports
export { getWid, getLayerPos };

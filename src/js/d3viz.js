// d3js
import * as d3Base from './d3.min';
import * as d3Sankey from './d3-sankey';
// import & build Data
import { dataGet } from './dataGet';
import { selectAll } from 'd3';

// join d3 libraries
const d3 = {
  ...d3Base,
  ...d3Sankey,
};

// main data container
let sData;

// size of graph container
let newSize = {
  width: 0,
  height: 0,
};

// columns name
const colName = ['Autores', 'Periodos', 'Proyectos', 'Annos', 'Temas'];

// set the dimensions and margins of the graph
let margin = 40;
let nRound = 4;
let nWidth = 12;
let nPadding = 6;
let autoresWid = 0;
let temasWid = 0;
let textWid = 0;
let layerPos;

// build sankey chart
const buildDraw = async () => {
  // load CSV file
  sData = await dataGet();
  await drawGraph();
  ro.observe(sankeyBox);
};
buildDraw();

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
    0 + autoresWid,
    calcPercent(wTotal, 20) + autoresWid,
    calcPercent(wTotal, 80) + autoresWid,
    calcPercent(wTotal, 90) + autoresWid,
    wTotal + autoresWid
  );
};

const getGuides = () => {
  let points = [];
  for (let i = 0; i < layerPos.length - 1; ++i) {
    for (let j = 0; j < 4; ++j) {
      let line = [
        [layerPos[i] + nWidth / 2 + nWidth * j - nRound / 2, -20 + 1 * j],
        [layerPos[i] + nWidth / 2 + nWidth * j - nRound / 2, newSize.height - 50],
      ];
      points.push(line);
    }
  }
  return points;
};

const lineGen = d3.line();

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

let guides = svg.append('g').attr('id', 'guides');
let links = svg.append('g').attr('id', 'links');
let nodes = svg.append('g').attr('id', 'nodes');

// var nodes by layer
for (let i = 0; i < colName.length; ++i) {
  eval(`let n${colName[i]};`);
}

//
// append elements of the graph
const drawGraph = () => {
  // sankey.nodeSort((a, b) => d3.ascending(a.nGroup, b.nGroup));
  // sankey.linkSort((a, b) => d3.descending(a.anno, b.anno));

  layerPos = getLayers();

  graph = sankey(sData);

  for (let i = 0; i < layerPos.length - 1; ++i) {
    for (let j = 0; j < 4; ++j) {
      guides.append('path').attr('class', 'guide');
    }
  }
  guides = selectAll('.guide');

  // add in the links
  links = links.selectAll('.link').data(graph.links).enter().append('path');

  // add in the nodes
  nodes = nodes
    .selectAll('.node')
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('class', 'node');

  // nodes by layer
  for (let i = 0; i < colName.length; ++i) {
    eval(`n${colName[i]} = nodes.filter((d) => d.depth === ${i})`);
  }

  // update nodeWidth in data
  nodes.data(graph.nodes, (d) => (d.nodeWid = nWidth - nRound));

  d3.selectAll([...nProyectos, ...nAnnos, ...nTemas]).each((d) => {
    let para = Math.round(
      (d3.sum(d.targetLinks, (e) => e.paraPol) / (d.targetLinks.length * 100)) * 100
    );
    d.paraPol = para;
    let lSource = [...d.sourceLinks];
    lSource.forEach((e) => (e.paraPol = para));
  });

  links
    .attr('class', (d) =>
      d.lColumn === 0
        ? `link pp${d.idPartido} para${d.paraPol}`
        : d.lColumn === 1
        ? `link pp${d.idPartido} c${d.congreso} para${d.paraPol}`
        : `link t${d.idTema} para${d.paraPol}`
    )
    .append('title')
    .text((d) => d.nombre);

  // add the rectangles for the nodes
  nodes
    .append('rect')
    .attr('rx', nRound)
    .attr('class', (d) =>
      d.depth === 0
        ? `autor para${d.paraPol}`
        : d.depth === 1
        ? `pp${d.idPartido} c${d.congreso}`
        : `t${d.idTema} para${d.paraPol}`
    )
    .append('title')
    .text((d) => d.nombre);

  // add in the title for the nodes
  nAutores
    .append('text')
    .attr('class', 'title--nombre')
    .text((d) => d.nombre);

  nAutores
    .append('text')
    .attr('class', 'title--apellido')
    .text((d) => d.apellido);

  nTemas
    .append('text')
    .attr('class', 'title--tema')
    .text((d) => d.nombre);
};

//
//
// update graph size
const updateGraph = async () => {
  // console.clear();
  // console.log('//');

  textWid = await getText();
  layerPos = await getLayers();
  let points = await getGuides();

  d3.select('#sankey').attr('width', newSize.width).attr('height', newSize.height);

  d3.select('#sankeyBox').attr('transform', `translate(${margin / 2}, ${margin})`);

  sankey.size([newSize.width - margin - textWid, newSize.height - margin]);
  ``;
  guides.data(points).attr('d', (d, i) => lineGen(points[i]));

  graph = sankey(sData);

  links
    .data(graph.links)
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('stroke-width', (d) => d.width - 1);

  nodes
    .selectAll('rect')
    .attr('x', (d) => d.x0 - nRound / 2)
    .attr('y', (d) => d.y0 + 0.5)
    .attr('height', (d) => d.y1 - d.y0 - 1)
    .attr('width', () => nWidth - nRound / 2);

  // add in the title for the nodes
  nAutores
    .selectAll('text')
    .attr('x', (d) => d.x0 - nWidth * d.fix - nRound - 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('text-anchor', 'end');

  nAutores.selectAll('.title--nombre').attr('dy', '-0.1em');
  nAutores.selectAll('.title--apellido').attr('dy', '0.9em');

  nTemas
    .selectAll('text')
    .attr('x', (d) => d.x0 + nWidth + 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'start');

  // console.log(`nAutores =`, nAutores.nodes());
  // console.log(`nPeriodos =`, nPeriodos.nodes());
  // console.log(`nProyectos =`, nProyectos.nodes());
  // console.log(`nAnnos =`, nAnnos.nodes());
  // console.log(`nTemas =`, nTemas.nodes());
};

const sankeyBox = document.querySelector('#dataviz');
const ro = new ResizeObserver((entries) => {
  for (let entry of entries) {
    newSize.width = Math.round(entry.contentRect.width);
    newSize.height = Math.round(entry.contentRect.height);
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
const getLayerPos = () => layerPos;

// exports
export { getLayerPos };

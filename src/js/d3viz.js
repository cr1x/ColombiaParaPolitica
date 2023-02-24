// d3js
import * as d3Base from './d3.min';
import * as d3Sankey from './d3-sankey';
// get text widths, layer position, guides points
import { getValues } from './sankey-getValues';
//
import { sData, column, sankey, guides, links, nodes, createSankey } from './sankey-draw';
// Link path generator
import { sankeyLinkPath } from './sankeyLinkPath';

// column name guide
// column = [autores, periodos, proyectos, annos, temas];
const nWidth = [8, 10, 10, 10, 8];

// div size observer
const sankeyBox = document.querySelector('#dataviz');

// join d3 libraries
const d3 = {
  ...d3Base,
  ...d3Sankey,
};
// set the dimensions and margins of the graph
let margin = 40,
  round = 2.4,
  nPadding = 6,
  sWidth = 0,
  sHeigh = 0;

//
// update graph size
const updateGraph = async () => {
  // console.clear();
  // console.log('//');

  // update nodeWidth in data
  column.forEach((col, i) => {
    col.each((d) => (d.nodeWid = nWidth[i]));
  });

  let values = await getValues(sWidth, sHeigh, margin, nWidth, round);

  d3.select('#sankey').attr('width', sWidth).attr('height', sHeigh);

  d3.select('#sankeyBox').attr('transform', `translate(${margin / 2}, ${margin})`);

  sankey
    .size([sWidth - margin - values.textWid, sHeigh - margin])
    .nRound(round)
    .nodePadding(nPadding)
    .layersPos(values.layerPos);

  guides.data(values.points).attr('d', (d, i) => d3.line()(values.points[i]));

  graph = sankey(sData);

  links.selectAll('path').attr('d', (d) => sankeyLinkPath(d));

  nodes
    .selectAll('rect')
    .attr('rx', (d) => d.nodeWid / round)
    // .attr('x', (d) => d.x0)
    .attr('x', (d) => d.x0 - d.nodeWid / 2 + d.nodeWid / (round * 2))
    .attr('y', (d) => d.y0)
    .attr('width', (d) => d.nodeWid)
    .attr('height', (d) => d.y1 - d.y0);

  // add in the title for the nodes
  column[0]
    .selectAll('text')
    .attr('x', (d) => d.x0 - d.nodeWid * d.fix - round - 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('text-anchor', 'end');

  column[0]
    .selectAll('.title--nombre')
    .attr('alignment-baseline', 'baseline')
    .attr('baseline-shift', '10%');
  // .attr('dy', '-0.1em');

  column[0]
    .selectAll('.title--apellido')
    .attr('alignment-baseline', 'hanging')
    .attr('baseline-shift', '-10%');

  column[1]
    .selectAll('.title--value')
    .attr('x', (d) => d.x0 - d.nodeWid / round - 2)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('alignment-baseline', 'central')
    .attr('text-anchor', 'end');

  d3.selectAll([...column[2], ...column[3]])
    .selectAll('.title--value')
    .attr('x', (d) => d.x0 + d.nodeWid + 1)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('alignment-baseline', 'central')
    .attr('text-anchor', 'start');

  column[4]
    .selectAll('text')
    .attr('x', (d) => d.x0 + d.nodeWid + 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('text-anchor', 'start');

  column[4]
    .selectAll('.title--tema')
    .attr('alignment-baseline', 'baseline')
    .attr('baseline-shift', '10%');

  column[4]
    .selectAll('.title--value')
    .attr('dx', '.2%')
    .attr('alignment-baseline', 'hanging')
    .attr('baseline-shift', '-10%');

  // console.log(links.nodes());
  // console.log(nodes.nodes());
  // console.log(`autores =`, column[0].nodes());
  // console.log(`periodos =`, column[1].nodes());
  // console.log(`proyectos =`, column[2].nodes());
  // console.log(`annos =`, column[3].nodes());
  // console.log(`temas =`, column[4].nodes());
};

// resize observer
const ro = new ResizeObserver((entries) => {
  for (let entry of entries) {
    sWidth = Math.round(entry.contentRect.width);
    sHeigh = Math.round(entry.contentRect.height);
  }
  updateGraph();
});

// build sankey chart
const buildSankey = async () => {
  // create elements of sankey
  await createSankey();
  // add observer to sankey container
  ro.observe(sankeyBox);
};
buildSankey();

//
const prueba = () => {};
// buttons
const button = document.querySelector('#update');
button.addEventListener('click', prueba);
//

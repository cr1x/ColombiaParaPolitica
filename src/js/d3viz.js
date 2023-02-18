// d3js
import * as d3Base from './d3.min';
import * as d3Sankey from './d3-sankey';
// get text widths, layer position, guides points
import { getValues } from './sankey-getValues';
//
import { sData, column, sankey, guides, links, nodes, createSankey } from './sankey-draw';

// column name guide
// column = [autores, periodos, proyectos, annos, temas];

// div size observer
const sankeyBox = document.querySelector('#dataviz');

// join d3 libraries
const d3 = {
  ...d3Base,
  ...d3Sankey,
};
// set the dimensions and margins of the graph
let margin = 40,
  nRound = 4,
  nWidth = 12,
  nPadding = 6,
  w = 0,
  h = 0;

//
// update graph size
const updateGraph = async () => {
  // console.clear();
  // console.log('//');

  // update nodeWidth in data
  nodes.data(graph.nodes, (d) => (d.nodeWid = nWidth - nRound));

  let values = await getValues(w, h, margin, nWidth, nRound);

  d3.select('#sankey').attr('width', w).attr('height', h);

  d3.select('#sankeyBox').attr('transform', `translate(${margin / 2}, ${margin})`);

  sankey
    .size([w - margin - values.textWid, h - margin])
    .nodeWidth(nWidth)
    .nodePadding(nPadding)
    .layersPos(values.layerPos);

  guides.data(values.points).attr('d', (d, i) => d3.line()(values.points[i]));

  graph = sankey(sData);

  links.attr('d', d3.sankeyLinkHorizontal()).attr('stroke-width', (d) => d.width - 1);

  nodes
    .selectAll('rect')
    .attr('rx', nRound)
    .attr('x', (d) => d.x0 + 1 - nRound / 2)
    .attr('y', (d) => d.y0 + 0.5)
    .attr('height', (d) => d.y1 - d.y0 - 1)
    .attr('width', () => nWidth - nRound / 2);

  // add in the title for the nodes
  column[0]
    .selectAll('text')
    .attr('x', (d) => d.x0 - nWidth * d.fix - nRound - 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('text-anchor', 'end');

  column[0].selectAll('.title--nombre').attr('dy', '-0.1em');
  column[0].selectAll('.title--apellido').attr('dy', '0.9em');

  column[1]
    .selectAll('.title--value')
    .attr('x', (d) => d.x0 + nWidth + 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'start');

  d3.selectAll([...column[2], ...column[3]])
    .selectAll('.title--value')
    .attr('x', (d) => d.x0 + nWidth + 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'start');

  column[4]
    .selectAll('text')
    .attr('x', (d) => d.x0 + nWidth + 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'start');

  // console.log(links);
  // console.log(nodes);
  // console.log(`autores =`, column[0].nodes());
  // console.log(`periodos =`, column[1].nodes());
  // console.log(`proyectos =`, column[2].nodes());
  // console.log(`annos =`, column[3].nodes());
  // console.log(`temas =`, column[4].nodes());
};

// resize observer
const ro = new ResizeObserver((entries) => {
  for (let entry of entries) {
    w = Math.round(entry.contentRect.width);
    h = Math.round(entry.contentRect.height);
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

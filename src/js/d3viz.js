// d3js
import * as d3Base from './d3.min';
import * as d3Sankey from './d3-sankey';
// get text widths, layer position, guides points
import { getValues } from './sankey-getValues';
//
import {
  sData,
  column,
  sankey,
  nodesFix,
  fixes,
  guides,
  links,
  nodes,
  createSankey,
} from './sankey-draw';

// Link path generator
// import { sankeyLinkPath } from './sankeyLinkPath';

// div size observer
const sankeyBox = document.querySelector('#dataviz');

// join d3 libraries
const d3 = {
  ...d3Base,
  ...d3Sankey,
};
// set the dimensions and margins of the graph
let margin = 40,
  nPadding = 6,
  sWidth = 0,
  sHeigh = 0,
  vPadding = 4;

// columns percentage
let colPercent = [0, 15, 68, 94];
// column name guide
// column = [autores, periodos, proyectos, annos, temas];
let nWidth = [10, 24, 26 + vPadding / 2, 32, 10];

//
// update graph size
const updateGraph = async () => {
  // console.clear();
  // console.log('//');

  // update nodeWidth in data
  column.forEach((col, i) => {
    col.each((d) => (d.nodeWid = nWidth[i]));
  });

  let values = await getValues(sWidth, sHeigh, margin, nWidth, colPercent, vPadding);

  d3.select('#sankey').attr('width', sWidth).attr('height', sHeigh);

  d3.select('#sankeyBox').attr('transform', `translate(${margin / 2}, ${margin})`);

  sankey
    .size([sWidth - margin - values.textWid, sHeigh - margin])
    .nodePadding(nPadding)
    .layersPos(values.layerPos);

  guides.attr('d', (d, i) => d3.line()(values.points[i]));

  graph = sankey(sData);

  links
    .selectAll('path')
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('stroke-width', (d) => d.width - 1);
  // links.selectAll('path').attr('d', (d) => sankeyLinkPath(d));

  nodes
    .selectAll('rect')
    .attr('x', (d) => d.x0)
    .attr('y', (d) => d.y0 + 0.5)
    .attr('width', (d) => d.nodeWid)
    .attr('height', (d) => d.y1 - d.y0 - 1);

  column[1]
    .selectAll('.nRect')
    .attr('x', (d) => d.x0 + vPadding / 2)
    .attr('width', (d) => d.nodeWid - vPadding);

  column[2].each(function (d) {
    let targets = Array.from(d3.selectAll(d.targetLinks));
    d3.select(this)
      .selectAll('.pRect')
      .each(function (e, i) {
        d3.select(this)
          .attr('x', d.x0 + vPadding / 2)
          .attr('y', targets[i].y1 - targets[i].width / 2 + 0.5)
          .attr('width', d.nodeWid / 5)
          .attr('height', targets[i].width - 1)
          .attr('class', `pRect pp--${targets[i].idPartido}`);
      });
  });

  column[4]
    .selectAll('.nRect')
    .attr('x', (d) => d.x0 + vPadding)
    .attr('width', (d) => d.nodeWid - vPadding);

  // fixes.each(function (d, i) {
  //   let nf = nodesFix[i];
  //   d3.select(this)
  //     .attr('x', values.layerPos[0])
  //     .attr('y', nf.y0 + 0.5)
  //     .attr('width', nf.nodeWid * nf.fix)
  //     .attr('height', nf.y1 - nf.y0 - 1);
  // });

  fixes.each(function (d, i) {
    let nf = nodesFix[i];
    d3.select(this)
      .selectAll('path')
      .attr('d', (d, j) => {
        return d3.line()([
          [values.points[j][0][0], nf.y0 + 0.5],
          [values.points[j][0][0], nf.y1 - 0.5],
        ]);
      });
  });

  // add in the title for the nodes
  column[0]
    .selectAll('text')
    .attr('x', (d) => d.x0 - d.nodeWid * d.fix - 6)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('text-anchor', 'end');

  column[0]
    .selectAll('.title--nombre')
    .attr('alignment-baseline', 'baseline')
    .attr('baseline-shift', '10%');

  column[0]
    .selectAll('.title--apellido')
    .attr('alignment-baseline', 'hanging')
    .attr('baseline-shift', '-10%');

  d3.selectAll([...column[1], ...column[2], ...column[3]])
    .selectAll('.title--value')
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('alignment-baseline', 'central');

  column[1]
    .selectAll('.title--value')
    .attr('x', (d) => d.x0 - vPadding)
    .attr('text-anchor', 'end');

  column[2]
    .selectAll('.title--value')
    .attr('x', (d) => d.x0 + d.nodeWid / 2 + vPadding)
    .attr('text-anchor', 'middle');

  d3.selectAll([...column[1], ...column[3]])
    .selectAll('.title--value')
    .attr('x', (d) => d.x0 + d.nodeWid / 2)
    .attr('text-anchor', 'middle');

  column[4]
    .selectAll('text')
    .attr('x', (d) => d.x0 + d.nodeWid + vPadding)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('text-anchor', 'start');

  column[4]
    .selectAll('.title--topic')
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

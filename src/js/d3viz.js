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
  guides,
  links,
  nodes,
  createSankey,
} from './sankey-draw';

// join d3 libraries
const d3 = {
  ...d3Base,
  ...d3Sankey,
};

// div size observer
const sankeyBox = document.querySelector('#dataviz');

// set the dimensions and margins of the graph
let margin = 20,
  nPadding = 6,
  sWidth = 0,
  sHeigh = 0,
  vPadding = 4;

// columns percentage
let colPercent = [0, 20, 72, 96];
// column name guide
// column = [autores, periodos, proyectos, annos, temas];
let nWidth = [8, 24, 26 + vPadding / 2, 32, 10];

//
// build sankey chart
const buildSankey = async () => {
  // create elements of sankey
  await createSankey();
  // add observer to sankey container
  ro.observe(sankeyBox);
};
buildSankey();

// resize observer
const ro = new ResizeObserver((entries) => {
  for (let entry of entries) {
    sWidth = Math.round(entry.contentRect.width);
    sHeigh = Math.round(entry.contentRect.height);
  }
  updateGraph();
});

//
// update graph size
const updateGraph = async () => {
  // update nodeWidth in data
  column.forEach((col, i) => {
    col.each((d) => (d.nodeWid = nWidth[i]));
  });

  let values = await getValues(sWidth, sHeigh, margin, nWidth, colPercent, vPadding);

  d3.select('#sankey').attr('width', sWidth).attr('height', sHeigh);

  sankey
    .size([sWidth - values.textWid, sHeigh - margin])
    .nodePadding(nPadding)
    .margen(margin)
    .layersPos(values.layerPos);

  guides.attr('d', (d, i) => d3.line()(values.points[i]));

  graph = sankey(sData);

  links
    .selectAll('path')
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('stroke-width', (d) => d.width - 1);

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
    d3.select(this)
      .selectAll('.pRect')
      .attr('x', d.x0 + vPadding / 2)
      .attr('y', (e, i) => {
        return d.targetLinks[i].y1 - d.targetLinks[i].width / 2 + 0.5;
      })
      .attr('width', d.nodeWid / 5)
      .attr('height', (e, i) => {
        return d.targetLinks[i].width - 1;
      })
      .attr('class', (e, i) => {
        return `pRect pp--${d.targetLinks[i].idPartido}`;
      });
  });

  column[4]
    .selectAll('.nRect')
    .attr('x', (d) => d.x0 + 2)
    .attr('width', values.title4Wid - 2);

  // line "fix" position
  nodesFix.each(function (d) {
    d3.select(this)
      .selectAll('.fix')
      .attr('d', (e, j) => {
        return d3.line()([
          [values.points[j][0][0], d.y0 + 1],
          [values.points[j][0][0], d.y1 - 0.5],
        ]);
      });
  });

  d3.selectAll('.old').attr('x', '0').attr('width', values.title0Wid);

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
    .attr('baseline-shift', '-30%');

  // console.log(links.nodes());
  // console.log(nodes.nodes());
  // console.log(`autores =`, column[0].nodes());
  // console.log(`periodos =`, column[1].nodes());
  // console.log(`proyectos =`, column[2].nodes());
  // console.log(`annos =`, column[3].nodes());
  // console.log(`temas =`, column[4].nodes());
};

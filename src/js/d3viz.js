// d3js
import * as d3Base from './d3.min';
import * as d3Sankey from './d3-sankey';
// get text widths, layer position, guides points
import { getValues } from './sankey-getValues';
//
import {
  sData,
  column,
  delay,
  sankey,
  guides,
  links,
  nodes,
  createSankey,
} from './sankey-draw';

// Link path generator
import { sankeyLinkPath } from './sankeyLinkPath';

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
  vPadding = 3,
  ppWidth = 6;

// [autores, periodos, partidos, proyectos, annos, temas];
// columns percentage
let colPercent = [0, 0, 48, 85, 98, 100];
// nodes width by column
let nWidth = [0, 24, 24, 32, 32, 5];
let pd = ppWidth + vPadding;
nWidth[1] = nWidth[1] + pd;
nWidth[2] = nWidth[2] + pd;
nWidth[3] = nWidth[3] + pd;

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

  let values = await getValues(
    sWidth,
    sHeigh,
    margin,
    nWidth,
    colPercent,
    ppWidth,
    vPadding
  );

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
    // .attr('d', d3.sankeyLinkHorizontal())
    .attr('d', (d) => sankeyLinkPath(d))
    .attr('stroke-width', (d) => d.width - 1);

  nodes
    .selectAll('.nRect')
    .attr('y', (d) => d.y0 + 0.5)
    .attr('height', (d) => d.y1 - d.y0 - 1);

  d3.selectAll([...column[0], ...column[1], ...column[2], ...column[4], ...column[5]])
    .selectAll('.nRect')
    .attr('x', (d) => d.x0);

  column[3].selectAll('.nRect').attr('x', (d) => d.x0 + ppWidth + vPadding);

  d3.selectAll([...column[1], ...column[2], ...column[3]])
    .selectAll('.nRect')
    .attr('width', (d) => d.nodeWid - ppWidth - vPadding);

  d3.selectAll([...column[0], ...column[4]])
    .selectAll('.nRect')
    .attr('width', (d) => d.nodeWid);

  d3.selectAll('.nBg')
    .attr('x', (d) => d.x0)
    .attr('y', (d) => d.y0 + 0.5)
    .attr('width', (d) => d.nodeWid)
    .attr('height', (d) => d.y1 - d.y0 - 1);

  d3.selectAll([...column[1], ...column[2]])
    .selectAll('.ppRect')
    .attr('x', (d) => d.x1 - ppWidth - vPadding / 2)
    .attr('y', (d) => d.y0 + 0.5)
    .attr('width', ppWidth)
    .attr('height', (d) => d.y1 - d.y0 - 1);

  column[3].each(function (d) {
    d3.select(this)
      .selectAll('.ppRect')
      .attr('x', (d) => d.x0 + vPadding / 2)
      .attr('y', (e, i) => {
        return d.targetLinks[i].y1 - d.targetLinks[i].width / 2 + 0.5;
      })
      .attr('width', ppWidth)
      .attr('height', (e, i) => {
        return d.targetLinks[i].width - 1;
      })
      .attr('class', (e, i) => {
        return `ppRect pp--${d.targetLinks[i].idPartido}`;
      });
  });

  column[5]
    .selectAll('.nRect')
    .attr('x', (d) => d.x0)
    .attr('width', values.title5Wid);

  d3.selectAll('.old')
    .attr('x', '0')
    .attr('y', (d) => d.y0 + 0.5)
    .attr('width', values.title0Wid)
    .attr('height', (d) => d.y1 - d.y0 - 1);

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

  d3.selectAll([...column[1], ...column[2], ...column[3], ...column[4]])
    .selectAll('.title--value')
    .attr('x', (d) =>
      d.lColumn == 4 ? d.x0 + d.nodeWid / 2 : d.x0 + (d.nodeWid - ppWidth - vPadding) / 2
    )
    .attr('y', (d) => (d.y1 + d.y0) / 2 - 0.2)
    .attr('alignment-baseline', 'central')
    .attr('text-anchor', 'middle');

  column[5]
    .selectAll('text')
    .attr('x', (d) => d.x0 + d.nodeWid + vPadding)
    .attr('y', (d) => (d.y1 + d.y0) / 2)
    .attr('text-anchor', 'start');

  column[5]
    .selectAll('.title--topic')
    .attr('alignment-baseline', 'baseline')
    .attr('baseline-shift', '10%');

  column[5]
    .selectAll('.title--value')
    .attr('dx', '.2%')
    .attr('alignment-baseline', 'hanging')
    .attr('baseline-shift', '-30%');

  // console.log(links.nodes());
  // console.log(links.filter((d) => d.lColumn == 1).nodes());
  // console.log(nodes.nodes());
  // console.log(`autores =`, column[0].nodes());
  // console.log(`periodos =`, column[1].nodes());
  // console.log(`partidos =`, column[2].nodes());
  // console.log(`proyectos =`, column[3].nodes());
  // console.log(`annos =`, column[4].nodes());
  // console.log(`temas =`, column[5].nodes());
};

const paraSwitch = async (evt) => {
  const el = evt.target;
  const check = el.getAttribute('aria-checked');
  switch (check) {
    case 'true':
      el.setAttribute('aria-checked', 'false');
      await delay(300);
      nodes.classed('para', false);
      links.classed('para', false);
      break;
    case 'false':
      el.setAttribute('aria-checked', 'true');
      await delay(300);
      nodes.classed('para', true);
      links.classed('para', true);
      break;
  }
};

document.querySelector('.switch--button').addEventListener('click', paraSwitch, false);

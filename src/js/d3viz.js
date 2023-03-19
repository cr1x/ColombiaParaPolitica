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
  guidesY,
  guidesP,
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
let margen = 20,
  nPadding = 6,
  sWidth = 0,
  sHeigh = 0,
  vPadding = 4,
  ppWidth = 8,
  strokeW = 1.5,
  gPadding = 4;

// [autores, periodos, partidos, proyectos, annos, temas];
// columns percentage
let colPercent = [0, 0, 48, 85, 98, 100];
// nodes width by column
let nWidth = [0, 24, 28, 32, 32, 5];

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
  console.clear();
  // update nodeWidth in data
  column.forEach((col, i) => {
    col.each((d) => (d.nodeWid = nWidth[i]));
  });

  let values = await getValues(sWidth, sHeigh, margen, nWidth, colPercent);

  d3.select('#sankey').attr('width', sWidth).attr('height', sHeigh);

  sankey
    .size([sWidth - values.textWid, sHeigh - margen])
    .nodePadding(nPadding)
    .margin(margen)
    .pyGroup(gPadding)
    .layersPos(values.layerPos);

  guidesY.attr('d', (d, i) => d3.line()(values.points[i]));

  graph = sankey(sData);

  links
    .selectAll('path')
    // .attr('d', d3.sankeyLinkHorizontal())
    .attr('d', (d) => sankeyLinkPath(d))
    .attr('stroke-width', (d) => d.width - 1);

  links
    .filter((d) => d.lColumn == 3)
    .selectAll('path')
    .attr('stroke-width', '0');

  // nodes
  //   .selectAll('.nBg')
  //   .attr('x', (d) => d.x0)
  //   .attr('y', (d) => d.y0 + 0.5)
  //   .attr('width', (d) => d.nodeWid)
  //   .attr('height', (d) => d.y1 - d.y0 - 1);

  nodes
    .selectAll('.nRect')
    .attr('x', (d) => d.x0)
    .attr('y', (d) => d.y0 + 0.5)
    .attr('width', (d) => (d.lColumn == 5 ? values.title5Wid : d.nodeWid))
    .attr('height', (d) => d.y1 - d.y0 - 1);

  column[1]
    .selectAll('.ppRect')
    .attr('x', (d) => d.x1 - ppWidth / 2)
    .attr('y', (d) => d.y0 - strokeW)
    .attr('rx', ppWidth / 2)
    .attr('width', ppWidth)
    .attr('height', (d) => d.y1 - d.y0 + strokeW * 2)
    .attr('stroke-width', strokeW);

  column[3].each(function (d) {
    d3.select(this)
      .selectAll('.ppRect')
      .attr('x', (d) => d.x0 - ppWidth / 2)
      .attr('y', (e, i) => d.targetLinks[i].y1 - d.targetLinks[i].width / 2)
      .attr('width', ppWidth)
      .attr('height', (e, i) => d.targetLinks[i].width)
      .attr('rx', ppWidth / 2)
      .attr('stroke-width', strokeW)
      .attr('class', (e, i) => `ppRect pp--${d.targetLinks[i].idPartido}`);
  });

  d3.selectAll('.old')
    .attr('x', '0')
    .attr('y', (d) => d.y0 + 0.5)
    .attr('width', values.title0Wid)
    .attr('height', (d) => d.y1 - d.y0 - 1);

  //
  // sData.partidos.forEach((pp) => {
  //   let points = [];

  //   column[2]
  //     .filter((d) => d.idPartido == pp)
  //     .each((d) => {
  //       let x = d.x0 + nWidth[2] / 2;
  //       points.push([
  //         [x, d.y0 - nPadding * 1.5],
  //         [x, d.y1 + nPadding * 1.5],
  //       ]);
  //     });

  //   guidesP
  //     .filter(`.pp--${pp}`)
  //     .attr('d', (d, i) => d3.line()(points[i]))
  //     .attr('stroke-width', ppWidth);
  // });

  //
  sData.partidos.forEach((pp) => {
    let points = [];

    column[2]
      .filter((d) => d.idPartido == pp)
      .each((d) => {
        let x = d.x0 + (nWidth[2] - ppWidth) / 2;
        let y = d.y0 - nPadding * 2.2;
        let h = d.y1 + nPadding * 2.2 - y;
        points.push([x, y, h]);
      });

    guidesP
      .filter(`.pp--${pp}`)
      .attr('x', (d, i) => points[i][0])
      .attr('y', (d, i) => points[i][1])
      .attr('width', ppWidth)
      .attr('height', (d, i) => points[i][2])
      .attr('rx', ppWidth / 2)
      .attr('stroke-width', strokeW);
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

  d3.selectAll([...column[1], ...column[2], ...column[3], ...column[4]])
    .selectAll('.title--value')
    .attr('x', (d) =>
      d.lColumn == 1
        ? d.x1 - ppWidth / 2 - vPadding - strokeW
        : d.lColumn == 3
        ? d.x0 + strokeW + ppWidth / 2 + vPadding
        : d.x0 + d.nodeWid / 2
    )
    .attr('y', (d) => (d.y1 + d.y0) / 2 - 0.2)
    .attr('alignment-baseline', 'central')
    .attr('text-anchor', (d) =>
      d.lColumn == 1 ? 'end' : d.lColumn == 3 ? 'start' : 'middle'
    );

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

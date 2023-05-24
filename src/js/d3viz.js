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
  years,
  gradients,
  links,
  nodes,
  partidos,
  bgLinks,
  createSankey,
} from './sankey-draw';

// Link path generator
import { sankeyLinkPath, bgLinkPath, optPath } from './sankeyLinkPath';

// join d3 libraries
const d3 = {
  ...d3Base,
  ...d3Sankey,
};

// div size observer
const vizBox = document.querySelector('#dataviz');

// set the dimensions and margins of the graph
let nPadding = 3,
  gPadding = 10,
  sWidth = 0,
  sHeigh = 0,
  optH,
  marginLeft,
  marginTop,
  marginBottom,
  letterW,
  letterH;

// [autores, periodos, partidos, proyectos, annos, temas];
// columns percentage
const colPercent = [0, 2, 38, 72, 86, 100];
// nodes width by column
const nWidth = [1.2, 5, 5, 5, 5, 0];

//
// build sankey chart
const buildSankey = async () => {
  // create elements of sankey
  await createSankey();
  // add observer to sankey container
  ro.observe(vizBox);
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

const letterUpdate = () => {
  let letter = document.querySelector('#letter').getBBox();
  letterW = Math.ceil(letter.width);
  letterH = Math.ceil(letter.height);

  console.log('letter', letterW, letterH);

  marginLeft = letterW * 4;
  optH = letterH * 4;
  sWidth > 680 ? (marginTop = letterH * 6 + optH) : (marginTop = letterH * 10 + optH);
  marginBottom = letterH;
};

//
// update graph size
const updateGraph = async () => {
  console.clear();

  await delay(300);
  await letterUpdate();

  // nWidth[0] = letterW / 5;
  nWidth[1] = letterW * 2.4;
  nWidth[2] = letterW * 2.4;
  nWidth[3] = letterW * 2.4;
  nWidth[4] = letterW * 4;
  nWidth[5] = letterW * 10;

  let values = await getValues(sWidth, marginLeft, nWidth, colPercent);

  let namePos = values.layerPos[0] - (values.textWid - marginLeft) - 6;

  let ySenado = 5,
    yCamara = 20,
    optStroke = 4;

  d3.selectAll('.optCong')
    .attr('x', namePos)
    .attr('y', (d, i) => (i == 0 ? ySenado : yCamara));

  d3.selectAll('.optText')
    .attr('x', (d, i) => values.optText[i] + 2)
    .attr('y', ySenado);

  d3.selectAll('.optPath')
    .attr('d', (d, i) => {
      let curve,
        x0 = values.optPos[0],
        x1 = values.optPos[1],
        x2 = values.optPos[2],
        y0 = ySenado,
        y1 = yCamara;
      i == 0
        ? (curve = optPath(x0, x1, x2, y0, y1 - optStroke - 1))
        : (curve = `M-1,-1M${x0},${y1}L${x2},${y1}`);

      return curve;
    })
    .attr('stroke-width', optStroke);

  let nX = 0;
  d3.selectAll('.optRect')
    .attr('x', () => {
      let posX = values.optPos[nX + 2] + 2;
      nX == 3 ? (nX = 0) : nX++;
      return posX;
    })
    .attr('y', (d, i) =>
      i < 4 ? yCamara - optStroke * 1.5 - 1 : yCamara - optStroke / 2
    )
    .attr('width', values.optPos[3] - values.optPos[2] - 2)
    .attr('height', optStroke);

  let nYear = 0;
  years
    .selectAll('.year')
    .attr('x', (d, i) => values.yearsPos[i])
    .attr('y', () => {
      let h = optH;
      sWidth > 680 ? (h += letterH * 1.4) : (h += letterH * 4);
      let posY = h + nYear * 4;
      nYear == 3 ? (nYear = 0) : nYear++;
      return posY;
    });

  let nLine = 0;
  years.selectAll('.yearLine').attr('d', (d, i) => {
    let x,
      y0,
      h = optH;
    x = values.yearsPos[i];
    sWidth > 680 ? (h += letterH * 1.8) : (h += letterH * 4.8);
    y0 = h + nLine * 4;
    nLine == 3 ? (nLine = 0) : nLine++;
    return `M-1,-1M${x},${sHeigh}L${x},${y0}`;
  });

  let titlesCol = years.selectAll('.titleCol');

  titlesCol.each(function (d, i) {
    const self = d3.select(this);
    self
      .selectAll('tspan')
      .attr('x', values.yearsPos[4 * i] - letterW * 2.5)
      .attr('text-anchor', (d, j) => {
        if (sWidth > 680) {
          if (j == 0) {
            return i == 3 ? 'start' : 'end';
          } else {
            return 'start';
          }
        } else {
          return 'start';
        }
      })
      .attr('dy', (d, j) => {
        if (j == 1) {
          if (sWidth > 680) {
            return i == 3 ? '1.4em' : 0;
          } else {
            return '1.4em';
          }
        } else {
          return 0;
        }
      })
      .attr('y', optH);
  });

  // update nodeWidth in data
  column.forEach((col, i) => {
    col.each((d) => (d.nodeWid = nWidth[i]));
  });

  // d3.select('#sankey').attr('width', sWidth).attr('height', sHeigh);

  sankey
    // .size([sWidth - values.textWid, sHeigh - marginTop - marginBottom])
    .extent([
      [0, marginTop],
      [sWidth - values.textWid, sHeigh - marginBottom],
    ])
    .nodePadding(nPadding)
    .pyGroup(gPadding)
    .layersPos(values.layerPos);

  graph = sankey(sData);

  links
    .selectAll('path')
    .attr('d', (d) => 'M-1,-1' + sankeyLinkPath(d, nPadding))
    .attr('stroke-width', (d) => d.width - 1);

  links
    .filter((d) => d.lColumn == 3)
    .selectAll('path')
    .attr('stroke-width', '0');

  bgLinks.selectAll('path').attr('d', (d) => bgLinkPath(d));

  nodes
    .selectAll('.nRect')
    .attr('x', (d) => (d.lColumn == 1 || d.lColumn == 2 ? d.x0 - 0.75 : d.x0))
    .attr('y', (d) => (d.lColumn == 2 ? d.y0 - 1.5 : d.y0 + 0.5))
    .attr('width', (d) =>
      d.lColumn == 1 || d.lColumn == 2
        ? d.nodeWid + 1.5
        : d.lColumn == 3
        ? d.nodeWid + 4
        : d.nodeWid
    )
    .attr('height', (d) =>
      d.lColumn == 0
        ? d.y1 - d.y0 - 1 + (d.sourceLinks.length - 1) * nPadding
        : d.lColumn == 2
        ? d.y1 - d.y0 + 3
        : d.lColumn == 5
        ? d.y1 - d.y0 - 1 + (d.targetLinks.length - 1) * nPadding
        : d.y1 - d.y0 - 1
    )
    .attr('stroke', 'url(#gradientYear)')
    .attr('stroke-width', '4');

  column[5]
    .selectAll('.bgTopic')
    .attr('x', values.layerPos[4])
    .attr('y', (d) => d.y0 - 24)
    .attr('width', nWidth[4] * 2)
    .attr('height', '24');

  column[3].each(function (d) {
    d3.select(this)
      .selectAll('.ppRect')
      .attr('x', (d) => d.x0 - 0.75)
      .attr('y', (e, i) => d.targetLinks[i].y1 - d.targetLinks[i].width / 2 + 0.5)
      .attr('width', (d) => d.nodeWid + 1.5)
      .attr('height', (e, i) => d.targetLinks[i].width - 1)
      .attr('class', (e, i) => `ppRect pp--${d.targetLinks[i].idPartido}`);
  });

  d3.selectAll('.old')
    .attr('x', '0')
    .attr('y', (d) => d.y0 + 0.5)
    .attr('width', values.textWid)
    .attr('height', (d) => d.y1 - d.y0 - 1 + (d.sourceLinks.length - 1) * nPadding);

  gradients
    .attr('x', (d) =>
      d.lColumn == 2 ? values.layerPos[2] - d.nodeWid * 1.5 : d.x0 - nWidth[4] + 0.5
    )
    .attr('y', (d) => d.y0 + 0.5)
    .attr('width', (d) => (d.lColumn == 2 ? d.nodeWid * 7 : nWidth[4] + 0.5))
    .attr('height', (d) =>
      d.lColumn == 5
        ? d.y1 - d.y0 - 1 + (d.targetLinks.length - 1) * nPadding
        : d.y1 - d.y0 - 1
    );

  partidos
    .selectAll('rect')
    .attr('x', values.layerPos[2])
    .attr('width', nWidth[2] * 4)
    .attr('height', nPadding * (gPadding / 2) + 6);

  sData.partidos.forEach((pp) => {
    let ys = [];
    column[2]
      .filter((d) => d.idPartido == pp.idPartido)
      .each((d) => {
        ys.push(d.y0);
      });
    let y = d3.min(ys);

    partidos
      .filter((d) => d.idPartido == pp.idPartido)
      .selectAll('rect')
      .attr('y', y - nPadding * (gPadding / 2) - 6);

    partidos
      .filter((d) => d.idPartido == pp.idPartido)
      .select('foreignObject')
      .attr('x', values.layerPos[2] - nWidth[2] * 0.75)
      .attr('y', y - nPadding * (gPadding / 2) - 1)
      .attr('width', nWidth[2] * 5.5)
      .attr('height', nPadding * (gPadding / 2));
  });

  // add in the title for the nodes
  column[0]
    .selectAll('text')
    .attr('x', namePos)
    .attr('y', (d) => (d.y1 + d.y0) / 2 + ((d.sourceLinks.length - 1) * nPadding) / 2);

  d3.selectAll('.title--value')
    .attr('x', (d) => (d.lColumn == 5 ? d.x0 + 6 : d.x0 + d.nodeWid / 2))
    .attr('y', (d) =>
      d.lColumn == 5
        ? (d.y1 + d.y0) / 2 + ((d.targetLinks.length - 1) * nPadding) / 2
        : (d.y1 + d.y0) / 2
    );

  column[5]
    .selectAll('.title--topic')
    .attr('x', values.layerPos[4] - letterW)
    .attr('y', (d) => d.y0 - 8);

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

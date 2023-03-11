import * as d3 from './d3.min';
import { sTooltip, delay } from './sankey-draw';
//

let where = ['source', 'target'],
  whereR = ['target', 'source'];

let alphaTip = 0.9;

// links mousover nodeslighting
const linksConnect = (id) => {
  let prev = [],
    next = [],
    np = [next, prev],
    flow = [];

  let linkSel = d3.select(`#${id}`);

  linkSel.each((d) => {
    flow.push(`#${d.id}`);
    where.forEach((x, i) => {
      np[i].push(d[whereR[i]]);
      flow.push(`#node${d[whereR[i]].id}`);

      let news = [];

      while (np[i].length) {
        news = [];

        np[i].forEach((d) => {
          d[`${x}Links`].forEach((e) => {
            flow.push(`#${e.id}`);
            news.push(e[whereR[i]]);
            flow.push(`#node${e[whereR[i]].id}`);
          });
        });
        np[i] = news;
      }
    });
  });
  return flow;
};

//
// nodes connections by flow levels
const nodesConnect = (id) => {
  let prev = [],
    next = [],
    np = [next, prev],
    flow = [];

  let nodeSel = d3.select(`#node${id}`);

  nodeSel.each((d) => {
    where.forEach((x, i) => {
      d[`${x}Links`].forEach((e) => {
        flow.push({ level: 0, id: `#${e.id}` });
        np[i].push(e[whereR[i]]);
      });

      let n = 0,
        news = [];

      while (np[i].length) {
        news = [];
        n++;
        np[i].forEach((d) => {
          flow.push({ level: n, id: `#node${d.id}` });
          d[`${x}Links`].forEach((e) => {
            flow.push({ level: n + 1, id: `#${e.id}` });
            news.push(e[whereR[i]]);
          });
        });
        np[i] = news;
        n++;
      }
    });
  });

  // unique nodes by 'value'
  flow = Array.from([...new Map(flow.map((obj) => [obj['id'], obj])).values()]);

  // result sort by level
  flow.sort((a, b) => a.level - b.level);

  flow = d3.group(
    flow,
    (d) => d.level,
    (d) => d.id
  );

  // array by node with levels nodes & link
  flow = Array.from(flow, (entry) => Array.from(entry[1].keys()));

  return flow;
};

async function highlight_flow() {
  let nodeSel = d3.select(this),
    levelTime = 200,
    active;

  d3.selectAll('.node').on('click', null);

  if (nodeSel.classed('fixed')) {
    d3.selectAll('.node').classed('fixed fixed2', false);
    d3.selectAll('.link').classed('fixed2', false);
  } else {
    d3.selectAll('.node').classed('fixed fixed2', false);
    d3.selectAll('.link').classed('fixed2', false);
    nodeSel.classed('fixed', true);

    await delay(levelTime);

    nodeSel.each(async (d) => {
      active = (d.connect.length + 3) * levelTime;
      for (let level of d.connect) {
        await delay(levelTime);
        for (let item of level) {
          d3.select(item).classed('fixed2', true);
        }
      }
    });
  }
  await delay(active);
  d3.selectAll('.node').on('click', highlight_flow);
}

//
//
// mousemove links
const moveLinks = (e, d) => {
  let wBody = document.body.offsetWidth;
  let xRelative = (e.x / wBody) * 100;

  document.documentElement.style.setProperty('--mouse-x', xRelative);

  sTooltip.style('left', `${e.x}px`).style('top', `${e.y - 3}px`);
};

// mouseover links
const overLinks = (e, d) => {
  for (let link of d.connect) {
    d3.select(link).classed('over', true);
  }

  switch (d.lColumn) {
    case 1:
      sTooltip
        .style('opacity', alphaTip)
        .select('#sTooltip--content')
        .html(
          `<div class="para--${d.paraPol}"></div>
          <div class="tipContent">
          ${d.autor}<br>
          ${d.partido}<br>
          ${d.congreso}<br>
          ${d.periodo}<br>
          <span class="idProject">#${d.idProyecto}</span><br>
          <span class="project-ellipsis">${d.proyecto}</span>
          ${d.tema}
          </div>`
        );
      break;
    default:
      sTooltip.style('opacity', 0);
      break;
  }
};

// mouseout links
const outLinks = (e, d) => {
  for (let link of d.connect) {
    d3.select(link).classed('over', false);
  }
  sTooltip.style('opacity', 0);
};

// mousemove nodes
const moveNodes = (e, d) => {
  let wBody = document.body.offsetWidth;
  let xRelative = (e.x / wBody) * 100;
  document.documentElement.style.setProperty('--mouse-x', xRelative);

  sTooltip.style('left', `${e.x}px`);
};

// mouseover nodes
const overNodes = (e, d) => {
  let content,
    ySankey = document.querySelector('#dataviz').offsetTop;
  switch (d.lColumn) {
    case 0:
      content = `<div class="para--${d.paraPol}"></div>
        <div class="tipContent">
        <b>${d.nombre} ${d.apellido}</b><br>
        ${d.anno.join(', ')}<br>
        ${d.value} proyectos
        </div>`;
      break;
    case 1:
      content = `<div class="para--${d.paraPol}"></div>
        <div class="tipContent">
        <b>${d.nombre}</b><br>
        ${d.periodo}<br>
        ${d.value} proyectos<br>
        ${d.congreso}<br>
        ${d.partido}<br>
        </div>`;
      break;
    case 2:
      content = `<div class="para--${d.paraPol}"></div>
        <div class="tipContent">
        <span class="idProject">#${d.id}</span><br>
        <span class="project-ellipsis">${d.proyecto}</span>
        ${d.periodo}<br>
        ${d.value} autores<br>
        Tema: ${d.tema}<br>
        </div>`;
      break;
    case 3:
      content = `<div class="para--${d.paraPol}"></div>
        <div class="tipContent">
        <b>${d.tema}</b><br>
        ${d.periodo}<br>
        ${d.value} proyectos<br>
        </div>`;
      break;
    case 4:
      content = `<div class="para--${d.paraPol}"></div>
        <div class="tipContent">
        <b>${d.tema}</b><br>
        ${d.value} proyectos<br>
        </div>`;
      break;
  }

  sTooltip
    .style('opacity', alphaTip)
    .style('top', `${d.y0 + ySankey + 4}px`)
    .select('#sTooltip--content')
    .html(content);
};

// mouseout node
const outNodes = (e) => {
  sTooltip.style('opacity', 0);
};

export {
  linksConnect,
  nodesConnect,
  moveNodes,
  overNodes,
  outNodes,
  moveLinks,
  overLinks,
  outLinks,
  highlight_flow,
  linkTooltip,
};

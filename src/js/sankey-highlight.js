import * as d3 from './d3.min';
//

let where = ['source', 'target'],
  whereR = ['target', 'source'];

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

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

// mouseover highlighting ON links flow
function overlink() {
  let links = d3.select(this);
  links.each((d) => {
    links = d.connect;
  });
  for (let link of links) {
    d3.select(link).classed('over', true);
  }
}
// mouseout highlighting OFF links flow
function outlink() {
  let links = d3.select(this);
  links.each((d) => {
    links = d.connect;
  });
  for (let link of links) {
    d3.select(link).classed('over', false);
  }
}

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

export { linksConnect, nodesConnect, highlight_flow, overlink, outlink };

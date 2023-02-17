import * as d3 from './d3.min';
//

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

// nodes highlighting by flow levels
const nodeslight = (id) => {
  let prev = [],
    next = [],
    where = ['source', 'target'],
    whereR = ['target', 'source'],
    np = [next, prev],
    flow = [];

  let nodeSel = d3.select(`#${id}`);

  nodeSel.each((d) => {
    where.forEach((x, i) => {
      d[`${x}Links`].forEach((e) => {
        flow.push({ nivel: 0, id: e.id });
        np[i].push(e[whereR[i]]);
      });

      let n = 0,
        news = [];

      while (np[i].length) {
        news = [];
        n++;
        np[i].forEach((d) => {
          flow.push({ nivel: n, id: `node${d.id}` });
          d[`${x}Links`].forEach((e) => {
            flow.push({ nivel: n + 1, id: e.id });
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

  flow.sort((a, b) => a.nivel - b.nivel);

  flow = d3.group(
    flow,
    (d) => d.nivel,
    (d) => d.id
  );

  // array with the years of each node + order
  flow = Array.from(flow, (entry) => Array.from(entry[1].keys()));

  return flow;
};

const highlight_flow = async (id, source) => {
  await delay(50);
  d3.select(`#${id}`).classed('fixed', true);
  await delay(200);
  d3.select(`#node${source}`).classed('fixed2', true);
};

// links mousover nodeslighting
const linksConnect = (id) => {
  let prevLinks = [],
    newPrev = [],
    nextLinks = [],
    newNext = [],
    linksId = [];

  let linkSel = d3.select(`#${id}`);

  linkSel.each((d) => {
    prevLinks.push(d.source);
    nextLinks.push(d.target);
    linksId.push(`#${d.id}`);
  });

  while (nextLinks.length || prevLinks.length) {
    newNext = [];
    newPrev = [];
    nextLinks.forEach((d) => {
      d['sourceLinks'].forEach((e) => {
        newNext.push(e.target);
        linksId.push(`#${e.id}`);
      });
    });
    nextLinks = newNext;
    prevLinks.forEach((d) => {
      d['targetLinks'].forEach((e) => {
        newPrev.push(e.source);
        linksId.push(`#${e.id}`);
      });
    });
    prevLinks = newPrev;
  }
  return linksId;
};

const overlinks = (links) => {
  for (let link of links) {
    d3.select(link).classed('over', true);
  }
};
const outlinks = (links) => {
  for (let link of links) {
    d3.select(link).classed('over', false);
  }
};

export { nodeslight, linksConnect, overlinks, outlinks };

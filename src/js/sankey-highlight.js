import * as d3 from './d3.min';
//

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

async function hightlight() {
  let prevNodes = [],
    prevNew = [],
    nextNodes = [],
    nextNew = [];

  let nSel = d3.select(this);

  // nSel.classed('fixed', !nSel.classed('fixed'));

  if (nSel.classed('fixed')) {
    d3.selectAll('.node').classed('fixed fixed2', false);
    d3.selectAll('.link').classed('fixed', false);
  } else {
    d3.selectAll('.node').classed('fixed fixed2', false);
    d3.selectAll('.link').classed('fixed', false);
    nSel.classed('fixed', true);

    await delay(100);

    nSel.each((d) => {
      d['targetLinks'].forEach((e) => {
        prevNodes.push(e.source);
        highlight_flow(e.id, e.source['id']);
      });
      d['sourceLinks'].forEach((e) => {
        nextNodes.push(e.target);
        highlight_flow(e.id, e.target['id']);
      });
    });

    await delay(500);

    while (nextNodes.length || prevNodes.length) {
      nextNew = [];
      prevNew = [];
      nextNodes.forEach((d) => {
        d['sourceLinks'].forEach((e) => {
          nextNew.push(e.target);
          highlight_flow(e.id, e.target['id']);
        });
      });
      nextNodes = nextNew;
      prevNodes.forEach((d) => {
        d['targetLinks'].forEach((e) => {
          prevNew.push(e.source);
          highlight_flow(e.id, e.source['id']);
        });
      });
      prevNodes = prevNew;
      await delay(200);
    }
  }
}
const highlight_flow = async (id, source) => {
  await delay(50);
  d3.select(`#link${id}`).classed('fixed', true);
  await delay(200);
  d3.select(`#node${source}`).classed('fixed2', true);
};

export { hightlight };

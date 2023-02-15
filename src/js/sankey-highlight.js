import * as d3 from './d3.min';
//

function hightlight() {
  let prevNodes = [],
    prevNew = [],
    nextNodes = [],
    nextNew = [];

  let nSel = d3.select(this);

  d3.selectAll('.node').classed('fixed', false);
  d3.selectAll('.link').classed('fixed', false);

  nSel.classed('fixed', !nSel.classed('fixed'));

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
  }
}

function highlight_flow(id, source) {
  d3.select(`#node${source}`).classed('fixed', true);
  d3.select(`#link${id}`).classed('fixed', true);
}

export { hightlight };

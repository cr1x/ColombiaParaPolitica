import * as d3 from './d3.min';
//
// Thanks! Ian Johnson https://observablehq.com/@enjalot
// Weird Sankey Links: https://observablehq.com/@enjalot/weird-sankey-links
//
//
// const sankeyLinkPath = (link) => {
//   let offset = 0;
//
//   let sx = link.source.x1,
//     tx = link.target.x0,
//     sy0 = link.y0 + 0.5 - link.width / 2,
//     sy1 = link.y0 - 0.5 + link.width / 2,
//     ty0 = link.y1 + 0.5 - link.width / 2,
//     ty1 = link.y1 - 0.5 + link.width / 2;
//
//   let halfx = (tx - sx) / 2;
//
//   let path = d3.path();
//   path.moveTo(sx, sy0);
//
//   let cpx1 = sx + halfx,
//     cpy1 = sy0 + offset,
//     cpx2 = sx + halfx,
//     cpy2 = ty0 - offset;
//
//   path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, tx, ty0);
//   path.lineTo(tx, ty1);
//
//   cpx1 = sx + halfx;
//   cpy1 = ty1 - offset;
//   cpx2 = sx + halfx;
//   cpy2 = sy1 + offset;
//   path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, sx, sy1);
//   path.lineTo(sx, sy0);
//
//   return path.toString();
// };

const sankeyLinkPath = (link) => {
  let stepSize = 16;
  let sx = link.source.x1,
    tx = link.target.x0,
    sy0 = link.y0,
    ty0 = link.y1;

  let halfx = (tx - sx) / 2;

  let path = d3.path();
  path.moveTo(sx, sy0);

  let cpx1 = sx + halfx,
    cpy1 = sy0,
    cpx2 = sx + halfx,
    cpy2 = ty0;

  path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, tx, ty0);
  path = path.toString();

  let pat = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pat.setAttribute('d', path);

  let count = Math.floor(pat.getTotalLength() / stepSize + 1);
  let points = Array.from(Array(count), (_, i) => i + 1).map((i) => {
    return pat.getPointAtLength(i * stepSize);
  });
  let initialOffset = pat.getPointAtLength(0);

  return `M ${initialOffset.x} ${initialOffset.y} ${points
    .map(({ x, y }) => `L ${x} ${y}`)
    .join(' ')}`;
};

// links patterns
let patternC1 = d3
  .select('defs')
  .append('pattern')
  .attr('id', 'patternC1')
  .attr('class', 'pattern--c1')
  .attr('width', '8')
  .attr('height', '8')
  .attr('patternUnits', 'userSpaceOnUse')
  .attr('patternTransform', 'rotate(60)')
  .append('rect')
  .attr('width', '4')
  .attr('height', '8')
  .attr('transform', 'translate(0,0)');

let patternC2 = d3
  .select('defs')
  .append('pattern')
  .attr('id', 'patternC2')
  .attr('class', 'pattern--c2')
  .attr('width', '8')
  .attr('height', '8')
  .attr('patternUnits', 'userSpaceOnUse')
  .attr('patternTransform', 'rotate(-60)')
  .append('rect')
  .attr('width', '4')
  .attr('height', '8')
  .attr('transform', 'translate(0,0)');

// links patterns
let markerC1 = d3
  .select('defs')
  .append('marker')
  .attr('id', 'markerC1')
  .attr('class', 'marker--c1')
  .attr('viewBox', '0 0 20 20')
  .attr('refX', '10')
  .attr('refY', '10')
  .attr('markerUnits', 'userSpaceOnUse')
  .attr('markerWidth', '20')
  .attr('markerHeight', '20')
  .attr('orient', 'auto')
  .attr('fill', '#49f')
  .append('path')
  .attr('d', 'M0 0 10 0 20 10 10 20 0 20 10 10Z');

export { sankeyLinkPath };

export function subdividePath(path, stepSize = 16) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', path);
  const count = Math.floor(p.getTotalLength() / stepSize + 1);
  const points = Array.from(Array(count), (_, i) => i + 1).map((i) => {
    return p.getPointAtLength(i * stepSize);
  });
  const initialOffset = p.getPointAtLength(0);
  return `M ${initialOffset.x} ${initialOffset.y} ${points
    .map(({ x, y }) => `L ${x} ${y}`)
    .join(' ')}`;
}

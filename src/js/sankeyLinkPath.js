import * as d3 from './d3.min';
//
// Thanks! Ian Johnson https://observablehq.com/@enjalot
// Weird Sankey Links: https://observablehq.com/@enjalot/weird-sankey-links
//
//
const sankeyLinkPath = (link) => {
  let offset = 0;

  let sx = link.source.x1,
    tx = link.target.x0,
    sy0 = link.y0 + 0.5 - link.width / 2,
    sy1 = link.y0 - 0.5 + link.width / 2,
    ty0 = link.y1 + 0.5 - link.width / 2,
    ty1 = link.y1 - 0.5 + link.width / 2;

  let halfx = (tx - sx) / 2;

  let path = d3.path();
  path.moveTo(sx, sy0);

  let cpx1 = sx + halfx + 5,
    cpy1 = sy0 + offset,
    cpx2 = sx + halfx + 5,
    cpy2 = ty0 - offset;

  path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, tx, ty0);
  path.lineTo(tx, ty1);

  cpx1 = sx + halfx;
  cpy1 = ty1 - offset;
  cpx2 = sx + halfx;
  cpy2 = sy1 + offset;
  path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, sx, sy1);
  path.lineTo(sx, sy0);

  return path.toString();
};

const lineW = '2';
const lineH = '6';
const rotate = '10';

const patternC1 = d3
  .select('defs')
  .append('pattern')
  .attr('id', 'patternC1')
  .attr('width', lineH)
  .attr('height', lineH)
  .attr('patternUnits', 'userSpaceOnUse')
  .attr('patternTransform', `rotate(${rotate})`)
  .append('rect')
  .attr('width', lineW)
  .attr('height', lineH)
  .attr('fill', 'white');

const maskC1 = d3
  .select('defs')
  .append('mask')
  .attr('id', 'maskC1')
  .append('rect')
  .attr('width', '100%')
  .attr('height', '100%')
  .attr('fill', 'url(#patternC1)');

const patternC2 = d3
  .select('defs')
  .append('pattern')
  .attr('id', 'patternC2')
  .attr('width', lineH)
  .attr('height', lineH)
  .attr('patternUnits', 'userSpaceOnUse')
  .attr('patternTransform', `rotate(-${rotate})`)
  .append('rect')
  .attr('width', lineW)
  .attr('height', lineH)
  .attr('fill', 'white');

const maskC2 = d3
  .select('defs')
  .append('mask')
  .attr('id', 'maskC2')
  .append('rect')
  .attr('width', '100%')
  .attr('height', '100%')
  .attr('fill', 'url(#patternC2)');

export { sankeyLinkPath };

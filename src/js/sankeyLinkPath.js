import * as d3 from './d3.min';
//
// Thanks! Ian Johnson https://observablehq.com/@enjalot
// Weird Sankey Links: https://observablehq.com/@enjalot/weird-sankey-links
//
//
const sankeyLinkPath = (link) => {
  let sX = link.source.x1,
    tX = link.target.x0,
    sY = link.y0,
    tY = link.y1;

  let path = d3.path();
  path.moveTo(sX, sY);

  switch (link.lColumn) {
    case 0:
    case 4:
      path.lineTo(tX, tY);
      break;
    case 1:
    case 2:
      {
        let xHalf = (tX - sX) / 2,
          cpx1 = sX + xHalf,
          cpx2 = sX + xHalf,
          sWid = link.source.nodeWid,
          tWid = link.target.nodeWid,
          sX2,
          tX2;

        switch (link.source.fix) {
          case 0:
            sX2 = sX + sWid * 2;
            cpx1 = cpx1 + sWid * 2;
            cpx2 = cpx2 + tWid;
            path.lineTo(sX2, sY);
            path.bezierCurveTo(cpx1, sY, cpx2, tY, tX, tY);
            break;
          case 1:
            sX2 = sX + sWid;
            tX2 = tX - tWid;
            path.lineTo(sX2, sY);
            path.bezierCurveTo(cpx1, sY, cpx2, tY, tX2, tY);
            path.lineTo(tX, tY);
            break;
          case 2:
            sX2 = sX + sWid;
            tX2 = tX - tWid;
            path.lineTo(sX2, sY);
            path.bezierCurveTo(cpx1, sY, cpx2, tY, tX2, tY);
            path.lineTo(tX, tY);
            break;
          case 3:
            cpx1 = cpx1 - sWid;
            cpx2 = cpx2 - tWid * 2;
            tX2 = tX - tWid * 2;
            path.bezierCurveTo(cpx1, sY, cpx2, tY, tX2, tY);
            path.lineTo(tX, tY);
            break;
        }
      }
      break;
    case 3:
      {
        let xHalf = (tX - sX) / 2,
          cpx1 = sX + xHalf,
          cpx2 = sX + xHalf;

        path.bezierCurveTo(cpx1, sY, cpx2, tY, tX, tY);
      }
      break;
  }

  return path.toString();
};

export { sankeyLinkPath };

import * as d3 from './d3.min';
//
// Thanks! Ian Johnson https://observablehq.com/@enjalot
// Weird Sankey Links: https://observablehq.com/@enjalot/weird-sankey-links
//
//
const sankeyLinkPath = (link) => {
  let sX = link.source.x1,
    sY = link.y0,
    sW = link.source.nodeWid,
    tX = link.target.x0,
    tY = link.y1,
    tW = link.target.nodeWid,
    sX2 = sX,
    tX2 = tX;

  let half, cpx1, sY0, sY1, tY0, tY1;

  let path = d3.path();
  path.moveTo(sX, sY);

  switch (link.lColumn) {
    case 0:
    case 4:
      path.lineTo(tX, tY);
      break;
    case 1:
      {
        switch (link.source.fix) {
          case 0:
            sX2 += sW * 3;
            tX2 -= tW;
            break;
          case 1:
            sX2 += sW * 2;
            tX2 -= tW * 2;
            break;
          case 2:
            sX2 += sW;
            tX2 -= tW * 2;
            break;
          case 3:
            // sX2 = sX;
            tX2 -= tW * 3;
            break;
        }
        half = (tX2 - sX2) / 2;
        cpx1 = sX2 + half;

        path.lineTo(sX2, sY);
        path.bezierCurveTo(cpx1, sY, cpx1, tY, tX2, tY);
        path.lineTo(tX, tY);
      }
      break;
    case 2:
      {
        switch (link.source.fix) {
          case 0:
            sX2 += sW * 3;
            break;
          case 1:
            sX2 += sW * 2;
            tX2 -= tW;
            break;
          case 2:
            sX2 += sW;
            tX2 -= tW;
            break;
          case 3:
            sX2 += sW;
            tX2 -= tW * 2;
            break;
        }
        half = (tX2 - sX2) / 2;
        cpx1 = sX2 + half;

        path.lineTo(sX2, sY);
        path.bezierCurveTo(cpx1, sY, cpx1, tY, tX2, tY);
        path.lineTo(tX, tY);
      }
      break;
    case 3:
      {
        switch (link.source.fix) {
          case 0:
            sX2 += sW * 2.5;
            break;
          case 1:
            sX2 += sW;
            break;
          case 2:
            sX2 += sW / 2;
            break;
        }

        sY0 = link.source.y0 + 0.5;
        sY1 = link.source.y1 - 0.5;
        tY0 = link.y1 - link.width / 2 + 0.5;
        tY1 = link.y1 + link.width / 2 - 0.5;
        half = (tX - sX2) / 2;
        cpx1 = sX2 + half;

        path.moveTo(sX, sY0);
        path.lineTo(sX2, sY0);
        path.bezierCurveTo(cpx1, sY0, cpx1, tY0, tX, tY0);
        path.lineTo(tX, tY1);
        path.bezierCurveTo(cpx1, tY1, cpx1, sY1, sX2, sY1);
        path.lineTo(sX, sY1);
        path.closePath();
      }
      break;
  }

  return path.toString();
};

export { sankeyLinkPath };

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
    tW = link.target.nodeWid;

  let path = d3.path();
  path.moveTo(sX, sY);

  switch (link.lColumn) {
    case 0:
    case 4:
      path.lineTo(tX, tY);
      break;
    case 1:
      switch (link.source.fix) {
        case 0:
          {
            let sX2 = sX + sW * 3;
            let tX2 = tX - tW;
            let half = (tX2 - sX2) / 2;
            let cpx1 = sX2 + half;
            path.lineTo(sX2, sY);
            path.bezierCurveTo(cpx1, sY, cpx1, tY, tX2, tY);
            path.lineTo(tX, tY);
          }
          break;
        case 1:
          {
            let sX2 = sX + sW * 2;
            let tX2 = tX - tW * 2;
            let half = (tX2 - sX2) / 2;
            let cpx1 = sX2 + half;
            path.lineTo(sX2, sY);
            path.bezierCurveTo(cpx1, sY, cpx1, tY, tX2, tY);
            path.lineTo(tX, tY);
          }
          break;
        case 2:
          {
            let sX2 = sX + sW;
            let tX2 = tX - tW * 2;
            let half = (tX2 - sX2) / 2;
            let cpx1 = sX2 + half;
            path.lineTo(sX2, sY);
            path.bezierCurveTo(cpx1, sY, cpx1, tY, tX2, tY);
            path.lineTo(tX, tY);
          }
          break;
        case 3:
          {
            let sX2 = sX;
            let tX2 = tX - tW * 3;
            let half = (tX2 - sX2) / 2;
            let cpx1 = sX2 + half;
            path.lineTo(sX2, sY);
            path.bezierCurveTo(cpx1, sY, cpx1, tY, tX2, tY);
            path.lineTo(tX, tY);
          }
          break;
      }
      break;
    case 2:
      switch (link.source.fix) {
        case 0:
          {
            let sX2 = sX + sW * 3;
            let tX2 = tX;
            let half = (tX2 - sX2) / 2;
            let cpx1 = sX2 + half;
            path.lineTo(sX2, sY);
            path.bezierCurveTo(cpx1, sY, cpx1, tY, tX2, tY);
            path.lineTo(tX, tY);
          }
          break;
        case 1:
          {
            let sX2 = sX + sW * 2;
            let tX2 = tX - tW;
            let half = (tX2 - sX2) / 2;
            let cpx1 = sX2 + half;
            path.lineTo(sX2, sY);
            path.bezierCurveTo(cpx1, sY, cpx1, tY, tX2, tY);
            path.lineTo(tX, tY);
          }
          break;
        case 2:
          {
            let sX2 = sX + sW;
            let tX2 = tX - tW;
            let half = (tX2 - sX2) / 2;
            let cpx1 = sX2 + half;
            path.lineTo(sX2, sY);
            path.bezierCurveTo(cpx1, sY, cpx1, tY, tX2, tY);
            path.lineTo(tX, tY);
          }
          break;
        case 3:
          {
            let sX2 = sX + sW;
            let tX2 = tX - tW * 2;
            let half = (tX2 - sX2) / 2;
            let cpx1 = sX2 + half;
            path.lineTo(sX2, sY);
            path.bezierCurveTo(cpx1, sY, cpx1, tY, tX2, tY);
            path.lineTo(tX, tY);
          }
          break;
      }
      break;
    case 3:
      switch (link.source.fix) {
        case 0:
          {
            let sX2 = sX + sW * 2;
            let sY0 = link.source.y0 + 0.5;
            let sY1 = link.source.y1 - 0.5;
            let tY0 = link.y1 - link.width / 2 + 0.5;
            let tY1 = link.y1 + link.width / 2 - 0.5;
            let half = (tX - sX2) / 2;
            let cpx1 = sX2 + half;
            path.moveTo(sX, sY0);
            path.bezierCurveTo(cpx1, sY0, cpx1, tY0, tX, tY0);
            path.lineTo(tX, tY1);
            path.bezierCurveTo(cpx1, tY1, cpx1, sY1, sX, sY1);
            path.closePath();
          }
          break;
        case 1:
          {
            let sX2 = sX + sW * 2;
            let sY0 = link.source.y0 + 0.5;
            let sY1 = link.source.y1 - 0.5;
            let tY0 = link.y1 - link.width / 2 + 0.5;
            let tY1 = link.y1 + link.width / 2 - 0.5;
            let half = (tX - sX2) / 2;
            let cpx1 = sX2 + half;
            path.moveTo(sX, sY0);
            path.bezierCurveTo(cpx1, sY0, cpx1, tY0, tX, tY0);
            path.lineTo(tX, tY1);
            path.bezierCurveTo(cpx1, tY1, cpx1, sY1, sX, sY1);
            path.closePath();
          }
          break;
        case 2:
          {
            let sX2 = sX + sW;
            let sY0 = link.source.y0 + 0.5;
            let sY1 = link.source.y1 - 0.5;
            let tY0 = link.y1 - link.width / 2 + 0.5;
            let tY1 = link.y1 + link.width / 2 - 0.5;
            let half = (tX - sX2) / 2;
            let cpx1 = sX2 + half;
            path.moveTo(sX, sY0);
            path.bezierCurveTo(cpx1, sY0, cpx1, tY0, tX, tY0);
            path.lineTo(tX, tY1);
            path.bezierCurveTo(cpx1, tY1, cpx1, sY1, sX, sY1);
            path.closePath();
          }
          break;
        case 3:
          {
            let sY0 = link.source.y0 + 0.5;
            let sY1 = link.source.y1 - 0.5;
            let tY0 = link.y1 - link.width / 2 + 0.5;
            let tY1 = link.y1 + link.width / 2 - 0.5;
            let half = (tX - sX) / 2;
            let cpx1 = sX + half;
            path.moveTo(sX, sY0);
            path.bezierCurveTo(cpx1, sY0, cpx1, tY0, tX, tY0);
            path.lineTo(tX, tY1);
            path.bezierCurveTo(cpx1, tY1, cpx1, sY1, sX, sY1);
            path.closePath();
            // path.lineTo(sX, sY0);
          }
          break;
      }
      break;
  }

  return path.toString();
};

export { sankeyLinkPath };

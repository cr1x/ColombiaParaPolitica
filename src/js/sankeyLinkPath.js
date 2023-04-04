import * as d3 from './d3.min';
//
// Thanks! Ian Johnson https://observablehq.com/@enjalot
// Weird Sankey Links: https://observablehq.com/@enjalot/weird-sankey-links
//
//
const sankeyLinkPath = (link) => {
  let sX0 = link.source.x1,
    sY0 = link.y0,
    sW = link.source.nodeWid,
    tX0 = link.target.x0,
    tY0 = link.y1,
    tW = link.target.nodeWid,
    sX2 = sX0,
    tX2 = tX0,
    mid,
    linkCurve,
    points = [];

  const path = d3.path();
  const curve = d3.line().curve(d3.curveBasis);

  switch (link.lColumn) {
    case 0:
    case 4:
      path.moveTo(sX0, sY0);
      path.lineTo(tX0, tY0);
      linkCurve = path.toString();
      break;
    case 1:
      switch (link.source.fix) {
        case 0:
          sX2 += sW * 4.5;
          tX2 -= tW * 1.5;
          break;
        case 1:
          sX2 += sW * 3.5;
          tX2 -= tW * 2.5;
          break;
        case 2:
          sX2 += sW * 2.5;
          tX2 -= tW * 3.5;
          break;
        case 3:
          sX2 += sW * 1.5;
          tX2 -= tW * 4.5;
          break;
      }
      points = [
        [sX0, sY0],
        [sX2, sY0],
        [sX2, sY0],
        [tX2, tY0],
        [tX2, tY0],
        [tX0, tY0],
      ];
      linkCurve = curve(points);
      break;
    case 2:
      switch (link.source.fix) {
        case 0:
          sX2 += sW * 4;
          break;
        case 1:
          sX2 += sW * 3;
          tX2 -= tW;
          break;
        case 2:
          sX2 += sW * 2;
          tX2 -= tW * 2;
          break;
        case 3:
          sX2 += sW;
          tX2 -= tW * 3;
          break;
      }
      mid = sX2 + (tX2 - sX2) / 2;

      path.moveTo(sX0, sY0);
      path.lineTo(sX2, sY0);
      path.bezierCurveTo(mid, sY0, mid, tY0, tX2, tY0);
      path.lineTo(tX0, tY0);
      linkCurve = path.toString();
      break;
    case 3:
      {
        switch (link.source.fix) {
          case 0:
            sX2 = sX0 + sW * 2;
            break;
          case 1:
            sX2 = sX0 + sW;
            break;
          case 2:
            sX2 = sX0 + sW;
            break;
        }

        sY0 = link.source.y0 + 0.5;
        sY1 = link.source.y1 - 0.5;
        tY0 = link.y1 - link.width / 2 + 0.5;
        tY1 = link.y1 + link.width / 2 - 0.5;
        mid = sX2 + (tX0 - sX2) / 2;

        path.moveTo(sX0, sY0);
        path.lineTo(sX2, sY0);
        path.bezierCurveTo(mid, sY0, mid, tY0, tX0, tY0);
        path.lineTo(tX0, tY1);
        path.bezierCurveTo(mid, tY1, mid, sY1, sX2, sY1);
        path.lineTo(sX0, sY1);
        path.closePath();

        linkCurve = path.toString();
      }
      break;
  }

  return linkCurve;
};

const bgLinkPath = (data) => {
  let sX0 = data.x1,
    sY0 = data.y0 + 0.5,
    sY1 = data.y1 - 0.5,
    sW = data.nodeWid,
    sH = sY1 - sY0,
    tX0 = data.sourceLinks[0].target.x0,
    tY0 = data.sourceLinks[0].y1 - data.sourceLinks[0].width / 2 + 0.5,
    tW = data.sourceLinks[0].target.nodeWid,
    sX2 = sX0,
    tX2 = tX0,
    points = [];

  const area = d3
    .area()
    .x((p) => p.xP)
    .y0((p) => p.yP0)
    .y1((p) => p.yP1)
    .curve(d3.curveBasis);

  switch (data.fix) {
    case 0:
      sX2 += sW * 4.5;
      tX2 -= tW * 1.5;
      break;
    case 1:
      sX2 += sW * 3.5;
      tX2 -= tW * 2.5;
      break;
    case 2:
      sX2 += sW * 2.5;
      tX2 -= tW * 3.5;
      break;
    case 3:
      sX2 += sW * 1.5;
      tX2 -= tW * 4.5;
      break;
  }

  points = [
    { xP: sX0, yP0: sY0, yP1: sY0 + sH },
    { xP: sX2, yP0: sY0, yP1: sY0 + sH },
    { xP: sX2, yP0: sY0, yP1: sY0 + sH },
    { xP: tX2, yP0: tY0, yP1: tY0 + sH },
    { xP: tX2, yP0: tY0, yP1: tY0 + sH },
    { xP: tX0, yP0: tY0, yP1: tY0 + sH },
  ];

  return area(points);
};

export { sankeyLinkPath, bgLinkPath };

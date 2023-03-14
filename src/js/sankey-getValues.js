import * as d3 from './d3.min';

let title0Wid, title5Wid, textWid, wTotal;

// calc percentage function
const calcPercent = (percentage) => Math.floor((wTotal / 100) * percentage) + title0Wid;

// get max width of autor titles & tema titles
const getValues = (sWidth, sHeigh, sMargin, nWidth, colPercent, ppWidth, vPadding) => {
  let titles0 = [],
    titles5 = [],
    points = [];

  d3.selectAll('.node')
    .filter((d) => d.depth === 0)
    .selectAll('text')
    .each(function () {
      titles0.push(Math.ceil(this.getBBox().width));
    });
  d3.selectAll('.node')
    .filter((d) => d.depth === 5)
    .selectAll('text')
    .each(function () {
      titles5.push(Math.ceil(this.getBBox().width));
    });

  // max text width column[0]
  title0Wid = d3.max(titles0) + sMargin;
  // max text width column[4]
  title5Wid = d3.max(titles5) + sMargin * 2;
  // title0Wid + max text width column[4]
  textWid = title0Wid + title5Wid;
  // total width
  wTotal = sWidth - textWid;

  let layerPos = new Array(
    calcPercent(colPercent[0]),
    calcPercent(colPercent[1]),
    calcPercent(colPercent[2]) - nWidth[2] * 4,
    calcPercent(colPercent[3]) - nWidth[2] * 4,
    calcPercent(colPercent[4]) - nWidth[4],
    calcPercent(colPercent[5])
  );

  let gLayers = [layerPos[1], layerPos[2], layerPos[3]];

  // guides position "4" by layer
  for (let i = 0; i < gLayers.length; ++i) {
    for (let j = 0; j < 4; ++j) {
      let x, line;

      switch (i) {
        case 0:
          x = gLayers[i] + (nWidth[i + 1] - ppWidth - vPadding) / 2 + nWidth[i + 1] * j;
          break;
        case 1:
          x = gLayers[i] + (nWidth[i + 1] - ppWidth - vPadding) / 2 + nWidth[i + 1] * j;
          break;
        case 2:
          x = gLayers[i] + (nWidth[i + 1] + ppWidth + vPadding) / 2 + nWidth[i + 1] * j;
          break;
      }

      line = [
        [x, 0],
        [x, sHeigh - 10],
      ];
      points.push(line);
    }
  }

  let values = {
    title0Wid: title0Wid,
    title5Wid: title5Wid,
    textWid: textWid,
    layerPos: layerPos,
    points: points,
  };
  return values;
};

export { getValues };

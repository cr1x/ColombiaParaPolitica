import * as d3 from './d3.min';

// calc percentage function
const calcPercent = (num, percentage) => Math.floor((num / 100) * percentage);

// get max width of autor titles & tema titles
// (widht, heigh, margin, nWidth, nRound)
const getValues = (sWidth, sHeigh, sMargin, nWidth, colPercent, vPadding) => {
  let titles0 = [],
    titles4 = [],
    points = [];

  d3.selectAll('.node')
    .filter((d) => d.depth === 0)
    .selectAll('text')
    .each(function () {
      titles0.push(Math.ceil(this.getBBox().width));
    });
  d3.selectAll('.node')
    .filter((d) => d.depth === 4)
    .selectAll('text')
    .each(function () {
      titles4.push(Math.ceil(this.getBBox().width));
    });

  // max text width column[0]
  let title0Wid = d3.max(titles0) + sMargin;
  // max text width column[4]
  let title4Wid = d3.max(titles4) + sMargin * 2;
  // title0Wid + max text width column[4]
  let textWid = title0Wid + title4Wid;
  // total width
  let wTotal = sWidth - textWid;
  // nodes width max value * 3 lapse
  let lapseWid = title0Wid - Math.max(...nWidth) * 4;

  // custom layers position
  let layerPos = new Array(
    colPercent[0] + title0Wid,
    calcPercent(wTotal, colPercent[1]),
    calcPercent(wTotal, colPercent[2]) + lapseWid,
    calcPercent(wTotal, colPercent[3]) + lapseWid,
    wTotal + title0Wid
  );
  // calcPercent(wTotal, colPercent[1]) + title0Wid,

  let gLayers = [...layerPos];
  gLayers[2] = gLayers[2] + vPadding;

  // guides position "4" by layer
  for (let i = 0; i < gLayers.length - 1; ++i) {
    for (let j = 0; j < 4; ++j) {
      let line = [
        [gLayers[i] + nWidth[i] / 2 + nWidth[i] * j, 0],
        [gLayers[i] + nWidth[i] / 2 + nWidth[i] * j, sHeigh],
      ];
      points.push(line);
    }
  }

  let values = {
    title0Wid: title0Wid,
    title4Wid: title4Wid,
    textWid: textWid,
    layerPos: layerPos,
    points: points,
  };
  return values;
};

export { getValues };

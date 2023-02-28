import * as d3 from './d3.min';

// calc percentage function
const calcPercent = (num, percentage) => Math.floor((num / 100) * percentage);

// get max width of autor titles & tema titles
// (widht, heigh, margin, nWidth, nRound)
const getValues = (sWidth, sHeigh, sMargin, nWidth) => {
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
  let title0Wid = d3.max(titles0);

  let textWid = title0Wid + d3.max(titles4);

  let wTotal = sWidth - sMargin - nWidth[nWidth.length - 1] - textWid;

  // nodes width max value * 3 lapse
  let lapseWid = title0Wid - Math.max(...nWidth) * 3;

  // custom layers position
  let layerPos = new Array(
    0 + title0Wid,
    calcPercent(wTotal, 20) + title0Wid,
    calcPercent(wTotal, 75) + lapseWid,
    calcPercent(wTotal, 94) + lapseWid,
    wTotal + title0Wid
  );

  // guides position "4" by layer
  for (let i = 0; i < layerPos.length - 1; ++i) {
    for (let j = 0; j < 4; ++j) {
      let line = [
        [layerPos[i] + nWidth[i] / 2 + nWidth[i] * j, -20 + 1 * j],
        [layerPos[i] + nWidth[i] / 2 + nWidth[i] * j, sHeigh - 50],
      ];
      points.push(line);
    }
  }

  let values = {
    title0Wid: title0Wid,
    textWid: textWid,
    layerPos: layerPos,
    points: points,
  };
  return values;
};

export { getValues };

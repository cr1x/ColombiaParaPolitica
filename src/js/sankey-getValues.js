import * as d3 from './d3.min';

let textWid, wTotal;

// calc percentage function
const calcPercent = (percentage) => Math.floor((wTotal / 100) * percentage) + textWid;

// get max width of autor titles & tema titles
const getValues = (sWidth, marginLeft, nWidth, colPercent) => {
  let titles0 = [],
    yearsPos = [];

  d3.selectAll('.node')
    .filter((d) => d.depth === 0)
    .selectAll('text')
    .each(function () {
      titles0.push(Math.ceil(this.getBBox().width));
    });

  // max text width column[0]
  textWid = d3.max(titles0) + marginLeft;
  // total width
  wTotal = sWidth - textWid;

  let layerPos = new Array(
    calcPercent(colPercent[0]),
    calcPercent(colPercent[1]),
    calcPercent(colPercent[2]) - nWidth[2] * 4,
    calcPercent(colPercent[3]) - nWidth[2] * 4,
    calcPercent(colPercent[4]) - nWidth[4],
    calcPercent(colPercent[5]) - nWidth[5]
  );

  let yearsLayers = [layerPos[1], layerPos[2], layerPos[3]];

  // guides position "4" by layer
  for (let i = 0; i < yearsLayers.length; ++i) {
    for (let j = 0; j < 4; ++j) {
      let x = yearsLayers[i] + nWidth[i + 1] / 2 + nWidth[i + 1] * j;

      yearsPos.push(x);
    }
  }
  yearsPos.push(layerPos[4] + nWidth[4] / 2);

  let optText = new Array(
    calcPercent(27),
    calcPercent(32),
    calcPercent(40),
    calcPercent(48),
    calcPercent(56)
  );

  let optPos = new Array(
    calcPercent(0),
    calcPercent(18),
    calcPercent(28),
    calcPercent(36),
    calcPercent(44),
    calcPercent(52)
  );

  let values = {
    textWid: textWid,
    layerPos: layerPos,
    yearsPos: yearsPos,
    optText: optText,
    optPos: optPos,
  };
  return values;
};

export { getValues };

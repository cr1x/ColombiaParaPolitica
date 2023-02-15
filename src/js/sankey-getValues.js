import * as d3 from './d3.min';

// calc percentage function
const calcPercent = (num, percentage) => Math.floor((num / 100) * percentage);

// get max width of autor titles & tema titles
const getValues = (w, h, m, nw, nr) => {
  let titleAutores = [],
    titleTemas = [],
    points = [];

  d3.selectAll('.node')
    .filter((d) => d.depth === 0)
    .selectAll('text')
    .each(function () {
      titleAutores.push(Math.ceil(this.getBBox().width));
    });
  d3.selectAll('.node')
    .filter((d) => d.depth === 4)
    .selectAll('text')
    .each(function () {
      titleTemas.push(Math.ceil(this.getBBox().width));
    });
  let autoresWid = d3.max(titleAutores);

  let textWid = autoresWid + d3.max(titleTemas);

  let wTotal = w - m - nw - textWid;
  // custom layers position
  let layerPos = new Array(
    0 + autoresWid,
    calcPercent(wTotal, 20) + autoresWid,
    calcPercent(wTotal, 80) + autoresWid,
    calcPercent(wTotal, 90) + autoresWid,
    wTotal + autoresWid
  );

  for (let i = 0; i < layerPos.length - 1; ++i) {
    for (let j = 0; j < 4; ++j) {
      let line = [
        [layerPos[i] + nw / 2 + nw * j - nr / 2, -20 + 1 * j],
        [layerPos[i] + nw / 2 + nw * j - nr / 2, h - 50],
      ];
      points.push(line);
    }
  }

  let values = {
    autoresWid: autoresWid,
    textWid: textWid,
    layerPos: layerPos,
    points: points,
  };
  // console.log(`values =`, values);
  return values;
};

export { getValues };

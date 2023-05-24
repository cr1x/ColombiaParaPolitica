// d3js
import * as d3Base from './d3.min';
import * as d3Sankey from './d3-sankey';
// import & build Data
import { dataGet } from './dataGet';
// highlighting flow of node selection
import {
  linksConnect,
  nodesConnect,
  highlight_flow,
  moveNodes,
  overNodes,
  outNodes,
  moveLinks,
  overLinks,
  outLinks,
} from './sankey-highlight';

// join d3 libraries
const d3 = {
  ...d3Base,
  ...d3Sankey,
};
// main data container
let sData;
// column name => store nodes by layers
let column = ['autores', 'periodos', 'partidos', 'proyectos', 'annos', 'temas'];

// delay function
const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

// tooltip div
const sTooltip = d3.select('body').append('div').attr('id', 'sTooltip');
sTooltip.append('div').attr('id', 'sTooltip--content');
sTooltip.append('div').attr('id', 'sTooltip--mark');

// append the svg object to the body of the page
const svg = d3
  .select('#dataviz')
  .append('svg')
  .attr('id', 'sankey')
  .attr('width', '100%')
  .attr('height', '100%');

// const sankeyBox = svg.append('g').attr('id', 'sankeyBox');

// Set the sankey diagram properties
const sankey = d3.sankey();

svg.append('text').attr('id', 'letter').text('3');

let defs = svg.append('defs'),
  options = svg.append('g').attr('id', 'options'),
  links = svg.append('g').attr('id', 'links'),
  gradients = svg.append('g').attr('id', 'gradients'),
  years = svg.append('g').attr('id', 'years'),
  partidos = svg.append('g').attr('id', 'partidos'),
  nodes = svg.append('g').attr('id', 'nodes'),
  bgLinks;

const gradYear = defs
  .append('linearGradient')
  .attr('id', 'gradYear')
  .attr('x1', '0%')
  .attr('x2', '0%')
  .attr('y1', '0%')
  .attr('y2', '100%');
// .attr('gradientTransform', 'rotate(90)');
gradYear
  .append('stop')
  .attr('class', 'stop--Year0')
  .attr('offset', '20%')
  .attr('stop-opacity', '1');
gradYear
  .append('stop')
  .attr('class', 'stop--Year1')
  .attr('offset', '16%')
  .attr('stop-opacity', '1');
gradYear
  .append('stop')
  .attr('class', 'stop--Year2')
  .attr('offset', '20%')
  .attr('stop-opacity', '1');

for (let i = 0; i < 4; i++) {
  const gradDouble = defs.append('linearGradient').attr('id', () => {
    i == 3 ? (i = 4) : (i = i);
    return `gradDouble--${i * 25}`;
  });

  gradDouble
    .append('stop')
    .attr('class', 'stop')
    .attr('offset', '0%')
    .attr('stop-opacity', '0');
  gradDouble
    .append('stop')
    .attr('class', 'stop')
    .attr('offset', '6%')
    .attr('stop-opacity', '0.2');
  gradDouble
    .append('stop')
    .attr('class', 'stop')
    .attr('offset', '15%')
    .attr('stop-opacity', '0.5');
  gradDouble
    .append('stop')
    .attr('class', 'stop')
    .attr('offset', '40%')
    .attr('stop-opacity', '0.9');
  gradDouble
    .append('stop')
    .attr('class', 'stop')
    .attr('offset', '60%')
    .attr('stop-opacity', '0.9');
  gradDouble
    .append('stop')
    .attr('class', 'stop')
    .attr('offset', '85%')
    .attr('stop-opacity', '0.5');
  gradDouble
    .append('stop')
    .attr('class', 'stop')
    .attr('offset', '94%')
    .attr('stop-opacity', '0.2');
  gradDouble
    .append('stop')
    .attr('class', 'stop')
    .attr('offset', '100%')
    .attr('stop-opacity', '0');

  const gradSingle = defs.append('linearGradient').attr('id', () => {
    i == 3 ? (i = 4) : (i = i);
    return `gradSingle--${i * 25}`;
  });
  gradSingle
    .append('stop')
    .attr('class', 'stop')
    .attr('offset', '0%')
    .attr('stop-opacity', '0');
  gradSingle
    .append('stop')
    .attr('class', 'stop')
    .attr('offset', '30%')
    .attr('stop-opacity', '0.2');
  gradSingle
    .append('stop')
    .attr('class', 'stop')
    .attr('offset', '92%')
    .attr('stop-opacity', '1');
}

const titles = [
  ['Proyectos ', 'por congresista'],
  ['Proyectos ', 'por partido político'],
  ['Congresistas ', 'por proyecto'],
  ['Proyectos ', 'por tema'],
];

for (let i = 0; i < 2; i++) {
  options
    .append('text')
    .attr('class', 'optCong')
    .text(i == 0 ? 'Senado' : 'Cámara')
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle');

  options.append('path').attr('class', 'optPath').attr('fill', 'none');
}
// options.append('path').attr('class', 'optPara').attr('fill', 'none');

options
  .append('text')
  .attr('class', 'optText')
  .text('% de parapolíticos')
  .attr('text-anchor', 'end')
  .attr('dominant-baseline', 'middle');

const optPercent = ['0', '25', '50', '75'];

for (let i = 0; i < 4; i++) {
  options
    .append('text')
    .attr('class', 'optText')
    .text(i == 0 ? `${optPercent[i]}%` : `+${optPercent[i]}%`)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle');
}

for (let i = 0; i < 4; i++) {
  options
    .append('rect')
    .attr('class', `optRect para--${optPercent[i]}`)
    .attr('stroke', 'none');
}
for (let j = 0; j < 4; j++) {
  options
    .append('rect')
    .attr('class', `optRect para--${optPercent[j]}`)
    .attr('stroke', 'none');
}

// build sankey chart
const createSankey = async () => {
  // load CSV file
  sData = await dataGet();
  await drawSankey();
};

//
// append elements of the graph
const drawSankey = async () => {
  const graph = sankey(sData);

  // year guides by column
  for (let j = 0; j < 3; j++) {
    let year = 2;
    for (let i = 0; i < 4; i++) {
      years
        .append('text')
        .attr('class', 'year')
        // .attr('y', 12 + i * -4)
        // .attr('alignment-baseline', 'before-edge')
        .attr('text-anchor', i > 2 ? 'start' : 'end')
        .attr('dx', i > 2 ? '-.5em' : '.7em')
        .text(i < 1 ? `200${year}` : i < 2 ? `0${year}` : i > 2 ? `20${year}` : year);
      year += 4;
    }
  }

  for (let i = 0; i < 4; i++) {
    let titlesCol = years.append('text').attr('class', 'titleCol');
    titlesCol.append('tspan').text(titles[i][0]);
    titlesCol.append('tspan').text(titles[i][1]).attr('text-anchor', 'start');
  }

  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 4; ++j) {
      years.append('path').attr('class', 'yearLine');
    }
  }
  years.append('path').attr('class', 'yearLine');

  const nodes1 = graph.nodes.filter((d) => d.lColumn == 1);

  nodes1.forEach(() => {
    links
      .selectAll('.bgLink')
      .data(nodes1)
      .enter()
      .append('g')
      .attr('class', (d) => {
        let congreso = d.idCongreso == 1 ? 'senado' : 'camara';
        return `bgLink ${congreso} para`;
      })
      .append('path')
      .attr('class', (d) => `pp--${d.idPartido} para--${d.paraPol}`);
  });

  bgLinks = d3.selectAll('.bgLink');
  bgLinks.filter((d) => d.paraPol == 100).raise();

  // add in the links
  links = links
    .selectAll('.link')
    .data(graph.links)
    .enter()
    .append('g')
    .attr('id', (d, i) => {
      d.id = i + 1;
      return `l${d.id}`;
    })
    .each((d) => (d.connect = linksConnect(d.id)))
    .on('mouseover', overLinks)
    .on('mouseout', outLinks);

  links.filter((d) => d.lColumn == 1 || d.lColumn == 2).on('mousemove', moveLinks);

  // add in the nodes
  nodes = nodes
    .selectAll('.node')
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('id', (d) => `n${d.id}`)
    .each((d) => (d.connect = nodesConnect(d.id)))
    .on('mousemove', moveNodes)
    .on('mouseover', overNodes)
    .on('mouseout', outNodes)
    .on('click', highlight_flow);

  // add in the partidos
  partidos = partidos
    .selectAll('.partido')
    .data(sData.partidos)
    .enter()
    .append('g')
    .attr('id', (d) => `p${d.idPartido}`)
    .attr('class', `partido`);

  partidos.append('rect').attr('class', (d) => `pBack`);

  partidos
    .append('foreignObject')
    .append('xhtml:div')
    .attr('class', 'pNameBox')
    .html((d) => `<span class="pName">${d.partido}</span>`);

  // selectAll nodes by layer(column)
  for (let i = 0; i < column.length; ++i) {
    column[i] = nodes.filter((d) => d.depth === i);
    column[i].raise();
  }

  column[0].each((d) => {
    d.totalPara = +((d.paraPol * d.value) / 100);
  });

  column[1].each((d) => {
    d.totalPara = d3.sum(d.sourceLinks, (e) => e.paraPol) / 100;
  });

  // assigment tp nodes & links paraPol value
  column[2].each((d) => {
    let targets = Array.from([
      ...new Map(d.targetLinks.map((obj) => [obj['idAutor'], obj])).values(),
    ]);

    d.totalPara = d3.sum(targets, (d) => d.paraPol) / 100;

    let para = Math.round(
      (d3.sum(targets, (d) => d.paraPol) / (targets.length * 100)) * 100
    );
    para < 25
      ? (para = 0)
      : para >= 25 && para < 50
      ? (para = 25)
      : para >= 50 && para < 75
      ? (para = 50)
      : (para = 100);

    d.paraPol = para;

    d.totalProj = Array.from(
      d3.group(d.targetLinks, (d) => d.idProyecto),
      ([value]) => value
    ).length;
  });

  // assigment tp nodes & links paraPol value
  d3.selectAll([...column[3], ...column[4], ...column[5]]).each((d) => {
    let para = Math.round(
      (d3.sum(d.targetLinks, (e) => e.paraPol) / (d.targetLinks.length * 100)) * 100
    );

    d.totalPara = para;

    para < 25
      ? (para = 0)
      : para >= 25 && para < 50
      ? (para = 25)
      : para >= 50 && para < 75
      ? (para = 50)
      : (para = 100);

    d.paraPol = para;

    d.sourceLinks.forEach((e) => {
      e.paraPol = para;
    });
  });

  const grads = graph.nodes.filter((d) => d.lColumn > 1);

  grads.forEach(() => {
    gradients
      .selectAll('g')
      .data(grads)
      .enter()
      .append('g')
      .attr('class', (d) =>
        d.lColumn == 2 ? `grad gradDouble para` : `grad grad${d.lColumn} gradSingle para`
      )
      .append('rect')
      .attr('class', (d) => `para--${d.paraPol}`);
  });

  for (let i = 2; i < 6; i++) {
    gradients
      .selectAll('g')
      .filter((d) => d.lColumn == i)
      .raise();
  }
  gradients = gradients.selectAll('rect');

  nodes.attr('class', (d) =>
    d.depth === 0
      ? `node autor para`
      : d.depth === 1
      ? `node lapse para`
      : d.depth === 2
      ? `node pol para`
      : d.depth === 3
      ? `node proj para`
      : d.depth === 4
      ? `node anno para`
      : `node topic t--${d.idTema} para`
  );

  // assigment links classes
  links.attr('class', (d) => {
    let congreso = d.idCongreso == 1 ? 'senado' : 'camara';

    return d.lColumn === 0
      ? `link aut para`
      : d.lColumn === 1
      ? `link pol ${congreso} para`
      : d.lColumn === 2
      ? `link proj ${congreso} para`
      : d.lColumn === 3
      ? `link anno para`
      : `link topic para`;
  });

  // add links path
  links
    .append('path')
    .attr('class', (d) =>
      d.lColumn == 3 || d.lColumn == 4
        ? `tem--${d.idTema} para--${d.paraPol}`
        : `pp--${d.idPartido} para--${d.paraPol}`
    );

  // add the rectangles for the nodes old
  column[0]
    .append('rect')
    .attr('class', (d) => (d.old > 1 ? `old old--${d.old} para--${d.paraPol}` : `old`));

  column[5].append('rect').attr('class', 'bgTopic');

  nodes
    .append('rect')
    .attr('class', (d) =>
      d.lColumn == 1 || d.lColumn == 2
        ? `nRect pp--${d.idPartido}`
        : `nRect para--${d.paraPol}`
    )
    .attr('rx', (d) => (d.lColumn == 1 || d.lColumn == 2 || d.lColumn == 3 ? 2 : 0));

  column[3].each(function (d) {
    let self = d3.select(this);
    for (let i = 0; i < d.targetLinks.length; ++i) {
      self
        .append('rect')
        .attr('class', 'ppRect')
        .attr('stroke-width', '0')
        .attr('rx', '2');
    }
  });

  links.filter((d) => (d.lColumn == 1 || d.lColumn == 2) && d.paraPol == 100).raise();

  // add in the title for the nodes
  column[0]
    .append('text')
    .attr('class', (d) => `title--nombre para--${d.paraPol}`)
    .attr('text-anchor', 'start')
    .attr('alignment-baseline', 'baseline')
    .attr('baseline-shift', '15%')
    .text((d) => d.nombre);

  column[0]
    .append('text')
    .attr('class', (d) => `title--apellido para--${d.paraPol}`)
    .attr('text-anchor', 'start')
    .attr('alignment-baseline', 'hanging')
    .attr('baseline-shift', '-15%')
    .text((d) => d.apellido);

  d3.selectAll([...column[1], ...column[2], ...column[4], ...column[5]])
    .append('text')
    .attr('class', `title--value`)
    .attr('alignment-baseline', 'central')
    .attr('text-anchor', (d) => (d.lColumn == 5 ? 'start' : 'middle'))
    .text((d) => (d.value > 1 ? d.value : null));

  column[5]
    .append('text')
    .attr('class', `title--topic`)
    .attr('alignment-baseline', 'baseline')
    .attr('text-anchor', 'start')
    .text((d) => d.tema);
};

export {
  sData,
  column,
  delay,
  sTooltip,
  sankey,
  gradients,
  links,
  nodes,
  bgLinks,
  years,
  partidos,
  createSankey,
};

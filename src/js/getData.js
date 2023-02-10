import * as d3 from './d3.min';
import * as csvData from 'url:../data/data.csv';
//
// data load and build main array data
const buildData = (data) => {
  // data containers
  let sData = { nodes: [], links: [] };
  // temporary data container
  let linksTemp = [],
    linksTemp23 = [];

  // default links value
  const vLink = 1;

  // load data in the container
  data.forEach((d) => {
    //
    // data push on the main array
    //
    // nodes
    sData.nodes.push({
      id: +d.idAutor,
      nombre: d.nombre,
      apellido: d.apellido,
      anno: +d.anno,
      nGroup: 'autor',
      paraPol: +d.paraPol,
      nodeWid: 0,
      lColumn: 0,
    });
    sData.nodes.push({
      id: +(d.idAutor + d.anno),
      nombre: `${d.anno}-${+d.anno + 4}`,
      anno: +d.anno,
      nGroup: +d.idAutor,
      autor: `${d.nombre} ${d.apellido}`,
      periodo: `${d.anno}-${+d.anno + 4}`,
      congreso: +d.congreso,
      paraPol: +d.paraPol,
      idPartido: +d.idPartido,
      partido: d.partido,
      nodeWid: 0,
      lColumn: 1,
    });
    sData.nodes.push({
      id: +d.idProyecto,
      nombre: d.proyecto,
      anno: +d.anno,
      periodo: `${d.anno}-${+d.anno + 4}`,
      nGroup: +d.idTema,
      idTema: +d.idTema,
      tema: d.tema,
      nodeWid: 0,
      lColumn: 2,
    });
    sData.nodes.push({
      id: +(d.idTema + d.anno),
      nombre: `${d.tema} ${d.anno}-${+d.anno + 4}`,
      periodo: `${d.anno}-${+d.anno + 4}`,
      anno: +d.anno,
      nGroup: +d.idTema,
      idTema: +d.idTema,
      tema: d.tema,
      nodeWid: 0,
      lColumn: 3,
    });
    sData.nodes.push({
      id: +d.idTema,
      nombre: d.tema,
      anno: 0,
      idTema: +d.idTema,
      nGroup: +d.idTema,
      nodeWid: 0,
      lColumn: 4,
    });

    // Links
    sData.links.push({
      source: +(d.idAutor + d.anno),
      target: +d.idProyecto,
      value: vLink,
      nombre: d.proyecto,
      idPartido: +d.idPartido,
      partido: d.partido,
      periodo: `${d.anno}-${+d.anno + 4}`,
      autor: `${d.nombre} ${d.apellido}`,
      anno: +d.anno,
      congreso: +d.congreso,
      paraPol: +d.paraPol,
      lColumn: 1,
    });

    // links temporales
    linksTemp.push({
      source: +d.idAutor,
      target: +(d.idAutor + d.anno),
      value: 0,
      nombre: `${d.nombre} ${d.apellido}`,
      periodo: `${d.anno}-${+d.anno + 4}`,
      anno: +d.anno,
      idPartido: +d.idPartido,
      partido: d.partido,
      paraPol: +d.paraPol,
      lColumn: 0,
    });
    linksTemp.push({
      source: +d.idProyecto,
      target: +(d.idTema + d.anno),
      value: 0,
      nombre: d.proyecto,
      idTema: +d.idTema,
      tema: d.tema,
      periodo: `${d.anno}-${+d.anno + 4}`,
      anno: +d.anno,
      lColumn: 2,
    });
    linksTemp.push({
      source: +(d.idTema + d.anno),
      target: +d.idTema,
      value: 0,
      nombre: `${d.tema} ${+d.anno}`,
      idTema: +d.idTema,
      tema: d.tema,
      periodo: `${d.anno}-${+d.anno + 4}`,
      anno: +d.anno,
      lColumn: 3,
    });
  });

  //
  // Nodes data
  //
  // nodes group by 'id' and 'anno'
  let uniqueNodes = d3.group(
    sData.nodes,
    (d) => d.id,
    (d) => d.anno
  );

  // array with the years of each node + order
  uniqueNodes = Array.from(uniqueNodes, (entry) => {
    return {
      key: entry[0],
      value: Array.from(entry[1].keys()).sort(),
    };
  });

  // unique nodes by 'id'
  sData.nodes = Array.from([
    ...new Map(sData.nodes.map((obj) => [obj['id'], obj])).values(),
  ]);

  // assigment of years array by 'id' in the main array
  sData.nodes.forEach((obj) => {
    let index = uniqueNodes.findIndex((node) => node.key == obj.id);
    obj.anno = uniqueNodes[index].value;
  });

  // fix assignment according to year
  sData.nodes.map((d) => {
    Math.min(...d.anno) == 2002 || Math.min(...d.anno) == 0
      ? (d.fix = 0)
      : Math.min(...d.anno) == 2006
      ? (d.fix = 1)
      : Math.min(...d.anno) == 2010
      ? (d.fix = 2)
      : (d.fix = 3);
  });

  sData.nodes.sort(
    (a, b) =>
      d3.ascending(Math.min(...a.anno), Math.min(...b.anno)) ||
      d3.ascending(a.nGroup, b.nGroup)
  );

  //
  // Links data
  //
  // create value link accordign to the projects by autor
  //
  // temporary links order by 'source' and 'target'
  linksTemp.sort(
    (a, b) => d3.ascending(a.source, b.source) || d3.ascending(a.target, b.target)
  );

  // get value by 'source' and 'target'
  let linksValues = Array.from(
    d3
      .flatRollup(
        linksTemp,
        (v) => v.length,
        (d) => d.source,
        (d) => d.target
      )
      .map((v) => v[2])
  );

  // unique links by 'source' and 'target'
  linksTemp = [
    ...new Map(
      linksTemp.map((obj) => [JSON.stringify([obj.source, obj.target]), obj])
    ).values(),
  ];

  // assigment value to [linksTemp] from [linksValues]
  for (let i = 0; i < linksTemp.length; i++) {
    linksTemp[i].value = linksValues[i];
  }

  // marge links
  sData.links = [...sData.links, ...linksTemp];

  // loop through each link replacing the text with its index from node
  sData.links.map((d) => {
    d.source = sData.nodes.map((obj) => obj.id).indexOf(d.source);
    d.target = sData.nodes.map((obj) => obj.id).indexOf(d.target);
  });

  // links array order by 'source' and 'target'
  sData.links.sort(
    (a, b) => d3.ascending(a.source, b.source) || d3.ascending(a.target, b.target)
  );

  // console.log('nodes =', sData.nodes);
  // console.log('links =', sData.links);

  return sData;
};
//
// async function for load data
const getData = async () => {
  // load CSV file
  const loadData = await d3.csv(csvData);
  // build data
  const data = await buildData(loadData);
  return data;
};

export { getData };

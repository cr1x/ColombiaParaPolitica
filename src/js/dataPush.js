import * as d3 from './d3.min';
import * as csvData from 'url:../data/data.csv';

//
// async function for load data
const dataPush = async () => {
  // load CSV file
  const csv = await d3.csv(csvData);
  // build data
  const data = await dataLoad(csv);
  return data;
};

//
const dataLoad = (dataCsv) => {
  // data containers
  let nodes = [];
  let links = [];
  // temporary data container
  let linksTemp = [];

  // load data in the container
  dataCsv.forEach((d) => {
    //
    // data push on the main array
    //
    // nodes
    nodes.push({
      id: +d.idAutor,
      nombre: d.nombre,
      apellido: d.apellido,
      anno: +d.anno,
      nGroup: 'autor',
      paraPol: +d.paraPol,
      old: +d.old,
      nodeWid: 5,
      lColumn: 0,
      fix: 0,
    });
    nodes.push({
      id: +(d.idAutor + d.anno),
      nombre: `${d.nombre} ${d.apellido}`,
      anno: +d.anno,
      nGroup: +d.idAutor,
      autor: `${d.nombre} ${d.apellido}`,
      periodo: `${d.anno}-${+d.anno + 4}`,
      idCongreso: +d.idCongreso,
      congreso: +d.idCongreso,
      paraPol: +d.paraPol,
      idPartido: +d.idPartido,
      partido: d.partido,
      nodeWid: 5,
      lColumn: 1,
    });
    nodes.push({
      id: +(d.idPartido + d.anno),
      partido: d.partido,
      anno: +d.anno,
      periodo: `${d.anno}-${+d.anno + 4}`,
      idPartido: +d.idPartido,
      partido: d.partido,
      nGroup: +d.idPartido,
      nodeWid: 5,
      lColumn: 2,
    });
    nodes.push({
      id: +d.idProyecto,
      proyecto: d.proyecto,
      anno: +d.anno,
      periodo: `${d.anno}-${+d.anno + 4}`,
      nGroup: +d.idTema,
      idTema: +d.idTema,
      tema: d.tema,
      nodeWid: 5,
      lColumn: 3,
    });
    nodes.push({
      id: +(d.idTema + d.anno),
      periodo: `${d.anno}-${+d.anno + 4}`,
      anno: +d.anno,
      nGroup: +d.idTema,
      idTema: +d.idTema,
      tema: d.tema,
      nodeWid: 5,
      lColumn: 4,
      fix: 0,
    });
    nodes.push({
      id: +d.idTema,
      tema: d.tema,
      anno: +d.anno,
      idTema: +d.idTema,
      nGroup: +d.idTema,
      nodeWid: 5,
      lColumn: 5,
      fix: 0,
    });

    // Links
    links.push({
      source: +(d.idAutor + d.anno),
      target: +(d.idPartido + d.anno),
      value: 1,
      idProyecto: d.idProyecto,
      proyecto: d.proyecto,
      tema: d.tema,
      autor: `${d.nombre} ${d.apellido}`,
      idPartido: +d.idPartido,
      partido: d.partido,
      periodo: `${d.anno}-${+d.anno + 4}`,
      anno: +d.anno,
      idCongreso: +d.idCongreso,
      congreso: +d.idCongreso,
      paraPol: +d.paraPol,
      lColumn: 1,
    });

    links.push({
      source: +(d.idPartido + d.anno),
      target: +d.idProyecto,
      value: 1,
      idProyecto: d.idProyecto,
      proyecto: d.proyecto,
      tema: d.tema,
      autor: `${d.nombre} ${d.apellido}`,
      idPartido: +d.idPartido,
      partido: d.partido,
      periodo: `${d.anno}-${+d.anno + 4}`,
      anno: +d.anno,
      idCongreso: +d.idCongreso,
      congreso: +d.idCongreso,
      paraPol: +d.paraPol,
      lColumn: 2,
    });

    // links temporales
    linksTemp.push({
      source: +d.idAutor,
      target: +(d.idAutor + d.anno),
      value: 0,
      nombre: `${d.nombre} ${d.apellido} ${d.anno}`,
      periodo: `${d.anno}-${+d.anno + 4}`,
      anno: +d.anno,
      idCongreso: +d.idCongreso,
      idPartido: +d.idPartido,
      partido: d.partido,
      paraPol: +d.paraPol,
      lColumn: 0,
    });
    linksTemp.push({
      source: +d.idProyecto,
      target: +(d.idTema + d.anno),
      value: 0,
      nombre: `${d.proyecto} ${d.anno}`,
      idTema: +d.idTema,
      tema: d.tema,
      periodo: `${d.anno}-${+d.anno + 4}`,
      anno: +d.anno,
      lColumn: 3,
    });
    linksTemp.push({
      source: +(d.idTema + d.anno),
      target: +d.idTema,
      value: 0,
      nombre: `${+d.anno} ${d.tema}`,
      idTema: +d.idTema,
      tema: d.tema,
      periodo: `${d.anno}-${+d.anno + 4}`,
      anno: +d.anno,
      lColumn: 4,
    });

    nodes
      .filter((d) => d.lColumn === 1)
      .forEach((d) => {
        d.idCongreso === 1
          ? (d.congreso = 'Senado')
          : (d.congreso = 'Cámara de Representantes');
      });

    links
      .filter((d) => d.lColumn === 1)
      .forEach((d) => {
        d.idCongreso === 1
          ? (d.congreso = 'Senado')
          : (d.congreso = 'Cámara de Representantes');
      });
  });
  return [nodes, links, linksTemp];
};

export { dataPush };

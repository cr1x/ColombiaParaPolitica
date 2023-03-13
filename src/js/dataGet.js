import * as d3 from './d3.min';
import { dataPush } from './dataPush';

//
// async function for load data
const dataGet = async () => {
  // load CSV file
  const getData = await dataPush();
  // build data
  const data = await buildData(getData);
  return data;
};

// data load and build main array data
const buildData = (data) => {
  // data containers
  let sData = { nodes: data[0], links: data[1] };
  // temporary data container
  let linksTemp = data[2];

  //
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
  sData.nodes
    .filter((d) => d.lColumn == 1 || d.lColumn == 2 || d.lColumn == 3)
    .map((d) => {
      Math.min(...d.anno) == 2002
        ? (d.fix = 0)
        : Math.min(...d.anno) == 2006
        ? (d.fix = 1)
        : Math.min(...d.anno) == 2010
        ? (d.fix = 2)
        : (d.fix = 3);
    });

  // nodes sort
  sData.nodes.sort((a, b) => d3.ascending(Math.min(...a.anno), Math.min(...b.anno)));

  //
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

  // console.log('nodes =', sData.nodes);
  // console.log('links =', sData.links);

  return sData;
};

export { dataGet };

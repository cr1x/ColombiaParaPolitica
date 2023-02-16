import * as d3 from './d3.min';
//

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

// nodes highlighting
async function hightlight() {
  let prevNodes = [],
    newPrev = [],
    nextNodes = [],
    newNext = [];

  let nSel = d3.select(this);

  d3.selectAll('.node').on('click', null);

  // nSel.classed('fixed', !nSel.classed('fixed'));

  if (nSel.classed('fixed')) {
    d3.selectAll('.node').classed('fixed fixed2', false);
    d3.selectAll('.link').classed('fixed', false);
  } else {
    d3.selectAll('.node').classed('fixed fixed2', false);
    d3.selectAll('.link').classed('fixed', false);
    nSel.classed('fixed', true);

    await delay(250);

    nSel.each((d) => {
      d['targetLinks'].forEach((e) => {
        prevNodes.push(e.source);
        highlight_flow(e.id, e.source['id']);
      });
      d['sourceLinks'].forEach((e) => {
        nextNodes.push(e.target);
        highlight_flow(e.id, e.target['id']);
      });
    });

    await delay(500);

    while (nextNodes.length || prevNodes.length) {
      newNext = [];
      newPrev = [];
      nextNodes.forEach((d) => {
        d['sourceLinks'].forEach((e) => {
          newNext.push(e.target);
          highlight_flow(e.id, e.target['id']);
        });
      });
      nextNodes = newNext;
      prevNodes.forEach((d) => {
        d['targetLinks'].forEach((e) => {
          newPrev.push(e.source);
          highlight_flow(e.id, e.source['id']);
        });
      });
      prevNodes = newPrev;
      await delay(200);
    }
  }
  d3.selectAll('.node').on('click', hightlight);
}

const highlight_flow = async (id, source) => {
  await delay(50);
  d3.select(`#${id}`).classed('fixed', true);
  await delay(200);
  d3.select(`#node${source}`).classed('fixed2', true);
};

// links mousover hightlighting
const linksConnect = (id) => {
  let prevLinks = [],
    newPrev = [],
    nextLinks = [],
    newNext = [],
    linksId = [];

  let linkSel = d3.select(`#${id}`);

  linkSel.each((d) => {
    prevLinks.push(d.source);
    nextLinks.push(d.target);
    linksId.push(`#${d.id}`);
  });

  while (nextLinks.length || prevLinks.length) {
    newNext = [];
    newPrev = [];
    nextLinks.forEach((d) => {
      d['sourceLinks'].forEach((e) => {
        newNext.push(e.target);
        linksId.push(`#${e.id}`);
      });
    });
    nextLinks = newNext;
    prevLinks.forEach((d) => {
      d['targetLinks'].forEach((e) => {
        newPrev.push(e.source);
        linksId.push(`#${e.id}`);
      });
    });
    prevLinks = newPrev;
  }
  return linksId;
};

const overlinks = (links) => {
  for (let link of links) {
    d3.select(link).classed('over', true);
  }
};
const outlinks = (links) => {
  for (let link of links) {
    d3.select(link).classed('over', false);
  }
};

export { hightlight, linksConnect, overlinks, outlinks };

// // links mousover hightlighting
// const linkslighting = (id) => {
//   let prevLinks = [],
//     newPrev = [],
//     nextLinks = [],
//     newNext = [],
//     linksId = [];
//
//   let linkSel = d3.select(`#${id}`);
//
//   linkSel.each((d) => {
//     prevLinks.push(d.source);
//     nextLinks.push(d.target);
//     linksId.push(`#${d.id}`);
//     d3.select(`#${d.id}`).classed('fixed', true);
//   });
//
//   while (nextLinks.length || prevLinks.length) {
//     newNext = [];
//     newPrev = [];
//     nextLinks.forEach((d) => {
//       d['sourceLinks'].forEach((e) => {
//         newNext.push(e.target);
//         linksId.push(`#${e.id}`);
//         d3.select(`#${e.id}`).classed('fixed', true);
//       });
//     });
//     nextLinks = newNext;
//     prevLinks.forEach((d) => {
//       d['targetLinks'].forEach((e) => {
//         newPrev.push(e.source);
//         linksId.push(`#${e.id}`);
//         d3.select(`#${e.id}`).classed('fixed', true);
//       });
//     });
//     prevLinks = newPrev;
//   }
//   console.log(`linksId =`, linksId);
// };

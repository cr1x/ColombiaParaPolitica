// edited
// https://github.com/d3/d3-sankey v0.12.3 Copyright 2019 Mike Bostock
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('d3-array'), require('d3-shape'))
    : typeof define === 'function' && define.amd
    ? define(['exports', 'd3-array', 'd3-shape'], factory)
    : ((global = global || self),
      factory((global.d3 = global.d3 || {}), global.d3, global.d3));
})(this, function (exports, d3Array, d3Shape) {
  'use strict';

  function targetDepth(d) {
    return d.target.depth;
  }

  function left(node) {
    return node.depth;
  }

  function right(node, n) {
    return n - 1 - node.height;
  }

  function justify(node, n) {
    return node.sourceLinks.length ? node.depth : n - 1;
  }

  function center(node) {
    return node.targetLinks.length
      ? node.depth
      : node.sourceLinks.length
      ? d3Array.min(node.sourceLinks, targetDepth) - 1
      : 0;
  }

  function constant(x) {
    return function () {
      return x;
    };
  }

  function ascendingSourceBreadth(a, b) {
    return ascendingBreadth(a.source, b.source);
  }

  function ascendingTargetBreadth(a, b) {
    return ascendingBreadth(a.target, b.target);
  }

  function ascendingBreadth(a, b) {
    return a.y0 - b.y0;
  }

  function value(d) {
    return d.value;
  }

  function defaultId(d) {
    return d.index;
  }

  function defaultNodes(graph) {
    return graph.nodes;
  }

  function defaultLinks(graph) {
    return graph.links;
  }

  function find(nodeById, id) {
    const node = nodeById.get(id);
    if (!node) throw new Error('missing: ' + id);
    return node;
  }

  function computeLinkBreadths({ nodes }) {
    for (const node of nodes) {
      let y0 = node.y0;
      let y1 = y0;
      // node.sourceLinks.sort((a, b) => a.idProyecto - b.idProyecto);
      node.sourceLinks.forEach((link, i) => {
        link.y0 = y0 + link.width / 2;
        if (
          link.lColumn == 2 &&
          i < node.sourceLinks.length - 1 &&
          link.idProyecto == node.sourceLinks[i + 1].idProyecto
        ) {
          y0 = y0;
        } else {
          y0 += link.width;
        }
      });
      // node.targetLinks.sort((a, b) => a.idProyecto - b.idProyecto);
      node.targetLinks.forEach((link, i) => {
        link.y1 = y1 + link.width / 2;
        if (
          link.lColumn == 1 &&
          i < node.targetLinks.length - 1 &&
          link.idProyecto == node.targetLinks[i + 1].idProyecto
        ) {
          y1 = y1;
        } else {
          y1 += link.width;
        }
      });
    }
  }

  function Sankey() {
    let x0 = 0,
      y0 = 0,
      x1 = 1,
      y1 = 1; // extent
    let dx = 24; // nodeWidth
    let dy = 8,
      py; // nodePadding
    let id = defaultId;
    let align = justify;
    let sort;
    let linkSort;
    let nodes = defaultNodes;
    let links = defaultLinks;
    let iterations = 0;
    let pyGroup = 2;
    let layersPos = [];

    function sankey() {
      const graph = {
        nodes: nodes.apply(null, arguments),
        links: links.apply(null, arguments),
      };
      computeNodeLinks(graph);
      computeNodeValues(graph);
      computeNodeDepths(graph);
      computeNodeHeights(graph);
      computeNodeBreadths(graph);
      computeLinkBreadths(graph);
      return graph;
    }

    sankey.update = function (graph) {
      computeLinkBreadths(graph);
      return graph;
    };

    sankey.nodeId = function (_) {
      return arguments.length
        ? ((id = typeof _ === 'function' ? _ : constant(_)), sankey)
        : id;
    };

    sankey.nodeAlign = function (_) {
      return arguments.length
        ? ((align = typeof _ === 'function' ? _ : constant(_)), sankey)
        : align;
    };

    sankey.nodeSort = function (_) {
      return arguments.length ? ((sort = _), sankey) : sort;
    };

    sankey.nodeWidth = function (_) {
      return arguments.length ? ((dx = +_), sankey) : dx;
    };

    sankey.nodePadding = function (_) {
      return arguments.length ? ((dy = py = +_), sankey) : dy;
    };

    sankey.nodes = function (_) {
      return arguments.length
        ? ((nodes = typeof _ === 'function' ? _ : constant(_)), sankey)
        : nodes;
    };

    sankey.links = function (_) {
      return arguments.length
        ? ((links = typeof _ === 'function' ? _ : constant(_)), sankey)
        : links;
    };

    sankey.linkSort = function (_) {
      return arguments.length ? ((linkSort = _), sankey) : linkSort;
    };

    sankey.size = function (_) {
      return arguments.length
        ? ((x0 = y0 = 0), (x1 = +_[0]), (y1 = +_[1]), sankey)
        : [x1 - x0, y1 - y0];
    };

    sankey.extent = function (_) {
      return arguments.length
        ? ((x0 = +_[0][0]), (x1 = +_[1][0]), (y0 = +_[0][1]), (y1 = +_[1][1]), sankey)
        : [
            [x0, y0],
            [x1, y1],
          ];
    };

    sankey.iterations = function (_) {
      return arguments.length ? ((iterations = +_), sankey) : iterations;
    };

    sankey.pyGroup = function (_) {
      return arguments.length ? ((pyGroup = +_), sankey) : pyGroup;
    };

    sankey.layersPos = function (_) {
      return arguments.length ? ((layersPos = _), sankey) : layersPos;
    };

    function computeNodeLinks({ nodes, links }) {
      for (let [i, node] of nodes.entries()) {
        node.index = i;
        node.sourceLinks = [];
        node.targetLinks = [];
      }
      const nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d]));
      for (const [i, link] of links.entries()) {
        link.index = i;
        let { source, target } = link;
        if (typeof source !== 'object') source = link.source = find(nodeById, source);
        if (typeof target !== 'object') target = link.target = find(nodeById, target);
        source.sourceLinks.push(link);
        target.targetLinks.push(link);
      }
      if (linkSort != null) {
        for (const { sourceLinks, targetLinks } of nodes) {
          sourceLinks.sort(linkSort);
          targetLinks.sort(linkSort);
        }
      }
    }

    // function computeNodeValues({ nodes }) {
    //   for (const node of nodes) {
    //     node.value =
    //       node.fixedValue === undefined
    //         ? Math.max(
    //             d3Array.sum(node.sourceLinks, value),
    //             d3Array.sum(node.targetLinks, value)
    //           )
    //         : node.fixedValue;
    //   }
    // }

    function computeNodeValues({ nodes }) {
      for (const node of nodes) {
        if (node.lColumn === 2) {
          let uniqS = [...new Set(node.sourceLinks.map((d) => d.idProyecto))];
          let uniqT = [...new Set(node.targetLinks.map((d) => d.idProyecto))];
          node.value = Math.max(uniqS.length, uniqT.length);
        } else if (node.lColumn === 4) {
          node.value = Math.max(node.sourceLinks.length, node.targetLinks.length);
        } else {
          node.value = Math.max(
            d3Array.sum(node.sourceLinks, value),
            d3Array.sum(node.targetLinks, value)
          );
        }
      }
    }

    function computeNodeDepths({ nodes }) {
      const n = nodes.length;
      let current = new Set(nodes);
      let next = new Set();
      let x = 0;
      while (current.size) {
        for (const node of current) {
          node.depth = x;
          for (const { target } of node.sourceLinks) {
            next.add(target);
          }
        }
        if (++x > n) throw new Error('circular link');
        current = next;
        next = new Set();
      }
    }

    function computeNodeHeights({ nodes }) {
      const n = nodes.length;
      let current = new Set(nodes);
      let next = new Set();
      let x = 0;
      while (current.size) {
        for (const node of current) {
          node.height = x;
          for (const { source } of node.targetLinks) {
            next.add(source);
          }
        }
        if (++x > n) throw new Error('circular link');
        current = next;
        next = new Set();
      }
    }

    // edited
    function computeNodeLayers({ nodes }) {
      const x = d3Array.max(nodes, (d) => d.depth) + 1;
      const columns = new Array(x);

      for (const node of nodes) {
        const i = Math.max(0, Math.min(x - 1, Math.floor(align.call(null, node, x))));
        node.layer = i;
        node.x0 = layersPos[i] + node.nodeWid * node.fix;
        node.x1 = node.x0 + node.nodeWid;
        if (columns[i]) columns[i].push(node);
        else columns[i] = [node];
      }

      return columns;
    }

    // edited
    function initializeNodeBreadths(columns) {
      const newColumns = [...columns]; // clone array columns

      // grouped nodes by nGroup (tema)
      for (const [i] of newColumns.entries()) {
        newColumns[i] = Array.from(
          d3Array.group(newColumns[i], (d) => d.nGroup),
          ([key, values]) => values
        );
      }

      for (const nodes of newColumns[3]) {
        nodes.sort(
          (a, b) =>
            a.anno[0] - b.anno[0] || b.totalPara - a.totalPara || b.value - a.value
        );
      }

      for (const [i, column] of newColumns.entries()) {
        switch (i) {
          case 0:
          case 1:
          case 3:
            column.sort(
              (a, b) =>
                d3Array.sum(b, (d) => d.totalPara) - d3Array.sum(a, (d) => d.totalPara) ||
                d3Array.sum(b, (d) => d.value) - d3Array.sum(a, (d) => d.value)
            );
            break;
          case 2:
            column.sort(
              (a, b) =>
                d3Array.sum(b, (d) => d.totalPara) - d3Array.sum(a, (d) => d.totalPara) ||
                d3Array.sum(b, (d) => d.totalProj) - d3Array.sum(a, (d) => d.totalProj)
            );
            break;
        }
      }

      // get groups padding
      const getKy = () => {
        let kyVal = [];

        for (const [i, column] of newColumns.entries()) {
          let pys;
          i == 0 || i == 1 || i == 3 ? (pys = py * (pyGroup / 2)) : (pys = py * pyGroup);
          let nodeSum =
            d3Array.sum(column, (c) => (c.length - 1) * py) + (column.length - 1) * pys;
          let nodesValue = d3Array.sum(column, (c) => d3Array.sum(c, value));

          kyVal.push(Math.floor((y1 - y0 - nodeSum) / nodesValue));
        }

        // console.log(kyVal);
        return d3Array.min(kyVal);
      };

      const ky = getKy();

      // console.log(`ky`, ky);

      for (const [i, column] of newColumns.entries()) {
        let y = y0;

        for (const group of column) {
          i == 4
            ? (y = group[0].targetLinks[0].source.y0 + 20)
            : i == 5
            ? (y = group[0].targetLinks[0].source.y0)
            : null;
          for (const [j, node] of group.entries()) {
            node.y0 = y;
            node.y1 = node.y0 + node.value * ky;

            if (j == group.length - 1) {
              i == 0
                ? (y = node.y1 + (node.sourceLinks.length - 1) * py + py * (pyGroup / 2))
                : i == 2
                ? (y = node.y1 + py * pyGroup)
                : (y = node.y1 + py * (pyGroup / 2));
            } else {
              y = node.y1 + py;
            }

            for (const link of node.sourceLinks) {
              link.width = link.value * ky;
            }
          }
        }
      }

      reorderLinks(newColumns.flat(2));
    }

    function computeNodeBreadths(graph) {
      const columns = computeNodeLayers(graph);
      py = Math.min(dy, (y1 - y0) / (d3Array.max(columns, (c) => c.length) - 1));
      initializeNodeBreadths(columns);
    }

    function reorderLinks(nodes) {
      for (const { sourceLinks, targetLinks } of nodes) {
        targetLinks.sort(ascendingSourceBreadth);
        sourceLinks.sort(ascendingTargetBreadth);
      }

      const nodes2 = nodes.filter((d) => d.lColumn == 2);
      const nodes1 = nodes.filter((d) => d.lColumn == 1);

      for (const node of nodes2) {
        let temp = [];
        node.sourceLinks.forEach((item) => {
          let i = node.targetLinks.findIndex((d) => d.authProj === item.authProj);
          temp.push(node.targetLinks[i]);
        });
        node.targetLinks = temp;
      }

      for (const node of nodes1) {
        let sources2 = node.sourceLinks[0].target.sourceLinks.map((d) => d.authProj);
        let temp = [];
        sources2.forEach((item) => {
          let i = node.sourceLinks.findIndex((d) => d.authProj === item);
          temp.push(node.sourceLinks[i]);
        });
        node.sourceLinks = temp.filter(Boolean);
      }
    }

    return sankey;
  }

  function horizontalSource(d) {
    return [d.source.x1, d.y0];
  }

  function horizontalTarget(d) {
    return [d.target.x0, d.y1];
  }

  function sankeyLinkHorizontal() {
    return d3Shape.linkHorizontal().source(horizontalSource).target(horizontalTarget);
  }

  exports.sankey = Sankey;
  exports.sankeyCenter = center;
  exports.sankeyJustify = justify;
  exports.sankeyLeft = left;
  exports.sankeyLinkHorizontal = sankeyLinkHorizontal;
  exports.sankeyRight = right;

  Object.defineProperty(exports, '__esModule', { value: true });
});

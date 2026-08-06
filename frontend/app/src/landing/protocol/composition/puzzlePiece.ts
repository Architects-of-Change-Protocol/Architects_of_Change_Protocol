// The single, classic jigsaw-piece silhouette this section is built around —
// see ../AssetComposition.tsx for how it's used. One rounded-square body,
// two outward tabs (top, bottom) and two inward sockets (left, right), drawn
// as plain circular arcs so the contour is unambiguous even before any blur
// or lighting is applied to it. Coordinates are hand-derived (not a
// generator output): a 200x200 body centered in a 400x400 box, corner
// radius 14, bump/socket radius 30 centered on each edge. Every arc uses
// sweep-flag 1 for an outward bulge and 0 for an inward one — the two
// possible semicircles between a chord whose length equals the arc's own
// diameter — which holds for every edge because the path is always walked
// clockwise.
export const PUZZLE_PIECE_VIEWBOX = '0 0 400 400';

export const PUZZLE_PIECE_PATH =
  'M114,100 L170,100 A30,30 0 0 1 230,100 L286,100 A14,14 0 0 1 300,114 ' +
  'L300,170 A30,30 0 0 0 300,230 L300,286 A14,14 0 0 1 286,300 ' +
  'L230,300 A30,30 0 0 1 170,300 L114,300 A14,14 0 0 1 100,286 ' +
  'L100,230 A30,30 0 0 0 100,170 L100,114 A14,14 0 0 1 114,100 Z';

// http://rosettacode.org/wiki/Maze_generation#JavaScript
function maze(x, y) {
   var n = x * y - 1;
   if (n < 0) {
      alert("illegal maze dimensions");
      return;
   }
   var horiz = [];
   for (var j = 0; j < x + 1; j++) horiz[j] = [],
      verti = [];
   for (var j = 0; j < y + 1; j++) verti[j] = [],
      here = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)],
      path = [here],
      unvisited = [];
   for (var j = 0; j < x + 2; j++) {
      unvisited[j] = [];
      for (var k = 0; k < y + 1; k++)
         unvisited[j].push(j > 0 && j < x + 1 && k > 0 && (j != here[0] + 1 || k != here[1] + 1));
   }
   while (0 < n) {
      var potential = [
         [here[0] + 1, here[1]],
         [here[0], here[1] + 1],
         [here[0] - 1, here[1]],
         [here[0], here[1] - 1]
      ];
      var neighbors = [];
      for (var j = 0; j < 4; j++)
         if (unvisited[potential[j][0] + 1][potential[j][1] + 1])
            neighbors.push(potential[j]);
      if (neighbors.length) {
         n = n - 1;
         next = neighbors[Math.floor(Math.random() * neighbors.length)];
         unvisited[next[0] + 1][next[1] + 1] = false;
         if (next[0] == here[0])
            horiz[next[0]][(next[1] + here[1] - 1) / 2] = true;
         else
            verti[(next[0] + here[0] - 1) / 2][next[1]] = true;
         path.push(here = next);
      } else
         here = path.pop();
   }
   return { x: x, y: y, horiz: horiz, verti: verti };
}

var width = 1;
var height = 1;

function pushh(vp, vt, x, y, z) {
   vp.push(x);
   vp.push(y + height);
   vp.push(z);
   vt.push(0.0);
   vt.push(height);
   vp.push(x);
   vp.push(y);
   vp.push(z);
   vt.push(0.0);
   vt.push(0.0);
   vp.push(x + width);
   vp.push(y);
   vp.push(z);
   vt.push(width);
   vt.push(0.0);
   vp.push(x);
   vp.push(y + height);
   vp.push(z);
   vt.push(0.0);
   vt.push(height);
   vp.push(x + width);
   vp.push(y + height);
   vp.push(z);
   vt.push(width);
   vt.push(height);
   vp.push(x + width);
   vp.push(y);
   vp.push(z);
   vt.push(width);
   vt.push(0.0);
}

function pushv(vp, vt, x, y, z) {
   vp.push(x);
   vp.push(y + height);
   vp.push(z);
   vt.push(0.0);
   vt.push(height);
   vp.push(x);
   vp.push(y);
   vp.push(z);
   vt.push(0.0);
   vt.push(0.0);
   vp.push(x);
   vp.push(y);
   vp.push(z + width);
   vt.push(width);
   vt.push(0.0);
   vp.push(x);
   vp.push(y + height);
   vp.push(z);
   vt.push(0.0);
   vt.push(height);
   vp.push(x);
   vp.push(y + height);
   vp.push(z + width);
   vt.push(width);
   vt.push(height);
   vp.push(x);
   vp.push(y);
   vp.push(z + width);
   vt.push(width);
   vt.push(0.0);
}

function createWorld(m) {
   var vertexPositions = [];
   var vertexTextureCoords = [];
   var text = [];
   var posh = [];
   var posv = [];
   var h = m.x / 2;
   for (var j = 0; j < m.x * 2 + 1; j++) {
      var line = [];
      if (0 == j % 2) {
         for (var k = 0; k < m.y; k++) {
            if (j > 0 && m.verti[j / 2 - 1][Math.floor(k)]) { // " "
               line[k] = ' ';
            } else if (k > 0 || j > 0) { // "-"
               //pushv(vertexPositions, vertexTextureCoords, (j-1)/2 - h, 0, k - h);
               pushh(vertexPositions, vertexTextureCoords, k - h, 0, (j - 1) / 2 - h);
               posh.push({ x: k - h, z: (j - 1) / 2 - h });
            }
         }
      } else {
         for (var k = 0; k < m.y + 1; k++) {
            if (k > 0 && m.horiz[(j - 1) / 2][k - 1]) {
               line[k] = ' ';
            } else if (j != m.x * 2 - 1 || k != m.y) { // |
               //pushh(vertexPositions, vertexTextureCoords, (j-2)/2 - h, 0, k - h);
               pushv(vertexPositions, vertexTextureCoords, k - h, 0, (j - 2) / 2 - h);
               posv.push({ x: k - h, z: (j - 2) / 2 - h });
            }
         }
      }
   }
   display(posh, posv);
   return {
      p: vertexPositions,
      t: vertexTextureCoords,
      pos: {
         h: posh,
         v: posv
      }
   };
}

// https://github.com/tparisi/webgl-lessons/blob/master/lesson11/index.html
function createSphere(r) {
   var latitudeBands = 30;
   var longitudeBands = 30;
   var vertexPositionData = [];
   var normalData = [];
   var textureCoordData = [];
   for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
         var phi = longNumber * 2 * Math.PI / longitudeBands;
         var sinPhi = Math.sin(phi);
         var cosPhi = Math.cos(phi);

         var x = cosPhi * sinTheta;
         var y = cosTheta;
         var z = sinPhi * sinTheta;
         var u = 1 - (longNumber / longitudeBands);
         var v = 1 - (latNumber / latitudeBands);

         normalData.push(r * x);
         normalData.push(r * y);
         normalData.push(r * z);
         textureCoordData.push(u);
         textureCoordData.push(v);
         vertexPositionData.push(r * x + xPos);
         vertexPositionData.push(r * y + yPos);
         vertexPositionData.push(r * z + zPos);
      }
   }

   var indexData = [];
   for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
         var first = (latNumber * (longitudeBands + 1)) + longNumber;
         var second = first + longitudeBands + 1;
         indexData.push(first);
         indexData.push(second);
         indexData.push(first + 1);

         indexData.push(second);
         indexData.push(second + 1);
         indexData.push(first + 1);
      }
   }
   return {
      v: vertexPositionData,
      n: normalData,
      t: textureCoordData,
      i: indexData
   };
}

/*
+   +---+---+---+---+---+---+---+---+---+---+
|                   |                   |   |
+---+---+   +   +---+   +   +---+---+   +   +
|       |   |   |       |   |           |   |
+   +   +   +---+   +---+   +---+---+   +   +
|   |   |               |           |   |   |
+   +---+   +---+---+---+---+---+   +   +   +
|       |   |               |       |       |
+---+   +---+   +---+---+   +   +---+---+   +
|   |   |       |               |       |   |
+   +   +   +---+---+---+---+---+   +   +   +
|       |                   |       |   |   |
+   +---+---+   +---+---+   +   +---+---+   +
|   |       |   |           |       |       |
+   +   +   +---+   +---+---+   +   +   +---+
|       |           |           |
+---+---+---+---+---+---+---+---+---+---+---+
*/

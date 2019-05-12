shaders = [];
shaders.push({ name: 'shader.vert', type: "x-shader/x-vertex", data: "" });
shaders.push({ name: 'shader.frag', type: "x-shader/x-fragment", data: "" });

var gl; // webgl object
var m; // maze object in arrays
var w; // maze object in webgl objects

function initGL(canvas) {
   try {
      gl = canvas.getContext("webgl");
      resize(gl);
   } catch (e) {}
   if (!gl) {
      alert("Could not initialise WebGL, sorry :-(");
   } else {
      resize(gl);
   }
}

function loadShader(shader) {
   $.ajax({
      async: false,
      url: '3dMaze/' + shader.name,
      success: function(data) {
         shader.data = data;
      },
      dataType: 'text'
   });
}

function getShader(gl, id) {
   var shaderObj = id;
   var shaderScript = shaderObj.data;
   var shaderType = shaderObj.type;
   if (!shaderObj) {
      console.log("shader not found");
      return null;
   }

   var shader;
   if (shaderType == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
   } else if (shaderType == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
   } else {
      console.log("shader type not found");
      return null;
   }

   gl.shaderSource(shader, shaderScript);
   gl.compileShader(shader);

   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
   }

   return shader;
}

var shaderProgram;

function initShaders() {
   shaderProgram = gl.createProgram();

   for (i = 0; i < shaders.length; i++) {
      loadShader(shaders[i]);
      var shader = getShader(gl, shaders[i]);
      gl.attachShader(shaderProgram, shader);
   }

   gl.linkProgram(shaderProgram);

   if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
   }

   gl.useProgram(shaderProgram);

   shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
   gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

   shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
   gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

   shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
   shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
   shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}

function handleLoadedTexture(texture) {
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   gl.bindTexture(gl.TEXTURE_2D, texture);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
   /*gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
   */
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
   gl.generateMipmap(gl.TEXTURE_2D);

   gl.bindTexture(gl.TEXTURE_2D, null);
}

var hedgeTexture;
var groundTexture;
var moonTexture;

function initTexture() {
   hedgeTexture = gl.createTexture();
   hedgeTexture.image = new Image();
   hedgeTexture.image.onload = function() {
      handleLoadedTexture(hedgeTexture)
   };

   hedgeTexture.image.src = "images/hedge.gif";

   groundTexture = gl.createTexture();
   groundTexture.image = new Image();
   groundTexture.image.onload = function() {
      handleLoadedTexture(groundTexture)
   };

   groundTexture.image.src = "images/dirt.gif";

   moonTexture = gl.createTexture();
   moonTexture.image = new Image();
   moonTexture.image.onload = function() {
      handleLoadedTexture(moonTexture)
   };

   moonTexture.image.src = "images/moon_8k_color_brim16.gif";
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
   var copy = mat4.create();
   mat4.copy(copy, mvMatrix);
   mvMatrixStack.push(copy);
}

function mvPopMatrix() {
   if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
   }
   mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
   gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
   gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function degToRad(degrees) {
   return degrees * Math.PI / 180;
}

var currentlyPressedKeys = {};

function handleKeyDown(event) {
   if (!$("#name").is(':focus')) {
      event.preventDefault();
      currentlyPressedKeys[event.keyCode] = true;
   } else {
      showScores();
   }
}

function handleKeyUp(event) {
   if (!$("#name").is(':focus')) {
      event.preventDefault();
      currentlyPressedKeys[event.keyCode] = false;
   } else {
      showScores();
   }
}

var pitch = 0;
var pitchRate = 0;

var yaw = 90;
var yawRate = 0;

var xPos = 5.4;
var yPos = 0.3;
var zPos = 4.0;

var speed = 0;

function handleKeys() {
   if (currentlyPressedKeys[38]) {
      // Up
      pitchRate = 0.1;
   } else if (currentlyPressedKeys[40]) {
      // Down
      pitchRate = -0.1;
   } else {
      pitchRate = 0;
   }

   if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
      // Left cursor key or A
      yawRate = 0.2;
   } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
      // Right cursor key or D
      yawRate = -0.2;
   } else {
      yawRate = 0;
   }

   if (currentlyPressedKeys[87]) {
      // W // 38
      speed = 0.003;
   } else if (currentlyPressedKeys[83]) {
      // S // 40
      speed = -0.003;
   } else {
      speed = 0;
   }

}

var worldVertexPositionBuffer = null;
var worldVertexTextureCoordBuffer = null;
var groundVertexPositionBuffer = null;
var groundVertexTextureCoordBuffer = null;
var moonVertexPositionBuffer = null;
var moonVertexNormalBuffer = null;
var moonVertexTextureCoordBuffer = null;
var moonVertexIndexBuffer = null;

function handleLoadedWorld() {

   var vertexPositions = [];
   var vertexTextureCoords = [];

   m = maze(10, 10);
   w = createWorld(m);

   vertexPositions = w.p;
   vertexTextureCoords = w.t;

   worldVertexPositionBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
   worldVertexPositionBuffer.itemSize = 3;
   worldVertexPositionBuffer.numItems = vertexPositions.length / 3;

   worldVertexTextureCoordBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
   worldVertexTextureCoordBuffer.itemSize = 2;
   worldVertexTextureCoordBuffer.numItems = vertexTextureCoords.length / 2;


   var groundPositions = [-20, 0, -20, -20, 0, 20, 20, 0, 20, -20, 0, -20, 20, 0, -20, 20, 0, 20];
   var groundTextureCoords = [0, 20, 0, 0, 20, 0, 0, 20, 20, 20, 20, 0];

   groundVertexPositionBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexPositionBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundPositions), gl.STATIC_DRAW);
   groundVertexPositionBuffer.itemSize = 3;
   groundVertexPositionBuffer.numItems = groundPositions.length / 3;

   groundVertexTextureCoordBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexTextureCoordBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundTextureCoords), gl.STATIC_DRAW);
   groundVertexTextureCoordBuffer.itemSize = 2;
   groundVertexTextureCoordBuffer.numItems = groundTextureCoords.length / 2;


   var s = createSphere(20.0);

   moonVertexNormalBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(s.n), gl.STATIC_DRAW);
   moonVertexNormalBuffer.itemSize = 3;
   moonVertexNormalBuffer.numItems = s.n.length / 3;

   moonVertexTextureCoordBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(s.t), gl.STATIC_DRAW);
   moonVertexTextureCoordBuffer.itemSize = 2;
   moonVertexTextureCoordBuffer.numItems = s.t.length / 2;

   moonVertexPositionBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(s.v), gl.STATIC_DRAW);
   moonVertexPositionBuffer.itemSize = 3;
   moonVertexPositionBuffer.numItems = s.v.length / 3;

   moonVertexIndexBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(s.i), gl.STATIC_DRAW);
   moonVertexIndexBuffer.itemSize = 1;
   moonVertexIndexBuffer.numItems = s.i.length;

   $("#loadingText")[0].innerHTML = "";
}

function drawScene() {
   gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   if (worldVertexTextureCoordBuffer == null || worldVertexPositionBuffer == null) {
      return;
   }

   mat4.perspective(pMatrix, 45.0, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

   mat4.identity(mvMatrix);

   mat4.rotate(mvMatrix, mvMatrix, degToRad(-pitch), [1, 0, 0]);
   mat4.rotate(mvMatrix, mvMatrix, degToRad(-yaw), [0, 1, 0]);

   mat4.translate(mvMatrix, mvMatrix, [-xPos, -yPos, -zPos]);


   gl.activeTexture(gl.TEXTURE0);
   gl.bindTexture(gl.TEXTURE_2D, hedgeTexture);
   gl.uniform1i(shaderProgram.samplerUniform, 0);

   gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
   gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, worldVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

   gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
   gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, worldVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

   setMatrixUniforms();
   gl.drawArrays(gl.TRIANGLES, 0, worldVertexPositionBuffer.numItems);


   gl.activeTexture(gl.TEXTURE0);
   gl.bindTexture(gl.TEXTURE_2D, groundTexture);
   gl.uniform1i(shaderProgram.samplerUniform, 0);

   gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexTextureCoordBuffer);
   gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, groundVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

   gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexPositionBuffer);
   gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, groundVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

   setMatrixUniforms();
   gl.drawArrays(gl.TRIANGLES, 0, groundVertexPositionBuffer.numItems);


   mat4.identity(mvMatrix);

   mat4.rotate(mvMatrix, mvMatrix, degToRad(-pitch), [1, 0, 0]);
   mat4.rotate(mvMatrix, mvMatrix, degToRad(-yaw), [0, 1, 0]);

   mat4.translate(mvMatrix, mvMatrix, [0, -yPos, 0]);

   gl.activeTexture(gl.TEXTURE0);
   gl.bindTexture(gl.TEXTURE_2D, moonTexture);
   gl.uniform1i(shaderProgram.samplerUniform, 0);

   gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
   gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, moonVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

   gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
   gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, moonVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

   gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
   gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, moonVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
   setMatrixUniforms();
   gl.drawElements(gl.TRIANGLES, moonVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

   if (mm) {
      var size = mm.canvas.height;
      var o = size * 5 / 300; // offset
      var s = size * 28 / 300; // spacing
      var oex = size * 10 / 300 + 3.5 / 5 * (100 - size / 3); // offset from left
      var oez = size * 25 / 300 + 3.45 / 5 * (100 - size / 3); // offset from top
      drawCurPos((xPos + o) * s + oex, (zPos + o) * s + oez);
   }
}

function collision(posx, mx, posz, mz) {
   posx -= mx;
   posz -= mz;
   var collidesHorizontal = false;
   var collidesVertical = false;
   var hith = false;
   var h = w.pos.h;
   var v = w.pos.v;
   var width = 0.15;
   var length = 0.1;
   for (i in h) {
      var a = h[i];
      if (posz > a.z - width && posz < a.z + width) {
         // hitting end of horizontal wall and moving in correct direction
         if ((posx > a.x - length && posx < a.x + length && mx < 0) ||
            (posx > a.x + 1 - length && posx < a.x + 1 + length && mx > 0)) {
            // end of a single wall
            if (!collidesVertical && !collidesHorizontal) {
               collidesVertical = true;
            }
            // end of a wall in the middle of a long wall
            else {
               collidesVertical = false;
               collidesHorizontal = true;
            }
         }
         // hitting side of horizontal wall
         else if (posx > a.x - length && posx < a.x + 1 + length) {
            collidesHorizontal = true;
            collidesVertical = false;
         }
      }
   }
   hith = collidesHorizontal || collidesVertical;
   for (i in v) {
      var a = v[i];
      if (posx > a.x - width && posx < a.x + width) {
         // hitting end of vertical wall and moving in correct direction
         if ((posz > a.z - length && posz < a.z + length && mz < 0) ||
            (posz > a.z + 1 - length && posz < a.z + 1 + length && mz > 0)) {
            // end of a single wall
            if (!collidesHorizontal && !collidesVertical) {
               collidesHorizontal = true;
            }
            // end of a wall in the middle of a long wall
            else {
               if (!hith) {
                  collidesHorizontal = false;
               }
               collidesVertical = true;
            }
         }
         // hitting side of vertical wall
         else if (posz > a.z - length && posz < a.z + 1 + length) {
            collidesVertical = true;
            if (!hith) {
               collidesHorizontal = false;
            }
         }
      }
   }
   if (!collidesHorizontal && !collidesVertical) {
      return 0;
   } else if (collidesHorizontal && !collidesVertical) {
      return 1;
   } else if (!collidesHorizontal && collidesVertical) {
      return 2;
   } else {
      return 3;
   }
}

var lastTime = 0;
var joggingAngle = 0;
var startTime = 0;

function animate() {
   var timeNow = new Date().getTime();

   if (lastTime != 0) {
      var elapsed = timeNow - lastTime;
      var time = 0.00;
      if (startTime > 0) {
         time = timeNow - startTime;
         $('#time')[0].innerHTML = (time/1000).toFixed(2);
      }
      if (speed != 0) {
         mx = Math.sin(degToRad(yaw)) * speed * elapsed;
         mz = Math.cos(degToRad(yaw)) * speed * elapsed;
         c = collision(xPos, mx, zPos, mz);

         if (xPos < 5.1 && xPos > 4.9 && zPos < 4.5 && zPos > 3.5) {
            if (mx > 0 && startTime == 0) {
               startTime = timeNow;
            } else if (mx < 0) {
               startTime = 0;
               $('#time')[0].innerHTML = "0.00";
            }
         }
         if (xPos > -5.0 && xPos < -4.0 && zPos > -5.6 && zPos < -5.4) {
            if (mz > 0) {
               startTime = 0;
               if (time > 0.00) {
                  submitScore((time/1000).toFixed(2));
                  showScores();
               }
            }
         }

         if (c == 0 || c == 1) {
            xPos -= mx;
         }
         if (c == 0 || c == 2) {
            zPos -= mz;
         }

         joggingAngle += elapsed * 0.6;
         yPos = Math.sin(degToRad(joggingAngle)) / 20 + 0.4;
      }
      yaw += yawRate * elapsed;
      pitch += pitchRate * elapsed;
   }

   lastTime = timeNow;
}

function resize(canvas) {
   var realToCSSPixels = window.devicePixelRatio || 1;

   // Lookup the size the browser is displaying the canvas in CSS pixels
   // and compute a size needed to make our drawingbuffer match it in
   // device pixels.
   var displayWidth = Math.floor(canvas.canvas.clientWidth * realToCSSPixels);
   var displayHeight = Math.floor(canvas.canvas.clientHeight * realToCSSPixels);

   // Check if the canvas is not the same size.
   if (canvas.canvas.width != displayWidth ||
      canvas.canvas.height != displayHeight) {

      // Make the canvas the same size
      canvas.canvas.width = displayWidth;
      canvas.canvas.height = displayHeight;

      if (canvas.canvas.id == "webgl") {
         // Set the viewport to match
         gl.viewport(0, 0, canvas.canvas.width, canvas.canvas.height);
         gl.viewportWidth = canvas.canvas.width;
         gl.viewportHeight = canvas.canvas.height;
      }
   }
}

function tick() {
   resize(gl);
   resize(mm);
   resize(ctx);
   requestAnimFrame(tick);
   handleKeys();
   drawScene();
   animate();
}

function webGLStart() {
   var canvas = $('#webgl');
   canvas.parent().prepend($("<div>", { id: "loadingText" }));
   $('#loadingText')[0].innerHTML = "Loading...";
   canvas.after($("<div>", { id: "database", style: "width: 1000px; display: -webkit-box;" }));
   canvas.after($("<div>", { id: "name-container", style: "font-size: 1.3em;" }));
   $("#name-container")[0].innerHTML = "Name:";
   $("#name-container").append($("<input>", { type: "text", id: "name", style: "margin-left: 15px;" }));
   canvas.after($("<div>", { id: "time" }));
   $('#time')[0].innerHTML = "0.00";
   showScores();

   initGL(canvas[0]);
   initMinimap();
   initShaders();
   initTexture();
   handleLoadedWorld();

   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.enable(gl.DEPTH_TEST);

   document.onkeydown = handleKeyDown;
   document.onkeyup = handleKeyUp;

   tick();
}

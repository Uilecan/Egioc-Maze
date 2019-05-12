var mm = null;
var ctx = null;

function initMinimap() {
   mm = $('#minimap')[0].getContext('2d');
   ctx = $('#player')[0].getContext('2d');
}

function display(posh, posv) {
   $(document).ready(function() {
      if (mm.canvas.width != 300) {
         $('#minimap')[0].style.backgroundColor = "rgba(200, 0, 0, 0.75)";
      }
      var size = mm.canvas.height;
      var ox = size * 5 / 300; // offset x
      var oz = size * 5.5 / 300; // offset z
      var s = size * 28 / 300; // spacing
      var w = size * 32 / 300; // width
      var oex = size * 8 / 300 + 3.5 / 5 * (100 - size / 3); // offset from left
      var oez = size * 8 / 300 + 3.8 / 5 * (100 - size / 3); // offset from top
      if (!mm) conole.log("minimap not initialized");
      mm.fillStyle = 'rgba(255, 255, 255, 0.7)';
      posh.forEach(function(i) {
         mm.fillRect((i.x + ox) * s + oex, (i.z + oz) * s + oez, w, ox);
      });
      posv.forEach(function(i) {
         mm.fillRect((i.x + ox) * s + oex, (i.z + oz) * s + oez, ox, w);
      });
   });
}

function drawCurPos(x, y) {
   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

   radius = ctx.canvas.width * 10 / 300;
   ctx.beginPath();
   ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
   ctx.fillStyle = 'rgba(0, 255, 0, 0.75)';
   ctx.fill();
   ctx.lineWidth = 2;
   ctx.strokeStyle = 'rgba(0, 100, 0, 0.8)';
   ctx.stroke();
}

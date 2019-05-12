var name = "";

function getName() {
   name = $('#name').val();
}

function submitScore(time) {
   getName();
   if (time > 0.00) {
      xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
         if (this.readyState == 4) {
            if (this.status != 200) {
               console.log("score submission failed");
            }
         }
      }
      xmlhttp.open("SET", "php/setscore.php?q=" + time + "&n=" + name, true);
      //xmlhttp.send();
      //uncomment the previous line to post scores to a database

      newScore = true;
      return true;
   }
   newScore = false;
   return false;
}

function showScores() {
   getName();
   xmlhttp = new XMLHttpRequest();
   xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
         if (!document.getElementById("database1")) {
            document.getElementById("database").innerHTML = '<div id="database1" class="gridbox_dhx_skyblue gridbox" style="width: 50%;"></div>\n<div id="database2" class="gridbox_dhx_skyblue gridbox" style="width: 50%;"></div>'
         }
         document.getElementById("database1").innerHTML = xmlhttp.responseText;
      }
   }

   xmlhttp.open("GET", "php/showscores.php?n=" + name + "&l=" + 0 + "&o=" + "false", true);
   //xmlhttp.send();
   //uncomment the previous line to get scores from a database

   xmlhttp2 = new XMLHttpRequest();
   xmlhttp2.onreadystatechange = function() {
      if (this.readyState == 4) {
         if (!document.getElementById("database2")) {
            document.getElementById("database").innerHTML = '<div id="database1" class="gridbox_dhx_skyblue gridbox" style="width: 50%;"></div>\n<div id="database2" class="gridbox_dhx_skyblue gridbox" style="width: 50%;"></div>'
         }
         if (xmlhttp2.responseText.length > 0) {
            document.getElementById("database2").innerHTML = xmlhttp2.responseText;
         }
      }
   }

   xmlhttp2.open("GET", "php/showscores.php?n=" + name + "&l=" + 0 + "&o=" + "true", true);
   //xmlhttp2.send();
   //uncomment the previous line to get scores from a database
}

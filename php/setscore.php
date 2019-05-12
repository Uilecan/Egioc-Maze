<?php
$q = $_GET['q'];
$n = $_GET['n'];

// TODO: Insert username, password, and db name
$con=mysqli_connect("localhost","username","password","db name");
if (!$con) {
echo "<script>console.log('could not connect')</script>";
  die('Could not connect: ' . mysqli_error($con));
}

// TODO: Insert table name
mysqli_select_db($con,"table");
$sql="INSERT INTO table (Name, Score)
VALUES ('$n', '$q')";

$query = mysqli_query($con,$sql);
if (!$query) {
   echo '<script>console.log("' . mysqli_error($con) . '")</script>';
   echo "<div>failed</div>";
}
mysqli_close($con);
?>

<?php

include("../../config.php");

if(isset($_POST['name']) && isset($_POST['userName'])) {
	$name = $_POST['name'];
	$userName = $_POST['userName'];
	$date = date("Y-m-d");

	$query = mysqli_query($con, "INSERT INTO playlists VALUES(null, '$name', '$userName', '$date')");
} else {
	echo "Name or username parameters not passed into file.";
}

?>
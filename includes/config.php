<?php
	ob_start();

	session_start();

	$timezone = date_default_timezone_set("Europe/Prague");

	$con = mysqli_connect("localhost", "jakub", "bukajjudo", "slotify");

	if(mysqli_connect_errno()) {
		echo "Failed to connect: " . mysqli_connect_errno();
	}

?>
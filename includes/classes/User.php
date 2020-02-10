<?php

	class User {

		private $con;
		private $userName;

		public function __construct($con, $userName) {
			$this->con = $con;
			$this->userName = $userName;
		}

		public function getUserName() {
			return $this->userName;
		}

		public function getEmail() {
			$query = mysqli_query($this->con, "SELECT email FROM users WHERE username='$this->userName'");

			$row = mysqli_fetch_array($query);

			return $row['email'];
		}

		public function getFirstAndLastName() {
			$query = mysqli_query($this->con, "SELECT CONCAT(firstName, ' ', lastName) AS name FROM users WHERE username='$this->userName'");

			$row = mysqli_fetch_array($query);

			return $row['name'];

		}

	}
		

?>
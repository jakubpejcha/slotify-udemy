<?php 
	include("includes/includedFiles.php");

	if(isset($_GET['id'])) {
		$albumId = $_GET['id'];
	} else {
		header("Location: index.php");
	}


	$album = new Album($con, $albumId);

	$artist = $album->getArtist();

?>


<div class="entityInfo">
	<div class="leftSection">
		<img src="<?= $album->getArtworkPath(); ?>">
	</div>

	<div class="rightSection">
		<h2><?= $album->getTitle(); ?></h2>
		<p role="link" tabindex="0" onclick="openPage('artist.php?id=$artistId')">By <?= $artist->getName(); ?></p>
		<p><?= $album->getNumberOfSongs(); ?> songs</p>
	</div>
</div>

<div class="trackListContainer">
	<ul class="trackList">
		<?php
			$songsIdArray = $album->getSongIds();

			$i = 1;
			foreach ($songsIdArray as $songId) {

				$albumSong = new Song($con, $songId);

				$albumArtist = $albumSong->getArtist();

				echo "<li class='trackListRow'>
						<div class='trackCount'>
							<img class='play' src='assets/images/icons/play-white.png' onclick='setTrack(\"" . $albumSong->getId() . "\", tempPlaylist, true)'>
							<span class='trackNumber'>$i</span>
						</div>
						<div class='trackInfo'>
							<span class='trackName'>" . $albumSong->getTitle() . "</span>
							<span class='ArtistName'>" . $albumArtist->getName() . "</span>
						</div>
						<div class='trackOptions'>
							<input type='hidden' class='songId' value='" . $albumSong->getId() . "'>
							<img class='optionsButton' src='assets/images/icons/more.png' onclick='showOptionsMenu(this)'>
						</div>
						<div class='trackDuration'>
							<span class='duration'>" . $albumSong->getDuration() . "</span>
						</div>
					</li>";

				$i++;	

			}


		?>

		<script>
			var tempSongIds = '<?= json_encode($songsIdArray); ?>'
			tempPlaylist = JSON.parse(tempSongIds);
		</script>
	</ul>
</div>

<nav class="optionsMenu">
	<input type="hidden" class="songId">
	<?= Playlist::getPlaylistDropdown($con, $userLoggedIn->getUserName()); ?>

</nav>

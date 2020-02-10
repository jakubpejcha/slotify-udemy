var currentPlaylist = [];
var shufflePlaylist = [];
var tempPlaylist = [];
var audioElement;
var mouseDown = false;
var currentIndex = 0;
var repeat = false;
var shuffle = false;
var userLoggedIn;
var timer;

$(document).click(function(click) {
	var target = $(click.target);

	if(!target.hasClass("item") && !target.hasClass("optionsButton")) {
		hideOptionsMenu();
	}
});

$(window).scroll(function() {
	hideOptionsMenu();
});

$(document).on("change", "select.playlist", function() {
	var select = $(this);
	var playlistId = $(this).val();
	var songId = $(this).prev(".songId").val();

	//console.log(playlistId, songId);
	$.post("includes/handlers/ajax/addToPlaylist.php", {playlistId: playlistId, songId: songId})
	.done(function(error) {
		if(error) {
			alert(error);
			return;
		}
		hideOptionsMenu();
		select.val("");
	});
});

// dynamicky menit stranky, nechci aby treba prestala hrat posnicka
// tu stranku vlozi js pres ajax
function openPage(url) {

	if(timer != null) {
		clearTimeout(timer);
	}

	if(url.indexOf("?") == -1) {
		url += "?";
	}

	// js built-in
	// pozor, ale url obsahuje i header, to nechci - spatny margin atd..
	// header dle toho, zda ajax, nebo normalne php
	var encodedUrl = encodeURI(url + "&userLoggedIn=" + userLoggedIn);
	//console.log(encodedUrl);
	$("#mainContent").load(encodedUrl);
	// po zmene page automaticky scrolovat nahoru
	$("body").scrollTop(0);
	// budu se moci vratit zpet
	history.pushState(null, null, url);
}

function updateEmail(emailClass) {
	var emailValue = $("." + emailClass).val();

	$.post("includes/handlers/ajax/updateEmail.php", {email: emailValue, userName: userLoggedIn})
	.done(function(response) {
		// nextAll vrati vsechy siblings, nextUntil vrati prvni
		$("." + emailClass).nextAll(".message").text(response);
	});
}

function updatePassword(oldPasswordClass, newPasswordClass1, newPasswordClass2) {
	var oldPassword = $("." + oldPasswordClass).val();
	var newPassword1 = $("." + newPasswordClass1).val();
	var newPassword2 = $("." + newPasswordClass2).val();

	$.post("includes/handlers/ajax/updatePassword.php",
		{
			oldPassword: oldPassword,
			newPassword1: newPassword1,
			newPassword2: newPassword2,
			userName: userLoggedIn
		})
	.done(function(response) {
		// nextAll vrati vsechy siblings, nextUntil vrati prvni
		$("." + oldPasswordClass).nextAll(".message").text(response);
	});
}

function logout() {
	$.post("includes/handlers/ajax/logout.php", function() {
		// tady bude reload bez sessiony, takze v header se zjisti, ze zadna neni
		// a redirektuje nas to na prihlaseni
		location.reload();
	});
}

function playFirstSong() {
	setTrack(tempPlaylist[0], tempPlaylist, true);
}

function removeFromPlaylist(button, playlistId) {
	var songId = $(button).prevAll(".songId").val();

	$.post("includes/handlers/ajax/removeFromPlaylist.php", {playlistId: playlistId, songId: songId})
	.done(function(error) {
		if(error) {
			alert(error);
			return;
		}
		openPage("playlist.php?id=" + playlistId);
	});
}

function createPlaylist() {
	var popup = prompt("Please enter the name of your playlist");

	if (popup) {
		//console.log(alert);
		$.post("includes/handlers/ajax/createPlaylist.php", {name: popup, userName: userLoggedIn})
		.done(function(error) {
			if(error) {
				alert(error);
				return;
			}
			openPage("yourMusic.php");
		});
	}
}

function deletePlaylist(playlistId) {
	var prompt = confirm("Are you sure you want to delete this playlist?");

	if(prompt) {
		//console.log("deletePlaylist");
		$.post("includes/handlers/ajax/deletePlaylist.php", {playlistId: playlistId})
		.done(function(error) {
			if(error) {
				alert(error);
				return;
			}
			openPage("yourMusic.php");
		});
	}
}

function hideOptionsMenu() {
	var menu = $(".optionsMenu");
	if(menu.css("display") != "none") {
		menu.css("display", "none");
	}
}

function showOptionsMenu(button) {
	var songId = $(button).prevAll(".songId").val();
	// prevAll nejde jen na nejblizsiho, ale na nejblizsiho, ktery ma u tridu .. tedy muze preskocit 
	var menu = $(".optionsMenu");
	var menuWidth = menu.width();
	menu.find(".songId").val(songId);

	// jak daleko jsem odscrolloval od topu stranky
	var scrollTop = $(window).scrollTop();
	// pozice button od topu documentu
	var elementOffset = $(button).offset().top;

	var top = elementOffset - scrollTop;

	// dostanu jak jsem daleko od leva
	var left = $(button).position().left;

	menu.css({"top": top + "px", "left": left - menuWidth + "px", "display": "inline"});
}
	
function formatTime(seconds) {
	var time = Math.round(seconds);
	var minutes = Math.floor(time / 60);
	var seconds = time - minutes*60;

	// pro zobrazeni 4:5 => 4:05
	var extraZero;
	if (seconds < 10) {
		extraZero = "0";
	} else {
		extraZero = ""
	}

	return minutes + ":" + extraZero + seconds;
}

function updateTimeProgressBar(audio) {
	$(".progressTime.current").text(formatTime(audio.currentTime));
	$(".progressTime.remaining").text(formatTime(audio.duration - audio.currentTime));

	var progress = audio.currentTime / audio.duration * 100;
	$(".playbackBar .progress").css("width", progress + "%");
}

function updateVolumeProgressBar(audio) {
	var volume = audio.volume * 100;
	$(".volumeBar .progress").css("width", volume + "%");
}

function Audio() {

	this.currentlyPlaying;
	this.audio = document.createElement('audio');

	this.audio.addEventListener("ended", function() {
		nextSong();
	})

	this.audio.addEventListener("canplay", function() {
		// kdyz mohu prehrat - kdyz prohlizec nabufferoval dost
		// souboru, aby mohl pustit prehravani

		// updatovat remaining cas pisnicky
		$(".progressTime.remaining").text(formatTime(this.duration));// duration is built-in to audio elem

	});

	this.audio.addEventListener("timeupdate", function() {
		if (this.duration) {
			updateTimeProgressBar(this);
		}
	});

	this.audio.addEventListener("volumechange", function() {
		updateVolumeProgressBar(this);
	})

	this.setTrack = function(track) {
		this.audio.src = track.path;
		this.currentlyPlaying = track;
	}

	this.play = function() {
		this.audio.play();
	}

	this.pause = function() {
		this.audio.pause();
	}

	this.setTime = function(seconds) {
		this.audio.currentTime = seconds;
	}

}
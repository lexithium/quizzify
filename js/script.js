var isChoiceBased = false;
var isIframe = false;
var noErrors = false;

// function to turn on number of columns
function checkColStatus() {
	if($('#choicebased').is(':checked')) {
		$('#col-num').removeClass('inactive-col');
		$('.columnHead').addClass('required');
		$('#twocol, #threecol').attr('disabled', false);
		isChoiceBased = true;
	} else if($('#traditional').is(':checked') && !$('#col-num').hasClass('inactive-col')) {
		$('#col-num').addClass('inactive-col');
		$('.columnHead').removeClass('required');
		$('#twocol, #threecol').attr('checked', false);
		$('#twocol, #threecol').attr('disabled', true);
		isChoiceBased = false;
	}
}
//function to check if height and width parameters are needed
function checkSizeStatus() {
	if($('#embedcode').is(':checked')) {
		$('#height-width').removeClass('inactive-col');
		$('.embedHead').addClass('required');
		$('#userHeight, #userWidth').attr('disabled', false);
		isIframe = true;
	} else if($('#staticpage').is(':checked') && !$('#height-width').hasClass('inactive-col')) {
		$('#height-width').addClass('inactive-col');
		$('.embedHead').removeClass('required');
		$('#userHeight, #userWidth').attr('disabled', true);
		isIframe = false;
	}
}

//function to check that all required fields have been addressed
function checkForErrors() {
	$('.alert-container').html("");
	noErrors = true;
	//check spreadsheetURL
	if($('#sheetUrl').val().indexOf('docs.google.com') === -1) {
		$('.alert-container').append('<div class="alert alert-danger" role="alert"><strong>Error:</strong> Insert a valid Google Spreadsheet URL.</div>');
		scrollToTop();
		noErrors = false;
	}
	//check quiz type
	if($('input[name="quiztype"]:checked').length === 0) {
		$('.alert-container').append('<div class="alert alert-danger" role="alert"><strong>Error:</strong> Select a quiz type.</div>');
		scrollToTop();
		noErrors = false;
	}
	if($('input[name="quiztype"]:checked').length !== 0 && $('input[name="quiztype"]:checked')[0].id === 'choicebased' && $('input[name="colnums"]:checked').length === 0) {
		$('.alert-container').append('<div class="alert alert-danger" role="alert"><strong>Error:</strong> Select a layout.</div>');
		scrollToTop();
		noErrors = false;
	}
	//check primary color
	if($('input[name="prim-color"]:checked').length === 0) {
		$('.alert-container').append('<div class="alert alert-danger" role="alert"><strong>Error:</strong> Select a primary color.</div>');
		scrollToTop();
		noErrors = false;
	}
	//check output type
	if($('input[name="output-type"]:checked').length === 0) {
		$('.alert-container').append('<div class="alert alert-danger" role="alert"><strong>Error:</strong> Select an output.</div>');
		scrollToTop();
		noErrors = false;
	}
	//check size parameters
	if($('input[name="output-type"]:checked').length !== 0 && $('input[name="output-type"]:checked')[0].id === 'embedcode' && ($('input[name="width-param"]').val() === '' || $('input[name="height-param"]').val() === '')) {
		$('.alert-container').append('<div class="alert alert-danger" role="alert"><strong>Error:</strong> Input a height and width.</div>');
		scrollToTop();
		noErrors = false;
	}
	releaseOutput(noErrors);
}

function scrollToTop() {
	$('html,body').animate({
		scrollTop:0
	}, 400);
}

function releaseOutput(noErrors) {
	if(noErrors === true) {
		console.log('no errors');
		//get sheet id param
		var sheetId = '?id=' + $('#sheetUrl').val().slice($('#sheetUrl').val().indexOf('/d/')+3, $('#sheetUrl').val().indexOf('/', $('#sheetUrl').val().indexOf('/d/')+3));
		//check if they want to hide the title and make param
		if($('#hideTitle').is(':checked')) {
			var title = "&hide=yes";
		} else {
			var title = "";
		}
		//decide base URL based on type and column number
		if($('input[name="quiztype"]:checked')[0].id === 'traditional') {
			var BASE_URL = 'http://www.tampabay.com/specials/2015/quiz-generator/quizzes/traditional/';
		} else if($('input[name="quiztype"]:checked')[0].id === 'choicebased') {
			if($('input[name="colnums"]:checked')[0].id === 'twocol') {
				var BASE_URL = 'http://www.tampabay.com/specials/2015/quiz-generator/quizzes/two-col/';
			} else if($('input[name="colnums"]:checked')[0].id === 'threecol') {
				var BASE_URL = 'http://www.tampabay.com/specials/2015/quiz-generator/quizzes/three-col/';
			}
		}
		//check for background image
		if($('#bgUrl').val() !== '') {
			var bg = '&bg=' + $('#bgUrl').val();
		} else {
			var bg = '';
		}
		//get primary color
		if($('input[name="prim-color"]:checked')[0].id !== 'other-color') {
			var color = '&color=' + $('input[name="prim-color"]:checked').val();
		} else {
			var color = '&color=' + $('#hex-color').val();
		}
		//get link for share tools
		if($('#shareUrl').val() === '') {
			var share = '';
		} else {
			var share = '&share=' + $('#shareUrl').val();
		}
		//check if they want a URL or an iframe
		if($('input[name="output-type"]:checked')[0].id === 'embedcode') {
			//get height and width parameters
			var setHeight = $('input[name="height-param"]').val();
			var setWidth = $('input[name="width-param"]').val();
			$('#quizzify-result').html('<iframe src="' + BASE_URL + sheetId + title + bg + color + share + '" frameborder="0" style="width:' + setWidth + ';height:' + setHeight + ';"></iframe>');
		} else if($('input[name="output-type"]:checked')[0].id === 'staticpage') {
			$('#quizzify-result').html(BASE_URL + sheetId + title + bg + color + share);
		}
	} else {
		console.log('there were errors');
	}
}

$('#choicebased, #traditional').click(function() {
	checkColStatus();
});

$('#embedcode, #staticpage').click(function() {
	checkSizeStatus();
});

$('#quizzify').click(function() {
	checkForErrors();
});

//on click of other color, highlight other radio button
$('#hex-color').click(function() {
	$('#other-color').attr('checked', true);
});
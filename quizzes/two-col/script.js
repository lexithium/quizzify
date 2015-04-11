//function to pull parameters
function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for(var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if(pair[0] == variable) {
			return pair[1];
		}
	}
	return(false);
}

//define all the parameters
var spreadsheetId = getQueryVariable('id');
if(getQueryVariable('hideTitle') !== false && getQueryVariable('hideTitle') === 'yes') {
	$('#title').hide();
}
if(getQueryVariable('bg') !== false) {
	$('body').css({backgroundImage: getQueryVariable('bg')});
	$('#ruler').hide();
}
var quizColor = '#' + getQueryVariable('color');
$('#ruler').css({backgroundColor: quizColor});
if(getQueryVariable('share') === false) {
	var shareUrl = (window.parent.location.href !== document.URL) ? window.parent.location.href : document.URL;
} else {
	var shareUrl = getQueryVariable('share');
}

//load spreadsheet with Miso
var ds = new Miso.Dataset({
	importer : Miso.Dataset.Importers.GoogleSpreadsheet,
	parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
	key : spreadsheetId, //change this key to reflect your spreadsheet
	worksheet : "1"
});

//keep track of question number and user choices
var quesCounter = 0;
var buckCount = [];

//fetch the spreadsheet's data
ds.fetch({
	success: function() {
		//set the quiz title and description
		$('#question, title').html(ds.column('quiz title').data[0]);
		$('#description').html(ds.column('quiz description').data[0]);
		//add the thumbnails to serve as question list
		for(var i = 0; i < ds.column("question").data.length; i++) {
			$('#responsive-list').append('<div id="tiny' + i + '" class="question-boxes"></div>');
		}

		//call the function to assemble the first question
		assembleQues(quesCounter);

		//prevent the enter key from doing default action
		//of submitting multiple times
		$(document).keypress(function(event) {
			if(event.which === 13) {
				event.preventDefault();
				return false;
			}
		});

		//add the question's answer options
		function assembleQues(question) {
			$('.loading').hide();
			$('#ruler').show();
			//set up the question tracker
			$('#question-counter').html((question+1) + ' of ' + ds.column('question').data.length);

			//set up the question text
			$('#this-question').html('<h2>' + ds.column('question').data[question] + '</h2><br/>');

			//set up the question's answer boxes
			for(var p = 1; p <= (ds.columnNames().length-3)/4; p++) {
				var choice = p;
				var chbuck = 'Answer Bucket ' + choice;
				var chsource = choice + ' pic source (optional)';
				$('#this-question').append('<div class="thumbnail" id="ques' + choice + '" data-list-bucket="' + ds.column(chbuck).data[question] + '"><span></span></div>');
				$('.thumbnail').height($('.thumbnail').width());
				if(ds.column(choice).data[question].indexOf('http') === 0) {
					var thisnail = '#ques' + p;
					var backurl = 'url(' + ds.column(choice).data[question] + ')';
					if(ds.column(chsource).data[question] != null) {
						$(thisnail).append('<p class="creditos">' + ds.column(chsource).data[question] + '</p>');
					}
					$(thisnail).css({backgroundImage: backurl, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center center'});
				} else {
					var thisnail = '#ques' + p + ' span';
					var originalWidth = $('#ques' + p).outerWidth();
					var originalHeight = $('#ques' + p).outerHeight();
					$(thisnail).html(ds.column(choice).data[question]);
					resizeFont(originalWidth, originalHeight, $('#ques' + p));
				}
			}
			$('#this-question').append('<div style="clear:both;"></div>');
			nextClick();
		}

		//resize the font so it doesn't resize the div
		function resizeFont(originalWidth, originalHeight, thumbDiv) {
			if($(thumbDiv).outerWidth() !== originalWidth || $(thumbDiv).outerHeight() !== originalHeight) {
				console.log(thumbDiv + ' is too big.');
				var newFont = originalFont - 0.5;
				$(thumbDiv).css({fontSize: newFont + 'em'});
				originalFont = newFont;
				resizeFont(originalWidth, originalHeight, thumbDiv);
			}
		}

		//check for when thumbnail is clicked
		function nextClick() {
			$('.thumbnail').hover(function() {
				$(this).css({backgroundColor: quizColor, color: 'rgb(250,250,250)', boxShadow: '0 0 0 6px ' + quizColor + ' inset'});
			}, function() {
				$(this).css({backgroundColor: 'rgb(245,245,245)', color: 'rgb(34,40,39)', boxShadow: 'none'});
			});
			$('.thumbnail').click(function() {
				//record the user's choice
				var userClick = this;
				var userBucket = this.getAttribute('data-list-bucket');
				buckCount.push(userBucket);

				//change color of question tracker
				var box = "tiny" + quesCounter;
				document.getElementById(box).style.backgroundColor=quizColor;

				quesCounter++;
				//move on to the next question
				if(ds.column('question').data[quesCounter]) {
					showNext(quesCounter);
				} else {
					showFinal();
				}
			});
		}

		//set up the next question
		function showNext(question) {
			$('#this-question').animate({
				left: '-150%'
			},500, function() {
				$('#this-question').css('opacity', '0.1');
				$('#this-question').css('left', '0');
				$('#this-question').fadeTo(200,1);
				$('#this-question').css('height', $('#this-question').outerHeight(true));
				assembleQues(question);
			});
		}

		//show the final result
		function showFinal() {
			var youGot = calculateMode(buckCount);
			var numberOfBuckets = (ds.columnNames().length-3)/4;
			var questionAsked = $('#question').html();
			$('#this-question').fadeTo(200,0.1);
			$('.thumbnail').unbind('click');
			$('.thumbnail').css({backgroundColor:'rgb(245,245,245)', color: '#000', boxShadow: 'none'});
			$('#answer').html('<h2>You got: ' + youGot + '</h2>' +
				'<img id="result-image" src="' + ds.column(youGot).data[0] + '" alt="" draggable="false">' +
				'<div>' + ds.column(youGot).data[1]); + '</div>';
			if(ds.column(youGot).data[2] !== null) {
				var questionDescription = 'I got: ' + youGot + '. ' + ds.column(youGot).data[2].toString();
			} else {
				var questionDescription = 'I got: ' + youGot + '. ' + ds.column(youGot).data[1].toString();
			}
			var imageResult = $('#result-image').attr('src');
			console.log(questionDescription);
			$('#answer').append('<h2>Share your result</h2><a href="https://twitter.com/share" class="twitter-share-button" data-url="' + shareUrl + '" data-text="I got ' + youGot + '. ' + questionAsked + '" data-count="none">Tweet</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?"http":"https";if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document, "script", "twitter-wjs");</script><img id="fb-share" alt="Share on Facebook" src="../fb_share.png" draggable="false">');
			$('#answer').fadeTo(200,1);
			$('#fb-share').click(function() {
				$('#answer').append('<script>FB.ui({' +
					'method: "feed",' +
					'link: "' + shareUrl + '",' +
					'picture: "' + ds.column(youGot).data[0].toString() + '",' +
					'name: "I got ' + youGot + '. ' + questionAsked.replace('"', '') + '",' +
					'description: "' + ds.column(youGot).data[2].toString().replace('"', '') + '"' +
					'}, function(response){});</script>');
			});
		}

		//calculate which answer bucket appears the most
		function calculateMode(array) {
			var maxCount = 1;
			var thisCount = 1;
			var sortedArray = array.sort();
			var currItem = sortedArray[0]
			var mode = sortedArray[0]
			for(var x = 1; x < sortedArray.length; x++) {
				if(sortedArray[x] === currItem) {
					thisCount++;
					if(thisCount > maxCount) {
						maxCount = thisCount;
						mode = sortedArray[x];
					}
				} else if(sortedArray[x] != currItem) {
					thisCount = 1;
					currItem = sortedArray[x];
				}
			}
			return mode;
		}

		//change height of thumbnails on resize
		$(window).resize(function() {
			$('.thumbnail').height($('.thumbnail').width());
		});
	}
});
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
	var shareUrl = document.URL;
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

//keep track of question number and correct answers
var quesCounter = 0;
var corrAns = 0;

//fetch the spreadsheet's data
ds.fetch({
	success: function() {
		//set the quiz title and description
		$('#quiz-head, title').html(ds.column('quiz title').data[0]);
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

		//add the question's answer options (based on
		//whether the question is true/false or multiple choice)
		function assembleQues(question) {
			//set up the question tracker
			$('#question-counter').html((question+1) + ' of ' + ds.column("question").data.length);

			//set up the question text
			$('#this-question').html('<h2>' + ds.column("question").data[question] + '</h2><br/>');

			//set up the question's pic if given -- this is optional data in the spreadsheet
			if(ds.column("image url (optional)").data[question]) {
				$('#this-question').append('<img src="' + ds.column("image url (optional)").data[question] + '" alt="" draggable="false"><p class="image-source">' + ds.column("image source (optional)").data[question] + '</p>');
			}

			//set up the radio buttons if true/false else multiple choice
			if(ds.column('question type (tf, multiple)').data[question] === "tf") {
				$('#this-question').append('<form><input type="radio" name="answer" id="true-answer" value="True"><label for="true-answer">True</label><br/><input type="radio" name="answer" id="false-answer" value="False"><label for="false-answer">False</label></form><br/><button id="next-button" type="button">Submit</button>');
			} else {
				$('#this-question').append('<form><input type="radio" name="answer" id="aanswer" value="A"><label for="aanswer">' + ds.column("A").data[question] + '</label><br/><input type="radio" name="answer" id="banswer" value="B"><label for="banswer">' + ds.column("B").data[question] + '</label><br/><input type="radio" name="answer" id="canswer" value="C"><label for="canswer">' + ds.column("C").data[question] + '</label><br/><input type="radio" name="answer" id="danswer" value="D"><label for="danswer">' + ds.column("D").data[question] + '</label></form><br/><button id="next-button" type="button">Submit</button>');
			}
			nextClick();
		}

		//check for when next button is clicked
		function nextClick() {
			$('#next-button').css({backgroundColor: quizColor});
			$('#next-button').click(function() {
				var radios = document.getElementsByTagName('input');
				var value;
				for(var i = 0; i < radios.length; i++) {
					if(radios[i].type === "radio" && radios[i].checked && radios[i].value === ds.column('correct answer').data[quesCounter]) {
						showAnswer(true);

					} else if(radios[i].type === "radio" && radios[i].checked && radios[i].value != ds.column('correct answer').data[quesCounter]) {
						showAnswer(false);
					}
				}
			});
		}

		//show the answer pane
		function showAnswer(score) {
			$('#answer').show(200);
			$('#this-question').fadeTo(200, 0.1);
			if(score === true) {
				//to display the affirmative response
				$('#answer').html('<img src="' + ds.column("explanation pic").data[quesCounter] + '" alt="" draggable="false"><p class="image-source">' + ds.column("pic source").data[quesCounter] + '</p><br/><h2>That\'s correct!</h2><br/><p class="explain">' + ds.column("explanation snippet").data[quesCounter] + '</p>');

				//change color of question tracker
				var box = "tiny" + quesCounter;
				document.getElementById(box).style.backgroundColor="rgb(80,162,145)";
				corrAns++;
			} else if(score === false) {
				//to display the correct answer as well as letter
				if(ds.column("question type (tf, multiple)").data[quesCounter] === "multiple") {
					var corrLett = '. ' + ds.column(ds.column("correct answer").data[quesCounter]).data[quesCounter];
				} else {
					var corrLett = '';
				}

				//change text inside popout
				$('#answer').html('<img src="' + ds.column("explanation pic").data[quesCounter] + '" alt="" draggable="false"><p class="image-source">' + ds.column("pic source").data[quesCounter] + '</p><br/><h2>That\'s incorrect. The correct answer is ' + ds.column("correct answer").data[quesCounter] +  corrLett + '.</h2><br/><p class="explain">' + ds.column("explanation snippet").data[quesCounter] + '</p>');

				//change color of question tracker
				var box = "tiny" + quesCounter;
				document.getElementById(box).style.backgroundColor="rgb(221,99,75)";
			}
			$('#answer').append('<br/><button id="submit-button" type="button">Next</button>');
			$('#submit-button').css({backgroundColor: quizColor});

			quesCounter++;
			if(ds.column("question").data[quesCounter]) {
				showNext(quesCounter);
			} else {
				showFinal();
			}
		}

		//set up the next question
		function showNext(question) {
			$('#submit-button').click(function() {
				$('#answer').hide();
				$('#this-question').fadeTo(200, 1);
				assembleQues(question);
			});
		}

		//show the final score
		function showFinal() {
			$('#submit-button').click(function() {
				var percentage = Math.ceil((corrAns/ds.column("question").data.length)*100);
				$('#answer').html('<img src="' + ds.column('final image').data[0] + '" alt="" draggable="false"><p id="answer-sources">Sources: </p><br/><h2 style="text-align:center;">You scored ' + percentage + '%.</h2><br/><button id="finish-button" type="button">Try again</button>');

				$('#finish-button').css({backgroundColor: quizColor});

				for(var x = 0; x < ds.column("source").data.length; x++) {
					if(x + 1 === ds.column("source").data.length) {
						$('#answer-sources').append(ds.column("source").data[x]);
					} else {
						$('#answer-sources').append(ds.column("source").data[x] + ', ');
					}
				}
				restartQuiz();
			});
		}

		//restart the quiz after the end
		function restartQuiz() {
			$('#finish-button').click(function() {
				quesCounter = 0;
				corrAns = 0;
				$('#answer').hide();
				$('#this-question').fadeTo(200, 1);
				$('#responsive-list div').css('background-color', 'rgb(200,200,200)')
				assembleQues(quesCounter);
			});
		}
	},
	error: function() {
		$('#title').html("<h1>There was an error loading this quiz. Please try again later.</h1>");
	}
});
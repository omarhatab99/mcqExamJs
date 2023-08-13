
//identifiers
let countSpan = document.querySelector(".count span");
let bulletsSpanContainer = document.querySelector(".bullets .spans");
let quizArea = document.querySelector(".quiz-area");
let answerArea = document.querySelector(".answers-area");
let submitBtn = document.getElementById("submit-answer");
let previousQuestion = document.getElementById("back-answer");
let ConfirmPreviousQuestion = document.getElementById("confirm-prev");
let resultDiv = document.querySelector(".result");
let questionListDiv = document.querySelector(".questions-list");
let questionListContainer = document.querySelector(".questions-list .data-list");
let bulletsSpan = document.getElementsByName("span");
let countDownElement = document.querySelector(".count-down");
let answers = [];
let duration = 60;



//current object index
let currentObjectIndex = 0;
let countDownInterval;



//check your name
if(localStorage.getItem("name")) {
  document.querySelector(".quiz-info .name span").innerHTML = localStorage.getItem("name");
}
else {
  let name = prompt("what is your name ??");
  document.querySelector(".quiz-info .name span").innerHTML = name || "unknown";
  localStorage.setItem("name" , name || "unknown");
};

//check exam time finished or not finished
checkDateExam()

//check answers and current index
checkAnswers()


function checkAnswers() {
  //check answers and current index
  if(localStorage.getItem("Answers")) {
    answers = JSON.parse(localStorage.getItem("Answers"));
    currentObjectIndex = answers.length;
  }
}


//check exam time finished or not finished
function checkDateExam() {
    //check exam time finished or not finished
  if(localStorage.getItem("dateExam")) {
    //get date exam from local storage and convert it to normal date
    let dateExam = new Date(parseInt(localStorage.getItem("dateExam")));
    //check if exam is time out or no
    if(dateExam > new Date()) { //exam not finished
      //remove class disabled;
      previousQuestion.classList.remove("disabled");      
      //override duration of exam from localStorage
      duration = parseInt(localStorage.getItem("liveTime")); 
    }
    else { //exam finished
      //let duration equal 0
      duration = 0;
    }
  }
  else {
    //create new timestamps for exam
    let currentMinutes = new Date().getMinutes();  
    let milliSecondDate = new Date().setMinutes(currentMinutes + 1);
    localStorage.setItem("dateExam" , milliSecondDate);
  };
}

//get all questions from database
function getQuestions() {
  let request = new XMLHttpRequest();

  request.open("GET" , "question.json" , true);

  request.send();

  request.onreadystatechange = function() {
    if(this.readyState === 4 && this.status === 200) {
      let questionsObjects = JSON.parse(request.responseText);
      let questionsLength = questionsObjects.length;
      
      

      //start countDown
      countDown(duration , questionsLength);

      //create bullets and set number of questions
      createBullets(questionsLength);

      //add questions data
      addQuestion(questionsObjects[currentObjectIndex]);

      //submit question answer
      submitBtn.addEventListener("click" , function() {
          //validation of question
          if(questionValidation() === true) {
            //increment currentObjectIndex by one
            currentObjectIndex++;

            //remove class disabled from previous
            previousQuestion.classList.remove("disabled");

            //get question answer and store it in localStorage
            getQuestionAnswer();

            if(currentObjectIndex < questionsLength) {
              //add next questions
              addQuestion(questionsObjects[currentObjectIndex]);
              console.log(answers)
            }
            else {
              //check correct answers and get result
              checkQuestionsCountAndGetResult(questionsObjects , questionsLength);
            }
          }
      });

      //confirm previous question click
      ConfirmPreviousQuestion.addEventListener("click" , function() {
        if(currentObjectIndex > 0 && currentObjectIndex < questionsLength) {
          //remove class disabled;
          previousQuestion.classList.remove("disabled");

          //decrement currentIndexObject by one
          currentObjectIndex--;

          //remove last index from array answers
          answers.pop();
          console.log(answers);

          //store at local storage
          localStorage.setItem("Answers" , JSON.stringify(answers));

          //remove previous question
          quizArea.innerHTML = "";
          answerArea.innerHTML ="";

          //add previous questions
          addQuestion(questionsObjects[currentObjectIndex]);

          //handle bullets
          handleBullets();

          if(currentObjectIndex === 0)
            {previousQuestion.classList.add("disabled")};

          console.log("yes");
        }
        else {
          //disabled button previous
          console.log("no")
          previousQuestion.classList.add("disabled");
        }
      });
    }
  };
}


getQuestions();


//create bullets and set number of questions
function createBullets(questionsCount) {
  countSpan.textContent = parseInt(questionsCount);

  //create bullets span
  for(let index = 0; index < questionsCount; index++) {
    let spanBullet = document.createElement("span");
    //append
    bulletsSpanContainer.appendChild(spanBullet);
  }

  //add class on to first bullet
  bulletsSpanContainer.firstElementChild.classList.add("on");
}

//add questions data
function addQuestion(obj) {
  //create question title h2
  let questionTitleElement = document.createElement("h2");
  let questionTitleText = document.createTextNode(obj.title);

  //append question title
  questionTitleElement.appendChild(questionTitleText);
  quizArea.appendChild(questionTitleElement);

  //create questions answers 4
  for (let index = 0; index < 4; index++) {

    //create div answer
    let answerDiv = document.createElement("div");

    //style answer div
    answerDiv.classList.add("answer");

    //append answer div into answer area
    answerArea.appendChild(answerDiv);

    //create question answer radio input
    let answerRadio = document.createElement("input");

    //style answer input radio
    answerRadio.id = `answer_${index + 1}`;
    answerRadio.name = "questions";
    answerRadio.type = "radio";
    answerRadio.dataset.answer = obj[`answer_${index + 1}`];

    //append radio input into quiz answer div
    answerDiv.appendChild(answerRadio);

    //create label answer
    let labelElement = document.createElement("label");
    let labelText = document.createTextNode(obj[`answer_${index + 1}`]);

    //style label
    labelElement.htmlFor = `answer_${index + 1}`;

    //append labelText into labelElement
    labelElement.appendChild(labelText);

    //append label into answer div
    answerDiv.appendChild(labelElement);
  }

  //add class on in next bullet
  handleBullets();
}

function questionValidation() {
  let questionAnswers = document.getElementsByName("questions");
  let questionAnswersArr = Array.from(questionAnswers);
    //check if no answer was chosen
  if(questionAnswersArr.some(inputRadio => inputRadio.checked === true)) {
    document.getElementById("no-choose").style.display = "none";
    return true;
  }
  else {
    document.getElementById("no-choose").style.display = "block";
    return false;
  };
}

//create function check answer after submit
function getQuestionAnswer() {
  let questionAnswers = document.getElementsByName("questions");
  let questionAnswersArr = Array.from(questionAnswers);

    //filter choose answer and map to get dataset and convert it to string
    let answerSelected = questionAnswersArr.filter(inputRadio => inputRadio.checked)
    .map((inputRadio) => {return inputRadio.dataset.answer}).join();

    //push answer selected into answers array
    answers.push(answerSelected);

    //add answers array to localStorage
    localStorage.setItem("Answers" , JSON.stringify(answers));

    //remove previous question
    quizArea.innerHTML = "";
    answerArea.innerHTML ="";
}

//check if questions is finished and get result
function checkQuestionsCountAndGetResult(questions , questionsCount) {

  let degree = 0;

    //check correct answers and get result
    for (let index = 0; index < questionsCount; index++) {
      if(questions[index]["right_answer"] === answers[index]) {
        degree++
      }
  }

    //remove quiz area and answers Area
    quizArea.remove();
    answerArea.remove();

    //stop clicking submit button;
    submitBtn.style.pointerEvents = "none";
    //change backgroundColor
    submitBtn.classList.replace("btn-primary" , "btn-success");
    //innerHtml
    submitBtn.innerHTML = "questions is finished";

    //hide previousQuestion button
    previousQuestion.style.display = "none";

    //get correct answers with title after exam finished
    getAnswersWithTitle(questions);

    //stop count down
    clearInterval(countDownInterval);

    //remove localStorage 
    localStorage.removeItem("Answers");
    localStorage.removeItem("dateExam");
    localStorage.removeItem("liveTime");
    localStorage.removeItem("name");

    //check degree
    if(((degree / questionsCount) * 100) >= 85) {
      handleDegreeResult("Perfect" , degree , questionsCount);
    }
    else if(((degree / questionsCount) * 100) >= 75) {
      handleDegreeResult("Good" , degree , questionsCount);
    }
    else {
      handleDegreeResult("Bad" , degree , questionsCount);
    }

}

//handle bullets with submitBtn
function handleBullets() {
  let bulletsSpan = document.querySelectorAll(".bullets .spans span");
  bulletsSpan.forEach((span , index) => {
    if(currentObjectIndex >= index) {
      span.classList.add("on");
    }
    else {
      span.classList.remove("on");
    }
  });
}

//handle degree result
function handleDegreeResult(specified , degree , questionsCount) {
      //show resultDiv
      resultDiv.style.display = "block";

      //create span for specified degree
      let degreeSpan = document.createElement("span");

      //create span result Text node
      let resultDegreeText = document.createTextNode(`You Answered ${degree} From ${questionsCount}`);

      //add class specified degree on span
      degreeSpan.className = specified;
      degreeSpan.style.marginRight = "10px";

      //add specified word at degreeSpan
      degreeSpan.textContent = specified;

      //append degreeSpan into resultDiv
      resultDiv.appendChild(degreeSpan);

      //append resultDegreeText into resultDiv
      resultDiv.appendChild(resultDegreeText);
}


//get correct answers with title after exam finished
function getAnswersWithTitle(questions) {
    //show question List
  questionListDiv.style.display = "block";

  for (let index = 0; index < questions.length; index++) {

    //create dt
      let questionsList = document.createElement("dt");
      let questionListText = document.createTextNode(questions[index]["title"]);

    //append to questionList Div
    questionsList.appendChild(questionListText);
    questionListContainer.appendChild(questionsList);

    //create dd
    let questionDescription = document.createElement("dd");
    let questionDescriptionText = document.createTextNode(questions[index]["right_answer"]);

    //append to questionList Div
    questionDescription.appendChild(questionDescriptionText);
    questionListContainer.appendChild(questionDescription);

      //check if answers equal correct answers

      if(questions[index]["right_answer"] === answers[index]) {
        questionDescription.className = "text-success";
      }
      else {
        questionDescription.className = "text-danger";
      }
    }
}


//create count Down
function countDown(duration , count) {

    let minutes , seconds , liveTime;

    countDownInterval = setInterval(() => {

      liveTime = duration - 1;

      localStorage.setItem("liveTime" , liveTime);
      

      minutes = parseInt(duration / 60);
      seconds = parseInt(duration % 60);



      minutes = (minutes < 10) ? `0${minutes}`:minutes;
      seconds = (seconds < 10) ? `0${seconds}`:seconds;

      countDownElement.innerHTML = `${minutes} : ${seconds}`;

      if(--duration < 0) {
        let questionAnswers = document.getElementsByName("questions");
        let questionAnswersArr = Array.from(questionAnswers);

        clearInterval(countDownInterval);

        currentObjectIndex = count - 1;

        questionAnswersArr[0].checked = true;

        submitBtn.click();
      };
    } , 1000);
}
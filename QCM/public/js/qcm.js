const socket = io.connect('http://localhost:2000');

socket.emit('message', 'J\'ai renseigné mon nom et prénom, je vais pouvoir faire le questionnaire');
const questionBloc = document.querySelector('#question');
const answerBloc = document.querySelector('#answer');
const suivant = document.querySelector("#suivant");
let currentQcm = {};
let resultCandidat = {};
let questionNumber = 0;
let questionTimer;

const startQuestionTimer = () => {
  if (currentQcm && currentQcm[questionNumber] && currentQcm[questionNumber].time) {
    let timeleft = currentQcm[questionNumber].time;
    questionTimer = setInterval((timer) => {
      timeleft--;
      document.querySelector("#countdowntimer").innerHTML = timeleft;
      if (timeleft <= 0) {
        clearInterval(questionTimer);
        confirm("Temps ecoulé !\n On passe à la question suivant");
        nextQuestion();
      }
    }, 1000);
  }
}


const writeQuestion = () => {

  startQuestionTimer();
  questionBloc.innerHTML = currentQcm[questionNumber].question;
  while (answerBloc.firstChild) {
    answerBloc.removeChild(answerBloc.firstChild);
  }

  switch (currentQcm[questionNumber].type) {
    case ('choice'):
      const writeRadioAnswer = (element, index, array) => {
        let radio = document.createElement('INPUT')
        radio.setAttribute('type', 'radio')
        radio.setAttribute('value', element)
        radio.setAttribute('name', 'nom')
        let txt = document.createTextNode(element)
        answerBloc.appendChild(radio)
        answerBloc.appendChild(txt)
      }
      currentQcm[questionNumber].choices.forEach(writeRadioAnswer);
      break;
    case ('free'):
      let inputT = document.createElement('INPUT')
      inputT.setAttribute('type', 'text')
      inputT.setAttribute('id', 'repText')
      questionBloc.appendChild(inputT)
      break;
  }
}


const checkAnswer = () => {
  const resultQuestion = {
    'question': currentQcm.question,
    'success': false,
    'answer': ''
  };
  resultQuestion.question = currentQcm[questionNumber].question;
  switch (currentQcm[questionNumber].type) {
    // Pour les question a choix multiple
    case 'choice':
      for (let i = 0; i < answerBloc.childElementCount; i++) {
        if (answerBloc.children[i].checked == true) {
          resultQuestion.answer = answerBloc.children[i].value;
          for (let k = 0; k < currentQcm[questionNumber].responses.length; k++) {
            if ((answerBloc.children[i].value) == currentQcm[questionNumber].responses[k]) {
              resultQuestion.success = true;
            }
          }
        }
      }
      break;

    case 'free':
      for (let k = 0; k < currentQcm[questionNumber].responses.length; k++) {
        if (document.querySelector("#repText").value.toUpperCase() == currentQcm[questionNumber].responses[k].toUpperCase()) {
          resultQuestion.success = true;
        }
      }
      resultQuestion.answer = document.querySelector("#repText").value;
      break;
  }
  return resultQuestion;
}

const nextQuestion = () => {
  clearInterval(questionTimer);
  resultCandidat.answers.push(checkAnswer());

  if (questionNumber + 1 >= currentQcm.length) {
    document.querySelector("#countdowntimer").style.display = "none"
    suivant.value = "Terminé"
    questionBloc.innerHTML = "C'est fini"
    const success = resultCandidat.answers.filter(x => x.success === true).length;
    resultCandidat.score = success / currentQcm.length * 100
    alert('Votre note est ' + resultCandidat.score + '%');
  } else {
    alert(JSON.stringify(resultCandidat, null, 2));
    questionNumber++;
    writeQuestion();
  }
}


socket.on('qcm', (qcm) => {
  currentQcm = qcm;
  resultCandidat = {
    'name': 'John Doe',
    'date': Date.now(),
    'score': 0,
    'answers': []
  };

  writeQuestion();
  suivant.addEventListener('click', nextQuestion)
})
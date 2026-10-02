/* Interface, navigation du quiz, résultats et impression du certificat. */
(() => {
  'use strict';
  const PASS_THRESHOLD = 70;
  const TOTAL_QUESTIONS = 100;
  const translations = {
    fr: {
      mustValidate: 'Validez votre réponse pour continuer.',
      feedbackCorrect: '✓ Correcte ! Bonne réponse.',
      feedbackIncorrect: '✗ Incorrecte. La bonne réponse est : {answer}',
      learning:'APPRENTISSAGE · SCRUM',language:'Langue',eyebrow:'SERIOUS GAME · PRODUCT OWNERSHIP',homeTitle:'Faites grandir la valeur.<br><em>Une décision à la fois.</em>',intro:'Évaluez vos connaissances du rôle de Product Owner au fil d’un parcours interactif inspiré des principes Scrum.',start:'Commencer le parcours',timeHint:'À votre rythme · 100 questions',yourChallenge:'VOTRE PARCOURS',questions:'questions',challengeCopy:'Une question après l’autre. Votre progression est conservée.',passThreshold:'Seuil de réussite',footerLine:'Clarté · Priorisation · Valeur durable',quizEyebrow:'VOTRE PARCOURS',quizHeading:'Product Owner · Les fondamentaux',quit:'Quitter',singleAnswer:'UNE SEULE RÉPONSE',previous:'← Précédent',next:'Suivant →',validate:'Valider la réponse',finish:'Terminer le quiz',answered:'répondues',unanswered:'Il reste {n} question(s) sans réponse. Répondez-y avant de terminer.',selectAnswer:'Sélectionnez une réponse pour continuer.',resultEyebrow:'VOTRE RÉSULTAT',passedTitle:'Félicitations !',failedTitle:'Continuez à progresser',passedMessage:'Vous avez atteint le seuil de réussite. Votre engagement et votre compréhension des principes de Product Ownership sont récompensés.',failedMessage:'Vous n’avez pas encore atteint le seuil de réussite de 70 %. Vous pouvez recommencer pour poursuivre votre apprentissage.',correctAnswers:'Bonnes réponses',incorrectAnswers:'Mauvaises réponses',scoreLabel:'Score',certificatePrompt:'Bravo ! Indiquez votre nom complet pour préparer votre certificat.',fullName:'Nom et prénom complet',nameRequired:'Veuillez saisir votre nom complet.',getCertificate:'Obtenir mon certificat',restart:'Recommencer',certificateEyebrow:'VOTRE ACCOMPLISSEMENT',certificateReady:'Votre certificat est prêt',backToResult:'← Résultats',downloadPdf:'Télécharger le certificat PDF',pdfNote:'Le dialogue d’impression du navigateur s’ouvre. Choisissez « Enregistrer au format PDF » et le format A4 paysage.',certKicker:'CERTIFICAT DE RÉUSSITE',certTitle:'CERTIFICAT',certIntro:'Nous certifions que',certAchievement:'a réussi le parcours de formation avec le score indiqué ci-dessous.',certDate:'Délivré le',certScore:'Résultat',certSigner:'Signature · [NOM DU SIGNATAIRE]',certSeal:'VALIDÉ',certOrg:'[NOM DE L’ORGANISME]',certCourse:'[NOM DE LA FORMATION]',quitConfirm:'Votre progression actuelle sera perdue. Quitter le quiz ?',restartConfirm:'Recommencer le quiz ? Votre progression actuelle sera perdue.',printTitle:'Certificat de réussite'},
    en: {
      mustValidate: 'Validate your answer to continue.',
      feedbackCorrect: '✓ Correct! Well done.',
      feedbackIncorrect: '✗ Incorrect. The correct answer is: {answer}',
      learning:'LEARNING · SCRUM',language:'Language',eyebrow:'SERIOUS GAME · PRODUCT OWNERSHIP',homeTitle:'Grow product value.<br><em>One decision at a time.</em>',intro:'Assess your knowledge of the Product Owner role in an interactive journey inspired by Scrum principles.',start:'Start the journey',timeHint:'At your own pace · 100 questions',yourChallenge:'YOUR JOURNEY',questions:'questions',challengeCopy:'One question at a time. Your progress is saved.',passThreshold:'Passing score',footerLine:'Clarity · Prioritization · Sustainable value',quizEyebrow:'YOUR JOURNEY',quizHeading:'Product Owner · The fundamentals',quit:'Quit',singleAnswer:'SELECT ONE ANSWER',previous:'← Previous',next:'Next →',validate:'Validate answer',finish:'Finish quiz',answered:'answered',unanswered:'{n} question(s) remain unanswered. Answer them before finishing.',selectAnswer:'Select an answer to continue.',resultEyebrow:'YOUR RESULT',passedTitle:'Congratulations!',failedTitle:'Keep learning',passedMessage:'You have reached the passing score. Your commitment and understanding of Product Ownership principles have paid off.',failedMessage:'You have not yet reached the 70% passing score. You can try again to continue learning.',correctAnswers:'Correct answers',incorrectAnswers:'Incorrect answers',scoreLabel:'Score',certificatePrompt:'Well done! Enter your full name to prepare your certificate.',fullName:'Full name',nameRequired:'Please enter your full name.',getCertificate:'Get my certificate',restart:'Try again',certificateEyebrow:'YOUR ACHIEVEMENT',certificateReady:'Your certificate is ready',backToResult:'← Results',downloadPdf:'Download certificate PDF',pdfNote:'Your browser print dialog will open. Choose “Save as PDF” and A4 landscape format.',certKicker:'CERTIFICATE OF ACHIEVEMENT',certTitle:'CERTIFICATE',certIntro:'This is to certify that',certAchievement:'has successfully completed the learning course with the score shown below.',certDate:'Awarded on',certScore:'Result',certSigner:'Signature · [SIGNATORY NAME]',certSeal:'PASSED',certOrg:'[ORGANIZATION NAME]',certCourse:'[COURSE NAME]',quitConfirm:'Your current progress will be lost. Quit the quiz?',restartConfirm:'Restart the quiz? Your current progress will be lost.',printTitle:'Certificate of achievement'}
  };
  const $ = id => document.getElementById(id);
  let lang = 'fr';
  let currentIndex = 0;
  let answers = [];
  let validated = [];
  let result = null;
  let certificateId = '';
  let participantName = '';
  const screens = ['homeScreen','quizScreen','resultScreen','certificateScreen'];

  function setScreen(id) { screens.forEach(screen => $(screen).classList.toggle('hidden', screen !== id)); window.scrollTo({top:0,behavior:'smooth'}); }
  function changeLanguage(nextLang) {
    lang = nextLang === 'en' ? 'en' : 'fr';
    document.documentElement.lang = lang;
    document.title = lang === 'fr' ? 'Product Owner — Serious Game' : 'Product Owner — Serious Game';
    document.querySelectorAll('[data-i18n]').forEach(el => { const key=el.dataset.i18n; if(translations[lang][key]) el.innerHTML=translations[lang][key]; });
    $('languageSelect').value = lang;
    if (!$('quizScreen').classList.contains('hidden')) showQuestion();
    if (!$('resultScreen').classList.contains('hidden') && result) renderResult();
    if (!$('certificateScreen').classList.contains('hidden') && result) generateCertificate();
    updateAnsweredCount();
  }
  function startGame() { currentIndex=0; answers=Array(TOTAL_QUESTIONS).fill(null); validated=Array(TOTAL_QUESTIONS).fill(false); result=null; $('unansweredWarning').classList.add('hidden'); setScreen('quizScreen'); showQuestion(); }
  function showQuestion() {
    const q=questions[currentIndex]; if(!q) return;
    const isValidated=validated[currentIndex];
    $('questionNumber').textContent=String(q.id).padStart(2,'0');
    $('questionText').textContent=q[lang==='fr'?'questionFR':'questionEN'];
    const percentage=Math.round((validated.filter(Boolean).length/TOTAL_QUESTIONS)*100);
    $('progressLabel').textContent=lang==='fr'?`Question ${currentIndex+1} / ${TOTAL_QUESTIONS}`:`Question ${currentIndex+1} / ${TOTAL_QUESTIONS}`;
    $('progressPercent').textContent=`${percentage}%`; $('progressFill').style.width=`${percentage}%`;
    const bar=document.querySelector('.progress-track'); bar.setAttribute('aria-valuenow',String(percentage)); bar.setAttribute('aria-label',lang==='fr'?'Progression':'Progress');
    const list=$('optionsList'); list.replaceChildren();
    ['A','B','C','D'].forEach(letter=>{const button=document.createElement('button');button.type='button';button.className='option'+(answers[currentIndex]===letter?' selected':'');button.setAttribute('role','radio');button.setAttribute('aria-checked',answers[currentIndex]===letter?'true':'false');button.innerHTML=`<span class="option-key">${letter}</span><span></span>`;button.lastElementChild.textContent=q.options[letter][lang];if(isValidated&&letter===q.correctAnswer)button.classList.add('answer-correct');if(isValidated&&answers[currentIndex]===letter&&letter!==q.correctAnswer)button.classList.add('answer-incorrect');button.disabled=isValidated;button.addEventListener('click',()=>selectAnswer(letter));list.append(button);});
    $('previousButton').disabled=currentIndex===0;
    $('nextButton').textContent=currentIndex===TOTAL_QUESTIONS-1?(lang==='fr'?'Terminer →':'Finish →'):translations[lang].next;
    $('validateButton').disabled=isValidated||answers[currentIndex]===null;
    $('validateButton').textContent=isValidated?(lang==='fr'?'Réponse validée ✓':'Answer validated ✓'):translations[lang].validate;
    const hint=$('answerHint');hint.className='answer-hint'+(isValidated?(answers[currentIndex]===q.correctAnswer?' feedback-correct':' feedback-incorrect'):'');
    hint.textContent=isValidated?(answers[currentIndex]===q.correctAnswer?translations[lang].feedbackCorrect:translations[lang].feedbackIncorrect.replace('{answer}',q.correctAnswer)):(answers[currentIndex]===null?translations[lang].selectAnswer:'');
    $('unansweredWarning').classList.add('hidden'); updateAnsweredCount();
  }
  function selectAnswer(letter) { if(validated[currentIndex])return;answers[currentIndex]=letter;showQuestion(); }
  function validateAnswer() { if(answers[currentIndex]===null){$('answerHint').textContent=translations[lang].selectAnswer;return;}if(validated[currentIndex])return;validated[currentIndex]=true;showQuestion(); }
  function updateAnsweredCount() { const n=answers.filter(a=>a!==null).length; $('answeredCount').textContent=`${n} / ${TOTAL_QUESTIONS} ${translations[lang].answered}`; }
  function nextQuestion() { if(!validated[currentIndex]){ $('answerHint').textContent=answers[currentIndex]===null?translations[lang].selectAnswer:translations[lang].mustValidate;return;} if(currentIndex<TOTAL_QUESTIONS-1){currentIndex++;showQuestion();$('questionText').focus({preventScroll:true});}else finishGame(); }
  function previousQuestion() { if(currentIndex>0){currentIndex--;showQuestion();$('questionText').focus({preventScroll:true});} }
  function calculateScore() { const correct=questions.reduce((sum,q,i)=>sum+(answers[i]===q.correctAnswer?1:0),0);return {correct,incorrect:TOTAL_QUESTIONS-correct,percentage:Math.round(correct/TOTAL_QUESTIONS*100),passed:correct/TOTAL_QUESTIONS*100>=PASS_THRESHOLD}; }
  function finishGame() { const missing=validated.filter(v=>!v).length;if(missing){$('unansweredWarning').textContent=translations[lang].unanswered.replace('{n}',missing);$('unansweredWarning').classList.remove('hidden');$('unansweredWarning').scrollIntoView({behavior:'smooth',block:'nearest'});return;} result=calculateScore();showResult(); }
  function showResult() { renderResult();setScreen('resultScreen'); }
  function renderResult() { const root=$('resultScreen');root.classList.toggle('passed',result.passed);$('resultTitle').textContent=translations[lang][result.passed?'passedTitle':'failedTitle'];$('resultMessage').textContent=translations[lang][result.passed?'passedMessage':'failedMessage'];$('correctScore').textContent=`${result.correct} / ${TOTAL_QUESTIONS}`;$('incorrectScore').textContent=String(result.incorrect);$('percentScore').textContent=`${result.percentage}%`;$('passActions').classList.toggle('hidden',!result.passed);$('failActions').classList.toggle('hidden',result.passed); }
  function generateCertificateId() { const random=crypto.getRandomValues(new Uint8Array(4));const code=Array.from(random,b=>b.toString(36).toUpperCase().padStart(2,'0')).join('').slice(0,6);return `CERT-${new Date().getFullYear()}-${code}`; }
  function generateCertificate() { if(!certificateId)certificateId=generateCertificateId();const t=translations[lang];$('certId').textContent=`ID: ${certificateId}`;$('certKicker').textContent=t.certKicker;$('certTitle').textContent=t.certTitle;$('certIntro').textContent=t.certIntro;$('certName').textContent=participantName;$('certCourse').textContent=lang==='fr'?'Approche Agile':'Agile Approach';$('certAchievement').textContent=t.certAchievement;$('certDate').textContent=`${t.certDate}: ${new Intl.DateTimeFormat(lang==='fr'?'fr-FR':'en-GB',{day:'numeric',month:'long',year:'numeric'}).format(new Date())}`;$('certScore').textContent=`${t.certScore}: ${result.correct}/100 · ${result.percentage}%`;$('certSigner').textContent=t.certSigner;$('certOrg').textContent=t.certOrg;$('certSealText').textContent=t.certSeal; }
  function showCertificate() { const value=$('participantName').value.trim();if(!value){$('nameError').textContent=translations[lang].nameRequired;$('nameError').classList.remove('hidden');$('participantName').focus();return;}participantName=value;$('nameError').classList.add('hidden');generateCertificate();setScreen('certificateScreen'); }
  function restartGame() { if(!confirm(translations[lang].restartConfirm))return;certificateId='';participantName='';$('participantName').value='';startGame(); }
  $('languageSelect').addEventListener('change',e=>changeLanguage(e.target.value));$('startButton').addEventListener('click',startGame);$('nextButton').addEventListener('click',nextQuestion);$('previousButton').addEventListener('click',previousQuestion);$('finishButton').addEventListener('click',finishGame);$('validateButton').addEventListener('click',validateAnswer);$('quitButton').addEventListener('click',()=>{if(confirm(translations[lang].quitConfirm))setScreen('homeScreen');});
})();

(function(){
  'use strict';

  function splitSentences(text){
    if(!text){ return []; }
    var cleaned = text.replace(/\r/g, '');
    var lines = cleaned.split('\n');
    var all = [];
    for(var i = 0; i < lines.length; i++){
      var ln = lines[i].trim();
      if(ln.length > 0){ all.push(ln); }
    }
    var result = [];
    for(var k = 0; k < all.length; k++){
      var cur = all[k];
      if(cur.length <= 90){
        result.push(cur);
      } else {
        var sentences = cur.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cur];
        for(var m = 0; m < sentences.length; m++){
          var s = sentences[m].trim();
          if(s.length > 0){ result.push(s); }
        }
      }
    }
    return result;
  }

  function chooseAnimation(phrases){
    if(phrases.length === 0){ return 'fade'; }
    var total = 0, exclaims = 0, questions = 0;
    for(var i = 0; i < phrases.length; i++){
      total += phrases[i].length;
      if(phrases[i].indexOf('!') >= 0){ exclaims++; }
      if(phrases[i].indexOf('?') >= 0){ questions++; }
    }
    var avg = total / phrases.length;
    var energy = (exclaims + questions) / phrases.length;
    if(energy > 0.4){ return 'scale'; }
    if(avg < 35){ return 'type'; }
    if(avg > 90){ return 'fade'; }
    return 'slide';
  }

  function placeImages(images, phraseCount){
    if(!images || images.length === 0 || phraseCount === 0){ return; }
    var n = images.length;
    if(n === 1){
      images[0].startPhrase = 0;
      return;
    }
    for(var i = 0; i < n; i++){
      var ratio = i / (n - 1);
      var idx = Math.round(ratio * (phraseCount - 1));
      if(idx < 0){ idx = 0; }
      if(idx > phraseCount - 1){ idx = phraseCount - 1; }
      images[i].startPhrase = idx;
    }
  }

  function generateAll(){
    var app = window.MotionApp;
    if(!app){
      alert('Application non prete. Rechargez la page.');
      return;
    }
    var state = app.state;
    var textarea = document.getElementById('textInput');
    var original = (textarea.value || '').trim();

    if(original.length === 0){
      app.showToast('Ecrivez d\'abord votre texte.');
      return;
    }

    var phrases = splitSentences(original);
    if(phrases.length === 0){
      app.showToast('Aucune phrase detectee.');
      return;
    }

    textarea.value = phrases.join('\n');
    var ev = new Event('input', { bubbles: true });
    textarea.dispatchEvent(ev);

    var anim = chooseAnimation(phrases);
    state.animation = anim;
    var btns = document.querySelectorAll('.anim-btn');
    for(var b = 0; b < btns.length; b++){
      if(btns[b].getAttribute('data-anim') === anim){
        btns[b].classList.add('active');
      } else {
        btns[b].classList.remove('active');
      }
    }

    state.textColor = '#f5f0e6';
    state.bgColor = '#0a0a0a';
    document.getElementById('textColor').value = '#f5f0e6';
    document.getElementById('bgColor').value = '#0a0a0a';

    placeImages(state.images, phrases.length);
    app.renderImages();

    var labels = { fade: 'Fondu', slide: 'Glisse', type: 'Machine a ecrire', scale: 'Zoom' };
    app.showToast('Pret : ' + phrases.length + ' phrases, ' + (labels[anim] || anim) + '.');
  }

  function init(){
    var btn = document.getElementById('brainBtn');
    if(btn){
      btn.addEventListener('click', generateAll);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.Brain = {
    generate: generateAll,
    splitSentences: splitSentences,
    chooseAnimation: chooseAnimation
  };
})();
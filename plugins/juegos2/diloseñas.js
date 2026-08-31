const pluginConfig = {
  name: "diloseñas",
  alias: ["mimica","actuar","charadas"],
  category: "juegos2",
  description: "Dilo con señas: actúa sin hablar para que el grupo adivine.",
  usage: "..diloseñas",
  example: "..diloseñas",
  isOwner: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  isEnabled: true,
}

async function handler(m, { sock }) {
  const from = m.chat
  try {
    const msgContent = {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: "",
          botResponseId: "b17d27cd-4b0c-45b3-b1ba-a76ce95bed4d",
          verificationMetadata: {
            proofs: [
              {
                version: 1,
                useCase: 1,
                signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==",
                certificateChain: [
                  "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg",
                  "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZLXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYbNBkuLoZnQAq4j8yRekrQ=="
                ]
              }
            ]
          }
        }
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [
              {
                messageType: 2,
                messageText: "Fiora Sylvie"
              }
            ],
            unifiedResponse: {
              data: Buffer.from(JSON.stringify({
                "response_id": "6de3c729-64fc-4870-89f1-c7133ec24b64",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Dilo con señas</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">MEJOR</div><div id=\"bestEl\" style=\"font-size:18px;font-weight:bold;color:#f1c40f;text-shadow:0 0 10px rgba(241,196,15,.5)\">0</div></div>\n</div>\n<div style=\"padding:16px\">\n<div id=\"menuEl\">\n<div style=\"text-align:center;font-size:13px;font-weight:bold;color:#fff;margin-bottom:14px\">🎭 Actúa sin hablar — adivina la palabra</div>\n<div id=\"catBtns\" style=\"display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:16px\">\n<div data-c=\"0\" style=\"padding:10px 14px;border-radius:10px;background:rgba(108,92,231,.25);border:2px solid rgba(108,92,231,.5);color:#b8b0ff;font-weight:bold;font-size:12px;text-align:center\">🎬 Películas</div>\n<div data-c=\"1\" style=\"padding:10px 14px;border-radius:10px;background:rgba(108,92,231,.25);border:2px solid rgba(108,92,231,.5);color:#b8b0ff;font-weight:bold;font-size:12px;text-align:center\">🐾 Animales</div>\n<div data-c=\"2\" style=\"padding:10px 14px;border-radius:10px;background:rgba(108,92,231,.25);border:2px solid rgba(108,92,231,.5);color:#b8b0ff;font-weight:bold;font-size:12px;text-align:center\">👷 Profesiones</div>\n<div data-c=\"3\" style=\"padding:10px 14px;border-radius:10px;background:rgba(108,92,231,.25);border:2px solid rgba(108,92,231,.5);color:#b8b0ff;font-weight:bold;font-size:12px;text-align:center\">🤸 Acciones</div>\n<div data-c=\"4\" style=\"padding:10px 14px;border-radius:10px;background:rgba(108,92,231,.25);border:2px solid rgba(108,92,231,.5);color:#b8b0ff;font-weight:bold;font-size:12px;text-align:center\">📦 Objetos</div>\n<div data-c=\"5\" style=\"padding:10px 14px;border-radius:10px;background:rgba(108,92,231,.25);border:2px solid rgba(108,92,231,.5);color:#b8b0ff;font-weight:bold;font-size:12px;text-align:center\">🎵 Canciones</div>\n</div>\n<div id=\"goBtn\" style=\"padding:14px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4);opacity:.4\">🎲 JUGAR</div>\n</div>\n<div id=\"gameEl\" style=\"display:none\">\n<div id=\"hud\" style=\"display:flex;justify-content:space-between;gap:8px;margin-bottom:12px\">\n<div style=\"flex:1;text-align:center;background:rgba(108,92,231,.15);border:1px solid rgba(108,92,231,.3);border-radius:10px;padding:8px 4px\"><div style=\"font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.45)\">CATEGORÍA</div><div id=\"catEl\" style=\"font-size:13px;font-weight:bold;color:#b8b0ff\">--</div></div>\n<div style=\"flex:1;text-align:center;background:rgba(108,92,231,.15);border:1px solid rgba(108,92,231,.3);border-radius:10px;padding:8px 4px\"><div style=\"font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.45)\">TIEMPO</div><div id=\"timeEl\" style=\"font-size:13px;font-weight:bold;color:#fff\">60s</div></div>\n<div style=\"flex:1;text-align:center;background:rgba(108,92,231,.15);border:1px solid rgba(108,92,231,.3);border-radius:10px;padding:8px 4px\"><div style=\"font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.45)\">RONDA</div><div id=\"roundEl\" style=\"font-size:13px;font-weight:bold;color:#fff\">0</div></div>\n<div style=\"flex:1;text-align:center;background:rgba(108,92,231,.15);border:1px solid rgba(108,92,231,.3);border-radius:10px;padding:8px 4px\"><div style=\"font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.45)\">PUNTAJE</div><div id=\"scoreEl\" style=\"font-size:13px;font-weight:bold;color:#f1c40f\">0</div></div>\n</div>\n<div id=\"cardEl\" style=\"display:none;text-align:center;padding:24px 16px;background:rgba(108,92,231,.12);border:2px solid rgba(108,92,231,.4);border-radius:14px;margin-bottom:12px\">\n<div id=\"cardCat\" style=\"font-size:10px;letter-spacing:1.5px;color:rgba(255,255,255,.5);margin-bottom:6px\">CATEGORÍA</div>\n<div id=\"cardWord\" style=\"font-size:28px;font-weight:bold;color:#fff;margin-bottom:8px\">--</div>\n<div id=\"cardEmoji\" style=\"font-size:36px\">🎭</div>\n</div>\n<div id=\"timerBar\" style=\"height:6px;border-radius:3px;background:rgba(255,255,255,.1);margin-bottom:12px;overflow:hidden\"><div id=\"timerFill\" style=\"height:100%;width:100%;border-radius:3px;background:linear-gradient(90deg,#6c5ce7,#8e44ad);transition:width .3s\"></div></div>\n<div style=\"display:flex;gap:10px\">\n<div id=\"okBtn\" style=\"flex:1;padding:13px;border-radius:12px;background:rgba(46,204,113,.2);border:2px solid rgba(46,204,113,.5);color:#2ecc71;font-weight:bold;font-size:14px;text-align:center;box-shadow:0 4px 16px rgba(46,204,113,.2)\">✅ Lo acertaron</div>\n<div id=\"failBtn\" style=\"flex:1;padding:13px;border-radius:12px;background:rgba(231,76,60,.2);border:2px solid rgba(231,76,60,.5);color:#e74c3c;font-weight:bold;font-size:14px;text-align:center;box-shadow:0 4px 16px rgba(231,76,60,.2)\">❌ Lo fallaron</div>\n</div>\n<div id=\"newBtn\" style=\"margin-top:12px;padding:13px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:14px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🎲 NUEVO RETO</div>\n<div id=\"msg\" style=\"text-align:center;margin-top:10px;font-size:12px;font-weight:bold;color:rgba(255,255,255,.75);min-height:18px\">Pulsa NUEVO RETO para empezar</div>\n</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Actúa sin hablar • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl diloseñas puntos</b></div>\n</div></div></div>\n\n\n<script>\n\n\nconst CATS=[\n  {name:'Películas',icon:'🎬',words:['Titanic','Toy Story','Matrix','Frozen','Avatar','El Rey León','Buscando a Nemo','Star Wars','Harry Potter','Shrek']},\n  {name:'Animales',icon:'🐾',words:['Elefante','Jirafa','Pingüino','Delfín','Cebra','Koala','Canguro','León','Tortuga','Mono']},\n  {name:'Profesiones',icon:'👷',words:['Bombero','Piloto','Médico','Chef','Policía','Carpintero','Pintor','Abogado','Músico','Doctor']},\n  {name:'Acciones',icon:'🤸',words:['Nadar','Bailar','Cocinar','Correr','Tocar guitarra','Saltar en paracaídas','Pintar','Escalar montaña','Pescar','Hacer magia']},\n  {name:'Objetos',icon:'📦',words:['Paraguas','Reloj','Teléfono','Llave','Martillo','Camiseta','Zapato','Relámpago','Lupa','Candado']},\n  {name:'Canciones',icon:'🎵',words:['La Bamba','Despacito','Bohemian Rhapsody','Let It Be','Happy','Shape of You','Baby','Take On Me','Billie Jean','Hotel California']}\n];\n\nconst catBtns=Array.prototype.slice.call(document.querySelectorAll('#catBtns > div'));\nconst goBtn=document.getElementById('goBtn'),menuEl=document.getElementById('menuEl'),gameEl=document.getElementById('gameEl');\nconst cardEl=document.getElementById('cardEl'),cardCat=document.getElementById('cardCat'),cardWord=document.getElementById('cardWord'),cardEmoji=document.getElementById('cardEmoji');\nconst catEl=document.getElementById('catEl'),timeEl=document.getElementById('timeEl'),roundEl=document.getElementById('roundEl'),scoreEl=document.getElementById('scoreEl');\nconst okBtn=document.getElementById('okBtn'),failBtn=document.getElementById('failBtn'),newBtn=document.getElementById('newBtn'),msgEl=document.getElementById('msg');\nconst timerFill=document.getElementById('timerFill'),bestEl=document.getElementById('bestEl');\n\nlet selCat=-1,timeLeft=60,score=0,round=0,active=false,timerId=null,curIdx=-1;\nlet best=0;\ntry{best=parseInt(localStorage.getItem('señas_best'))||0;}catch(e){best=0;}\nbestEl.textContent=best;\n\nfunction tap(el,fn){const H=e=>{e.preventDefault();if(H.l)return;H.l=1;setTimeout(()=>{H.l=0},120);fn(e);};el.addEventListener('pointerdown',H);el.addEventListener('touchstart',H,{passive:false});}\nfor(let i=0;i<catBtns.length;i++){\n  tap(catBtns[i],function(){\n    selCat=parseInt(this.getAttribute('data-c'));\n    for(let j=0;j<catBtns.length;j++){catBtns[j].style.borderColor='rgba(108,92,231,.5)';catBtns[j].style.background='rgba(108,92,231,.25)';}\n    this.style.borderColor='#6c5ce7';this.style.background='rgba(108,92,231,.5)';\n    goBtn.style.opacity='1';\n  });\n}\n\ntap(goBtn,function(){\n  if(selCat<0)return;\n  menuEl.style.display='none';gameEl.style.display='block';\n  score=0;round=0;updHud();\n  newReto();\n});\n\nfunction randWord(ci){\n  const c=CATS[ci>=0?ci:Math.floor(Math.random()*CATS.length)];\n  return {cat:c.name,icon:c.icon,word:c.words[Math.floor(Math.random()*c.words.length)]};\n}\n\nfunction newReto(){\n  if(timerId)clearInterval(timerId);\n  const r=randWord(selCat);\n  curIdx=selCat>=0?selCat:Math.floor(Math.random()*CATS.length);\n  round++;\n  timeLeft=60;active=true;\n  cardCat.textContent=r.cat.toUpperCase();\n  cardWord.textContent=r.word;\n  cardEmoji.textContent=r.icon;\n  cardEl.style.display='block';\n  catEl.textContent=CATS[curIdx].name;\n  timeEl.textContent='60s';\n  timerFill.style.width='100%';\n  timerFill.style.background='linear-gradient(90deg,#6c5ce7,#8e44ad)';\n  roundEl.textContent=round;\n  scoreEl.textContent=score;\n  msgEl.textContent='Actúa sin hablar — ¡que lo adivinen!';\n  msgEl.style.color='rgba(255,255,255,.75)';\n  timerId=setInterval(function(){\n    if(!active)return;\n    timeLeft--;\n    timeEl.textContent=timeLeft+'s';\n    timerFill.style.width=(timeLeft/60*100)+'%';\n    if(timeLeft<=15){timerFill.style.background='linear-gradient(90deg,#e74c3c,#e67e22)';timeEl.style.color='#e74c3c';}\n    if(timeLeft<=0){active=false;clearInterval(timerId);timerId=null;timeEl.style.color='#fff';\n      msgEl.textContent='⏱️ ¡Se acabó el tiempo! Pulsa NUEVO RETO';msgEl.style.color='#e67e22';\n    }\n  },1000);\n  updHud();\n}\n\nfunction mark(success){\n  if(!active&&timeLeft>0)return;\n  if(success){score++;msgEl.textContent='✅ ¡Correcto! +1 punto';msgEl.style.color='#2ecc71';}\n  else{msgEl.textContent='❌ No lo lograron. ¡Siguiente!';msgEl.style.color='#e74c3c';}\n  active=false;\n  if(timerId)clearInterval(timerId);timerId=null;\n  if(score>best){best=score;try{localStorage.setItem('señas_best',String(best));}catch(e){}}\n  bestEl.textContent=best;\n  scoreEl.textContent=score;\n  updHud();\n}\n\nfunction tick(){\n  if(!active)return;\n  timeLeft--;\n  timeEl.textContent=timeLeft+'s';\n  timerFill.style.width=(timeLeft/60*100)+'%';\n  if(timeLeft<=15){timerFill.style.background='linear-gradient(90deg,#e74c3c,#e67e22)';timeEl.style.color='#e74c3c';}\n  if(timeLeft<=0){active=false;timeEl.style.color='#fff';msgEl.textContent='⏱️ Tiempo agotado';msgEl.style.color='#e67e22';}\n}\n\nfunction updHud(){\n  roundEl.textContent=round;\n  scoreEl.textContent=score;\n  bestEl.textContent=best;\n}\n\ntap(newBtn,function(){newReto();});\ntap(okBtn,function(){mark(true);});\ntap(failBtn,function(){mark(false);});\n\nwindow._newReto=function(ci){selCat=typeof ci==='number'?ci:selCat;newReto();};\nwindow._mark=function(s){mark(s);};\nwindow._tick=tick;\nwindow._state=function(){return {score:score,round:round,curIdx:curIdx,active:active,timeLeft:timeLeft,best:best};};\n\nupdHud();\n\n</script>",
                        "trusted_sources": [
                          "nixel.dev"
                        ]
                      },
                      "__typename": "GenAISingleLayoutViewModel"
                    }
                  }
                ]
              })).toString('base64')
            },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: {
                botJid: "867051314767696@bot"
              },
              forwardOrigin: 4
            }
          }
        }
      }
    }
    await sock.relayMessage(from, msgContent, {})
  } catch (e) {
    console.error('Error en diloseñas:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

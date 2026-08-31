const pluginConfig = {
  name: "adivinanumero",
  alias: ["numero","adivina"],
  category: "juegos2",
  description: "Adivina el número que piensa el bot (1-100) con pistas.",
  usage: "..adivinanumero",
  example: "..adivinanumero",
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
          botResponseId: "293a56d3-2ce2-43c7-bad2-0371b275da45",
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
                "response_id": "4de5e515-da99-4d25-992c-7f918b4e98f6",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Adivina el número</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">INTENTOS</div><div id=\"count\" style=\"font-size:18px;font-weight:bold;color:#fff;text-shadow:0 0 10px rgba(108,92,231,.8)\">0</div></div>\n</div>\n<div style=\"padding:18px\">\n<div id=\"status\" style=\"text-align:center;margin-bottom:12px;min-height:22px;font-size:14px;font-weight:bold;color:rgba(255,255,255,.8)\">Pulsa NUEVO JUEGO para empezar</div>\n<div id=\"hintRow\" style=\"display:flex;gap:8px;margin-bottom:12px\">\n<div id=\"hintBtn\" style=\"flex:1;padding:10px;border-radius:10px;background:rgba(241,196,15,.15);border:1px solid rgba(241,196,15,.45);color:#f1c40f;font-size:13px;font-weight:bold;text-align:center\">💡 PISTA (<span id=\"hintLeft\">3</span> restantes)</div>\n</div>\n<div id=\"hintOut\" style=\"text-align:center;margin-bottom:12px;min-height:18px;font-size:13px;font-weight:bold;color:#f1c40f\"></div>\n<div id=\"disp\" style=\"text-align:center;font-size:52px;font-weight:bold;color:#fff;letter-spacing:6px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:16px 0;margin-bottom:12px\">_</div>\n<div id=\"keys\" style=\"display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px\"></div>\n<div style=\"display:flex;gap:8px;margin-bottom:12px\">\n<div id=\"delBtn\" style=\"flex:1;padding:12px;border-radius:10px;background:rgba(231,76,60,.18);border:1px solid rgba(231,76,60,.5);color:#e74c3c;font-weight:bold;font-size:14px;text-align:center\">⌫ BORRAR</div>\n<div id=\"guessBtn\" style=\"flex:1;padding:12px;border-radius:10px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:14px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🎯 ADIVINAR</div>\n</div>\n<div id=\"newBtn\" style=\"padding:12px;border-radius:10px;background:rgba(46,204,113,.18);border:1px solid rgba(46,204,113,.45);color:#2ecc71;font-weight:bold;font-size:14px;text-align:center;margin-bottom:12px\">🔄 NUEVO JUEGO</div>\n<div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5);margin-bottom:6px\">HISTORIAL</div>\n<div id=\"hist\" style=\"max-height:160px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:10px\"></div>\n<div style=\"text-align:center;font-size:11px;color:rgba(255,255,255,.5)\">Récord: <span id=\"best\" style=\"color:#6c5ce7;font-weight:bold\">—</span> intentos</div>\n</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">1-100 con pistas • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl adivinanumero puntos</b></div>\n</div></div></div>\n\n<script>\n\nconst disp=document.getElementById('disp'),statusEl=document.getElementById('status'),keysEl=document.getElementById('keys'),hist=document.getElementById('hist'),countEl=document.getElementById('count'),bestEl=document.getElementById('best'),hintBtn=document.getElementById('hintBtn'),hintLeft=document.getElementById('hintLeft'),hintOut=document.getElementById('hintOut'),delBtn=document.getElementById('delBtn'),guessBtn=document.getElementById('guessBtn'),newBtn=document.getElementById('newBtn');\nlet secret=0,current='',attempts=0,best=Infinity,hintN=3,over=true;\nfunction initBest(){try{const b=parseInt(localStorage.getItem('numero_best'));if(!isNaN(b)&&b>0){best=b;bestEl.textContent=b;}}catch(e){}}\nfunction saveBest(){if(attempts<best){best=attempts;try{localStorage.setItem('numero_best',String(best));}catch(e){}bestEl.textContent=best;}}\nfunction newGame(n){secret=(typeof n==='number')?n:(Math.floor(Math.random()*100)+1);current='';attempts=0;hintN=3;over=false;hintOut.textContent='';statusEl.style.color='rgba(255,255,255,.8)';statusEl.textContent='¡Intenta adivinar entre 1 y 100!';countEl.textContent='0';hist.innerHTML='';hintLeft.textContent=hintN;render();}\nfunction render(){disp.textContent=current===''?'_':current;}\nfunction pressDigit(d){if(over)return;if(current.length>=3)return;current+=d;render();}\nfunction delDigit(){if(over)return;current=current.slice(0,-1);render();}\nfunction addHist(n,cls,txt){const row=document.createElement('div');row.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);font-size:13px';const l=document.createElement('span');l.style.cssText='font-weight:bold;color:#eaeaea;min-width:34px';l.textContent=n;const r=document.createElement('span');r.style.cssText='font-weight:bold';r.textContent=txt;if(cls==='right'){r.style.color='#2ecc71';}else if(cls==='low'){r.style.color='#2980b9';}else{r.style.color='#e74c3c';}row.appendChild(l);row.appendChild(r);hist.prepend(row);}\nfunction guess(n){if(typeof n==='number'&&!isNaN(n)){current=String(n);render();}if(over){return;}let guessN;if(current===''){statusEl.textContent='Escribe un número primero';return;}guessN=parseInt(current,10);if(isNaN(guessN)){current='';render();return;}attempts++;countEl.textContent=attempts;if(guessN===secret){over=true;saveBest();statusEl.style.color='#2ecc71';statusEl.textContent='🎉 ¡GANASTE! El número era '+secret+' en '+attempts+(attempts===1?' intento':' intentos');addHist(guessN,'right','🎯 ¡ACERTASTE!');}\nelse if(guessN<secret){statusEl.style.color='#2980b9';statusEl.textContent=guessN+' es MENOR (el número es mayor)';addHist(guessN,'low','▲ es mayor');}\nelse{statusEl.style.color='#e74c3c';statusEl.textContent=guessN+' es MAYOR (el número es menor)';addHist(guessN,'high','▼ es menor');}current='';render();}\nfunction hint(){if(over)return;if(secret<1)return;if(hintN<=0){hintOut.textContent='No quedan pistas';return;}hintN--;hintLeft.textContent=hintN;let msg='';if(hintN===2){msg='El número es '+(secret%2===0?'PAR':'IMPAR');}\nelse if(hintN===1){const dec=Math.floor(secret/10);msg='El dígito de las decenas es el '+dec;}\nelse{msg='La primera cifra es el '+String(secret).charAt(0);}hintOut.textContent='💡 '+msg;}\nfunction tap(el,fn){const H=e=>{e.preventDefault();if(H.l)return;H.l=1;setTimeout(()=>{H.l=0},120);fn(e);};el.addEventListener('pointerdown',H);el.addEventListener('touchstart',H,{passive:false});}\ntap(newBtn,()=>{newGame();});\ntap(delBtn,()=>{delDigit();});\ntap(guessBtn,()=>{guess();});\ntap(hintBtn,()=>{hint();});\nfor(let d=0;d<=9;d++){const b=document.createElement('div');b.textContent=d;b.style.cssText='padding:12px 0;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#eaeaea;font-weight:bold;font-size:18px;text-align:center';tap(b,()=>{pressDigit(String(d));});keysEl.appendChild(b);}\ninitBest();\nwindow._newGame=function(n){newGame(n);return secret;};\nwindow._guess=guess;\nwindow._hint=hint;\nwindow._getAttempts=function(){return attempts;};\nwindow._getBest=function(){return best;};\nwindow._getOver=function(){return over;};\nwindow._getHintN=function(){return hintN;};\nwindow._getStatus=function(){return statusEl.textContent;};\nwindow._getHintMsg=function(){return hintOut.textContent;};\nnewGame();\n\n</script>",
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
    console.error('Error en adivinanumero:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

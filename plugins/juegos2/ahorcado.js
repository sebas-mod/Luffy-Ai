const pluginConfig = {
  name: "ahorcado",
  alias: ["hangman","horca"],
  category: "juegos2",
  description: "Juego del ahorcado con categorías y modos solo/equipo.",
  usage: "..ahorcado",
  example: "..ahorcado",
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
          botResponseId: "b2e40280-433c-45d8-9c1a-270bec558860",
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
                "response_id": "ead382ac-68e2-4fe6-839f-81863ae181e0",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Ahorcado</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">ERRORES</div><div id=\"err\" style=\"font-size:18px;font-weight:bold;color:#fff;text-shadow:0 0 10px rgba(231,76,60,.8)\">0/6</div></div>\n</div>\n<div style=\"padding:18px\">\n<div id=\"menu\">\n<div id=\"turnLabel\" style=\"text-align:center;font-size:13px;font-weight:bold;color:#fff;margin-bottom:12px\">Elige una categoría</div>\n<div id=\"catBtns\" style=\"display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:16px\"></div>\n<div style=\"text-align:center;font-size:12px;color:rgba(255,255,255,.55);margin-bottom:12px\">Modo de juego</div>\n<div id=\"modeBtns\" style=\"display:flex;justify-content:center;gap:10px;margin-bottom:16px\">\n<div id=\"mSolo\" data-m=\"solo\" style=\"padding:12px 20px;border-radius:12px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);color:#fff;font-weight:bold;font-size:14px;text-align:center;flex:1;max-width:180px\">🙋 Solo<div style=\"font-size:10px;font-weight:normal;color:rgba(255,255,255,.5);margin-top:4px\">Juega tú solo</div></div>\n<div id=\"mTeam\" data-m=\"team\" style=\"padding:12px 20px;border-radius:12px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);color:#fff;font-weight:bold;font-size:14px;text-align:center;flex:1;max-width:180px\">👥 Equipo<div style=\"font-size:10px;font-weight:normal;color:rgba(255,255,255,.5);margin-top:4px\">Juegan por turnos</div></div>\n</div>\n<div id=\"goBtn\" style=\"padding:14px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🎮 JUGAR</div>\n</div>\n<div id=\"game\" style=\"display:none\">\n<canvas id=\"hang\" width=\"560\" height=\"360\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div id=\"meta\" style=\"text-align:center;margin-top:10px;font-size:12px;color:rgba(255,255,255,.5)\"></div>\n<div id=\"hintRow\" style=\"display:flex;justify-content:center;margin-top:8px\">\n<div id=\"hintBtn\" style=\"padding:8px 16px;border-radius:10px;background:rgba(241,196,15,.18);border:1px solid rgba(241,196,15,.5);color:#f1c40f;font-size:12px;font-weight:bold;text-align:center;cursor:pointer\">💡 Pista: revela una letra (<span id=\"hintLeft\">3</span> restantes)</div>\n</div>\n<div id=\"reveal\" style=\"text-align:center;margin-top:8px;min-height:20px;font-size:13px;font-weight:bold;color:rgba(255,255,255,.75)\"></div>\n<div id=\"keys\" style=\"margin-top:12px;display:flex;flex-wrap:wrap;justify-content:center;gap:6px\"></div>\n</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Categorías y modos • Credits: yosoyyo</div>\n</div></div></div>\n\n<script>\n\nconst c=document.getElementById('hang'),x=c.getContext('2d'),rev=document.getElementById('reveal'),errEl=document.getElementById('err'),keysEl=document.getElementById('keys'),menu=document.getElementById('menu'),game=document.getElementById('game'),catBtns=document.getElementById('catBtns'),goBtn=document.getElementById('goBtn'),metaEl=document.getElementById('meta'),hintBtn=document.getElementById('hintBtn'),hintLeft=document.getElementById('hintLeft');\nconst CATS={animales:['GATO','PERRO','LEON','TIGRE','ELEFANTE','JIRAFA','CEBRA','MONO','OSO','LOBO','ZORRO','CONEJO','TORTUGA','DELFIN','PINGUINO','BUHO','SERPIENTE','RANA','CABALLO','PAVO'],frutas:['MANZANA','PERA','BANANA','NARANJA','FRESA','MELON','SANDIA','UVA','DURAZNO','MANGO','PIÑA','LIMON','CEREZA','KIWI','PAPAYA','CIRUELA'],paises:['MEXICO','ARGENTINA','CHILE','PERU','COLOMBIA','BRASIL','ESPAÑA','FRANCIA','ITALIA','JAPON','CHINA','CANADA','AUSTRALIA','EGIPTO','RUSIA','PORTUGAL'],profesiones:['DOCTOR','BOMBERO','MAESTRO','PANADERO','CARPINTERO','PINTOR','JARDINERO','COCINERO','POLICIA','VETERINARIO','ABOGADO','INGENIERO'],tecnologia:['COMPUTADORA','CELULAR','INTERNET','ROBOT','TABLETA','PROGRAMACION','WIFI','PANTALLA','TECLADO','CAMARA','VIDEOJUEGO','PROCESADOR'],deportes:['FUTBOL','BASQUET','TENIS','NATACION','CICLISMO','BOXEO','BEISBOL','VOLEIBOL','ATLETISMO','ESGRIMA','PINGPONG','GOLF']};\nconst CATKEYS=Object.keys(CATS);\nconst LETTERS='ABCDFGHIJKLMNÑOPQRSTUVWXYZ'.split('');\nlet cat=null,mode=null,word='',good={},shownParts=0,targetParts=0,over=false,win=false,turn=0,hintN=3;\nfunction pick(){const list=CATS[cat];word=list[Math.floor(Math.random()*list.length)];good={};shownParts=0;targetParts=0;over=false;win=false;turn=0;hintN=3;}\nfunction accent(l){if(l==='A')return'Á';if(l==='E')return'É';if(l==='I')return'Í';if(l==='O')return'Ó';if(l==='U')return'Ú';if(l==='N')return'Ñ';return l;}\nfunction hint(){if(over||word===''||hintN<=0)return;const pool=[];for(const L of word){const ch=good[L]||good[accent(L)]?null:L;if(ch&&!pool.includes(ch))pool.push(ch);}if(!pool.length)return;const pick2=pool[Math.floor(Math.random()*pool.length)];good[pick2]=1;good[accent(pick2)]=1;hintN--;hintLeft.textContent=hintN;document.querySelectorAll('.key').forEach(b=>{if(b.getAttribute('data-k')===pick2){b.classList.add('used');b.setAttribute('data-used','1');b.style.background='rgba(46,204,113,.45)';b.style.borderColor='rgba(46,204,113,.6)';b.style.color='#fff';}});check();}\nfunction refreshKeys(){keysEl.innerHTML='';LETTERS.forEach(L=>{const b=document.createElement('div');b.textContent=L;b.className='key';b.style.cssText='padding:10px 12px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#eaeaea;font-weight:bold;font-size:13px;min-width:28px;text-align:center';b.setAttribute('data-k',L);b.addEventListener('pointerdown',e=>{e.preventDefault();guess(L,b);});keysEl.appendChild(b);});}\nfunction guess(L,b){if(over||word===''||b.classList.contains('used'))return;b.classList.add('used');b.setAttribute('data-used','1');if(word.includes(L)||word.includes(accent(L))){good[L]=1;good[accent(L)]=1;b.style.background='rgba(46,204,113,.45)';b.style.borderColor='rgba(46,204,113,.6)';b.style.color='#fff';}else{targetParts=Math.min(6,targetParts+1);errEl.textContent=targetParts+'/6';b.style.background='rgba(231,76,60,.4)';b.style.borderColor='rgba(231,76,60,.5)';b.style.color='#fff';turn=(turn+1)%(mode==='team'?4:1);if(mode==='team')metaEl.textContent='Turno: Jugador '+(turn+1);}check();}\nfunction check(){let complete=1;for(const L of word){if(!good[L]&&!good[accent(L)])complete=0;}if(complete){over=true;win=true;rev.innerHTML='<span style=\"color:#2ecc71\">🎉 ¡GANASTE! La palabra era '+word+'</span>';setKeys(true);}\nelse if(targetParts>=6){over=true;win=false;let shown='';for(const L of word)shown+=L+' ';rev.innerHTML='<span style=\"color:#e74c3c\">💀 Perdiste. Era: '+shown+'</span>';setKeys(false);}}\nfunction setKeys(won){document.querySelectorAll('.key').forEach(b=>{if(!b.getAttribute('data-used')){b.style.background=won?'rgba(46,204,113,.25)':'rgba(120,120,120,.3)';b.style.borderColor=won?'rgba(46,204,113,.4)':'rgba(150,150,150,.3)';}});}\nfunction drawGallows(){x.strokeStyle='rgba(108,92,231,.7)';x.lineWidth=7;x.beginPath();x.moveTo(55,300);x.lineTo(155,300);x.moveTo(75,300);x.lineTo(75,70);x.moveTo(75,70);x.lineTo(155,70);x.moveTo(75,70);x.lineTo(155,115);x.stroke();}\nfunction pt(n,f){const L=(a,b,ff)=>[a[0]+(b[0]-a[0])*ff,a[1]+(b[1]-a[1])*ff];x.strokeStyle='#fff';x.lineWidth=6;x.lineCap='round';x.beginPath();if(n===1){x.arc(145,112,18*f,0,Math.PI*2);}else if(n===2){x.moveTo(145,130);x.lineTo(...L([145,130],[145,185],f));}else if(n===3){x.moveTo(145,145);x.lineTo(...L([145,145],[115,170],f));}else if(n===4){x.moveTo(145,145);x.lineTo(...L([145,145],[175,170],f));}else if(n===5){x.moveTo(145,185);x.lineTo(...L([145,185],[125,235],f));}else if(n===6){x.moveTo(145,185);x.lineTo(...L([145,185],[165,235],f));}x.stroke();}\nfunction draw(){x.clearRect(0,0,560,360);drawGallows();for(let i=1;i<=targetParts;i++){let f;if(shownParts>=i)f=1;else if(shownParts>=i-1)f=shownParts-(i-1);else f=0;if(f>0)pt(i,f);}\nif(word){const cells=word.length;const cw=36;const x0=280-(cells*cw)/2;x.font='bold 34px Arial';x.textAlign='center';x.textBaseline='middle';for(let i=0;i<cells;i++){const ch=word[i];if(good[ch]||good[accent(ch)]){x.fillStyle='#fff';x.fillText(ch,x0+i*cw+18,262);}else{x.fillStyle='rgba(255,255,255,.6)';x.fillRect(x0+i*cw+4,288,cw-8,4);}}}}\nfunction loop(){if(shownParts<targetParts){shownParts=Math.min(targetParts,shownParts+0.05);}draw();requestAnimationFrame(loop);}\nfunction resetHUD(){errEl.textContent='0/6';rev.innerHTML='';hintLeft.textContent=hintN;metaEl.textContent=(mode==='team'?'👥 Equipo · Turno: Jugador 1 · ':'🙋 Solo · ')+cat.toUpperCase();}\nfunction start(){pick();resetHUD();refreshKeys();menu.style.display='none';game.style.display='block';}\nfunction restart(){if(over){start();}}\nrev.addEventListener('pointerdown',e=>{e.preventDefault();restart();});\nCATKEYS.forEach(k=>{const b=document.createElement('div');b.textContent=k[0].toUpperCase()+k.slice(1);b.style.cssText='padding:10px 14px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:12px;font-weight:bold';b.setAttribute('data-c',k);b.addEventListener('pointerdown',e=>{e.preventDefault();if(cat===k){cat=null;b.style.borderColor='rgba(255,255,255,.15)';b.style.background='rgba(255,255,255,.08)';}else{cat=k;catBtns.querySelectorAll('[data-c]').forEach(o=>{o.style.borderColor='rgba(255,255,255,.15)';o.style.background='rgba(255,255,255,.08)';});b.style.border='2px solid #6c5ce7';b.style.background='rgba(108,92,231,.3)';}goBtn.style.opacity=cat&&mode?'1':'0.4';});catBtns.appendChild(b);});\ndocument.querySelectorAll('#modeBtns > div').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();mode=b.getAttribute('data-m');document.querySelectorAll('#modeBtns > div').forEach(o=>{o.style.borderColor='rgba(255,255,255,.15)';o.style.background='rgba(255,255,255,.2)';});b.style.border='2px solid #6c5ce7';b.style.background='rgba(108,92,231,.35)';goBtn.style.opacity=cat&&mode?'1':'0.4';});});\ngoBtn.addEventListener('pointerdown',e=>{e.preventDefault();if(cat&&mode)start();});\nhintBtn.addEventListener('pointerdown',e=>{e.preventDefault();hint();});\nloop();\n\n</script>",
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
    console.error('Error en ahorcado:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

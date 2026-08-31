const pluginConfig = {
  name: "ruleta",
  alias: ["roulette","casa","girar"],
  category: "juegos2",
  description: "Ruleta de casino: apuesta rojo/negro o número.",
  usage: "..ruleta",
  example: "..ruleta",
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
                "response_id": "0f7e639f-d9e2-4541-8dea-71f72266f197",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:520px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Ruleta</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">SALDO</div><div id=\"saldo\" style=\"font-size:18px;font-weight:bold;color:#fff;text-shadow:0 0 10px rgba(46,204,113,.7)\">100</div></div>\n</div>\n<div style=\"padding:18px\">\n<div style=\"display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:12px\">\n<div id=\"betRed\" data-bet=\"red\" style=\"padding:10px 16px;border-radius:10px;background:rgba(231,76,60,.18);border:2px solid rgba(231,76,60,.5);color:#fff;font-weight:bold;font-size:13px;text-align:center;flex:1;max-width:110px\">🔴 Rojo<div style=\"font-size:10px;font-weight:normal;color:rgba(255,255,255,.5)\">x2</div></div>\n<div id=\"betBlack\" data-bet=\"black\" style=\"padding:10px 16px;border-radius:10px;background:rgba(52,73,94,.4);border:2px solid rgba(255,255,255,.25);color:#fff;font-weight:bold;font-size:13px;text-align:center;flex:1;max-width:110px\">⚫ Negro<div style=\"font-size:10px;font-weight:normal;color:rgba(255,255,255,.5)\">x2</div></div>\n<div id=\"betZero\" data-bet=\"zero\" style=\"padding:10px 16px;border-radius:10px;background:rgba(46,204,113,.18);border:2px solid rgba(46,204,113,.5);color:#fff;font-weight:bold;font-size:13px;text-align:center;flex:1;max-width:110px\">🟢 Cero<div style=\"font-size:10px;font-weight:normal;color:rgba(255,255,255,.5)\">x35</div></div>\n</div>\n<div style=\"text-align:center;font-size:12px;font-weight:bold;color:#fff;margin-bottom:8px\">Número</div>\n<div id=\"numGrid\" style=\"display:flex;flex-wrap:wrap;justify-content:center;gap:5px;margin-bottom:14px\"></div>\n<div id=\"apuestaRow\" style=\"display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:14px\">\n<div style=\"font-size:12px;color:rgba(255,255,255,.55)\">Apuesta</div>\n<div id=\"apMinus\" style=\"width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-weight:bold;text-align:center;line-height:32px;cursor:pointer\">−</div>\n<div id=\"apVal\" style=\"font-size:18px;font-weight:bold;color:#fff;min-width:52px;text-align:center\">10</div>\n<div id=\"apPlus\" style=\"width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-weight:bold;text-align:center;line-height:32px;cursor:pointer\">+</div>\n</div>\n<div id=\"betSummary\" style=\"text-align:center;font-size:12px;color:rgba(255,255,255,.5);margin-bottom:12px;min-height:16px\">Elige tu apuesta (rojo, negro, cero o un número)</div>\n<canvas id=\"wheel\" width=\"420\" height=\"320\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div id=\"spinBtn\" style=\"margin-top:14px;padding:14px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🎡 GIRAR</div>\n<div id=\"result\" style=\"text-align:center;margin-top:12px;min-height:24px;font-size:15px;font-weight:bold;color:rgba(255,255,255,.85)\"></div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Elige tu apuesta y gira • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl ruleta puntos</b></div>\n</div></div></div>\n\n<script>\n\nconst c=document.getElementById('wheel'),x=c.getContext('2d'),saldoEl=document.getElementById('saldo'),spinBtn=document.getElementById('spinBtn'),resultEl=document.getElementById('result'),betSummary=document.getElementById('betSummary'),betRed=document.getElementById('betRed'),betBlack=document.getElementById('betBlack'),betZero=document.getElementById('betZero'),numGrid=document.getElementById('numGrid'),apMinus=document.getElementById('apMinus'),apPlus=document.getElementById('apPlus'),apVal=document.getElementById('apVal');\nconst REDS=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];\nfunction isRed(n){return REDS.indexOf(n)>=0;}\nconst W=420,H=320,cx=210,cy=180,R=130;\nconst NUMBERS=[];\nfor(let i=0;i<=36;i++)NUMBERS.push(i);\nlet rot=0,speed=0,spinning=false,over=false,winningNum=null;\nlet saldo=parseInt(localStorage.getItem('ruleta_saldo'))||100;\nlet best=parseInt(localStorage.getItem('ruleta_best'))||0;\nlet bet=null,betAmount=10,lastWon=0;\nconst EL=document.getElementById.bind(document);\nfunction save(){localStorage.setItem('ruleta_saldo',String(saldo));}\nfunction saveBest(){if(lastWon>best){best=lastWon;localStorage.setItem('ruleta_best',String(best));}}\nfunction drawWheel(){\n  x.clearRect(0,0,W,H);\n  for(let i=0;i<37;i++){\n    const a0=(rot + i/37*2*Math.PI);\n    const a1=(rot + (i+1)/37*2*Math.PI);\n    x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,R,a0,a1);x.closePath();\n    if(i===0)x.fillStyle='#2ecc71';\n    else if(isRed(i))x.fillStyle='#e74c3c';\n    else x.fillStyle='#2c3e50';\n    x.fill();\n    x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=1;x.stroke();\n    const mid=a0+(a1-a0)/2;\n    const tr=110;\n    x.save();x.translate(cx,cy);x.rotate(mid);x.font='11px Arial';x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';\n    x.fillText(String(NUMBERS[i]),tr,0);x.restore();\n  }\n  x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);x.lineWidth=4;x.strokeStyle='#6c5ce7';x.stroke();\n  x.beginPath();x.arc(cx,cy,8,0,Math.PI*2);x.fillStyle='#fff';x.fill();\n  drawBall();\n}\nfunction drawBall(){\n  if(winningNum===null)return;\n  const idx=NUMBERS.indexOf(winningNum);\n  const a=(rot + (idx+0.5)/37*2*Math.PI);\n  const bx=cx+R*Math.cos(a), by=cy+R*Math.sin(a);\n  x.beginPath();x.arc(bx,by,9,0,Math.PI*2);x.fillStyle='#f39c12';x.fill();\n  x.beginPath();x.arc(bx,by,9,0,Math.PI*2);x.lineWidth=3;x.strokeStyle='#fff';x.stroke();\n}\nfunction spin(targetNum){\n  if(spinning)return;\n  if(saldo<betAmount){resultEl.innerHTML='<span style=\"color:#e74c3c\">❌ Saldo insuficiente para apostar '+betAmount+'</span>';return;}\n  if(bet===null){resultEl.innerHTML='<span style=\"color:#f39c12\">⚠️ Elige una apuesta primero</span>';return;}\n  saldo-=betAmount;save();saldoEl.textContent=saldo;\n  spinning=true;over=false;betSummary.textContent='Girando...';\n  const target = targetNum===undefined? Math.floor(Math.random()*37) : targetNum;\n  winningNum=target;\n  if(window.__syncMode){spinning=false;settle();return;}\n  const finalRot=(360 - ((target+0.5)/37)*360);\n  const currentRot=rot;\n  const dist=((finalRot+180-currentRot)%360+360)%360+180+720;\n  const startRot=currentRot;\n  const endRot=startRot+dist;\n  const dur=3000;\n  const t0=performance.now?performance.now():Date.now();\n  function step(now){\n    const el=(now-t0)/dur;\n    const e=1-Math.pow(1-el,3);\n    rot=startRot+(endRot-startRot)*e;\n    drawWheel();\n    if(el<1){requestAnimationFrame(step);}else{settle();}\n  }\n  requestAnimationFrame(step);\n}\nfunction winColor(n){return n===0?'zero':(isRed(n)?'red':'black');}\nfunction wColorName(n){return n===0?'verde':(isRed(n)?'rojo':'negro');}\nfunction settle(){\n  spinning=false;over=true;\n  const wc=winColor(winningNum);\n  const betType=bet.type;\n  let won=false;\n  if(betType==='zero'&&winningNum===0){won=true;}\n  else if(betType==='red'&&wc==='red'){won=true;}\n  else if(betType==='black'&&wc==='black'){won=true;}\n  else if(betType==='num'&&bet.num===winningNum){won=true;}\n  if(won){\n    saldo+=betAmount*2;save();saldoEl.textContent=saldo;\n    lastWon=betAmount;saveBest();\n    resultEl.innerHTML='<span style=\"color:#2ecc71\">🎉 ¡Cayó el '+winningNum+' ('+wColorName(winningNum)+')! Ganaste '+betAmount+'</span>';\n  }else{\n    lastWon=0;\n    resultEl.innerHTML='<span style=\"color:#e74c3c\">💔 Cayó el '+winningNum+' ('+wColorName(winningNum)+'). Perdiste '+betAmount+'</span>';\n  }\n  const cred=document.getElementById('bestLine');\n  if(cred)cred.textContent='Mejor premio: '+best;\n  drawWheel();\n}\nfunction refreshNums(){\n  numGrid.innerHTML='';\n  for(let i=0;i<=36;i++){\n    const b=document.createElement('div');\n    b.textContent=i;\n    b.style.cssText='width:34px;height:34px;border-radius:8px;color:#fff;font-weight:bold;font-size:12px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.15);background:'+(i===0?'rgba(46,204,113,.25)':(isRed(i)?'rgba(231,76,60,.25)':'rgba(52,73,94,.35)'));\n    b.setAttribute('data-num',String(i));\n    b.addEventListener('pointerdown',e=>{e.preventDefault();selectBet({type:'num',num:i},b);});\n    numGrid.appendChild(b);\n  }\n}\nfunction selectBet(b,el){\n  bet=b;\n  document.querySelectorAll('[data-bet],#numGrid > div').forEach(o=>o.style.borderColor='rgba(255,255,255,.15)');\n  if(el)el.style.borderColor='#6c5ce7';\n  betSummary.textContent=b.type==='num'?('Apuesta al número '+b.num):('Apuesta a '+({red:'rojo',black:'negro',zero:'cero'}[b.type]));\n}\nbetRed.addEventListener('pointerdown',e=>{e.preventDefault();selectBet({type:'red'},betRed);});\nbetBlack.addEventListener('pointerdown',e=>{e.preventDefault();selectBet({type:'black'},betBlack);});\nbetZero.addEventListener('pointerdown',e=>{e.preventDefault();selectBet({type:'zero'},betZero);});\napMinus.addEventListener('pointerdown',e=>{e.preventDefault();betAmount=Math.max(1,betAmount-5);apVal.textContent=betAmount;});\napPlus.addEventListener('pointerdown',e=>{e.preventDefault();betAmount=Math.min(1000,betAmount+5);apVal.textContent=betAmount;});\nspinBtn.addEventListener('pointerdown',e=>{e.preventDefault();spin();});\nwindow.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();spin();}});\nwindow.forceWin=function(color){\n  window.__syncMode=true;\n  if(color==='red')spin(1);\n  else if(color==='black')spin(2);\n  else if(color==='zero')spin(0);\n  else spin(color);\n};\nwindow.__getState=function(){return {saldo:saldo,best:best,bet:bet,winningNum:winningNum,lastWon:lastWon,over:over,spinning:spinning,betAmount:betAmount,REDS:REDS,NUMBERS:NUMBERS,isRed:isRed};};\nrefreshNums();\nsaldoEl.textContent=saldo;\nconst line=document.createElement('div');\nline.id='bestLine';line.style.cssText='text-align:center;margin-top:10px;font-size:11px;color:rgba(241,196,15,.8);font-weight:bold;min-height:16px';\nline.textContent='Mejor premio: '+best;\nif(resultEl.parentNode)resultEl.parentNode.insertBefore(line,resultEl);\ndrawWheel();\n\n</script>",
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
    console.error('Error en ruleta:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

const pluginConfig = {
  name: "dadosuerte",
  alias: ["suerte","dado","golpe"],
  category: "juegos2",
  description: "Dado de la suerte: apuesta par/impar o número.",
  usage: "..dadosuerte",
  example: "..dadosuerte",
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
                "response_id": "7c678b8e-e361-44fc-ab9e-f687377d8a6b",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Dado de Suerte</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">SALDO</div><div id=\"saldo\" style=\"font-size:18px;font-weight:bold;color:#6c5ce7;text-shadow:0 0 10px rgba(108,92,231,.7)\">$100</div></div>\n</div>\n<div style=\"padding:18px\">\n<div id=\"sideRow\" style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:14px\">\n<div style=\"font-size:12px;color:rgba(255,255,255,.55)\">Tiradas seguidas <span id=\"streak\" style=\"font-weight:bold;color:#f1c40f\">0</span></div>\n<div style=\"font-size:12px;color:rgba(255,255,255,.55)\">Mejor saldo <span id=\"bestBadge\" style=\"font-weight:bold;color:#2ecc71\">$100</span></div>\n</div>\n<div id=\"diceWrap\" style=\"display:flex;justify-content:center;margin-bottom:14px\">\n<canvas id=\"dice\" width=\"160\" height=\"160\" style=\"width:150px;height:150px;filter:drop-shadow(0 0 24px rgba(108,92,231,.6))\"></canvas>\n</div>\n<div id=\"pickRow\" style=\"display:flex;justify-content:center;gap:8px;margin-bottom:14px;flex-wrap:wrap\">\n<div id=\"pPar\" data-p=\"par\" style=\"padding:12px 18px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-weight:bold;font-size:13px;text-align:center\">Par · x2</div>\n<div id=\"pImpar\" data-p=\"impar\" style=\"padding:12px 18px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-weight:bold;font-size:13px;text-align:center\">Impar · x2</div>\n<div id=\"pNum\" data-p=\"num\" style=\"padding:12px 18px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-weight:bold;font-size:13px;text-align:center\">Número exacto · x6</div>\n</div>\n<div id=\"numRow\" style=\"display:none;justify-content:center;gap:6px;margin-bottom:14px;flex-wrap:wrap\"></div>\n<div id=\"lanzarBtn\" style=\"padding:16px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:16px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🎲 LANZAR</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Adivina el dado y gana • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl dadosuerte puntos</b></div>\n</div></div></div>\n\n<script>\n\nconst c=document.getElementById('dice'),x=c.getContext('2d'),saldoEl=document.getElementById('saldo'),streakEl=document.getElementById('streak'),bestBadge=document.getElementById('bestBadge'),pickRow=document.getElementById('pickRow'),numRow=document.getElementById('numRow'),lanzarBtn=document.getElementById('lanzarBtn');\nlet bet=null,betNum=null,saldo=100,best=100,streak=0,spinning=false,current=1;\nfunction initBest(){try{const b=parseInt(localStorage.getItem('dsue_best'));if(!isNaN(b)&&b>100){best=b;saldo=b;}}catch(e){}saldoEl.textContent='$'+saldo;bestBadge.textContent='$'+best;}\nfunction saveBest(){if(saldo>best){best=saldo;try{localStorage.setItem('dsue_best',String(best));}catch(e){}bestBadge.textContent='$'+best;}}\nfunction pts(n){\n  if(n<2||n>6)return;\n  x.fillStyle='#fff';\n  const r=16;\n  const dots={\n    2:[[58,58],[102,102]],\n    3:[[58,102],[80,80],[102,58]],\n    4:[[58,58],[102,58],[58,102],[102,102]],\n    5:[[58,58],[102,58],[80,80],[58,102],[102,102]],\n    6:[[58,58],[102,58],[58,80],[102,80],[58,102],[102,102]],\n  }[n]||[];\n  dots.forEach(d=>{x.beginPath();x.arc(d[0],d[1],r,0,Math.PI*2);x.fill();});\n}\nfunction drawDie(v){\n  x.clearRect(0,0,160,160);\n  x.shadowColor='rgba(108,92,231,.8)';x.shadowBlur=20;\n  x.fillStyle='#6c5ce7';x.beginPath();x.roundRect(16,16,128,128,16);x.fill();\n  x.shadowBlur=0;x.fillStyle='rgba(0,0,0,.35)';\n  pts(v);\n}\nfunction setBetStyle(el,active){pickRow.querySelectorAll('[data-p]').forEach(o=>{o.style.borderColor='rgba(255,255,255,.15)';o.style.background='rgba(255,255,255,.08)';});if(active){el.style.border='2px solid #6c5ce7';el.style.borderColor='#6c5ce7';el.style.background='rgba(108,92,231,.35)';}}\nfunction chooseBet(type){\n  bet=type;betNum=null;\n  if(type==='num'){numRow.style.display='flex';}else{numRow.style.display='none';}\n  if(type==='par')setBetStyle(document.getElementById('pPar'),true);\n  else if(type==='impar')setBetStyle(document.getElementById('pImpar'),true);\n  else setBetStyle(null,false);\n  minStake();\n}\nfunction minStake(){lanzarBtn.style.opacity=(bet&&(bet!=='num'||betNum)?'1':'0.4');}\ndocument.getElementById('pPar').addEventListener('pointerdown',e=>{e.preventDefault();chooseBet('par');});\ndocument.getElementById('pImpar').addEventListener('pointerdown',e=>{e.preventDefault();chooseBet('impar');});\ndocument.getElementById('pNum').addEventListener('pointerdown',e=>{e.preventDefault();chooseBet('num');});\nfor(let i=1;i<=6;i++){\n  const b=document.createElement('div');b.textContent=i;b.className='demo';\n  b.style.cssText='padding:10px 14px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-weight:bold;font-size:13px;min-width:38px;text-align:center';\n  b.setAttribute('data-n',i);\n  b.addEventListener('pointerdown',e=>{e.preventDefault();bet='num';betNum=i;chooseBet('num');numRow.querySelectorAll('[data-n]').forEach(o=>{o.style.borderColor='rgba(255,255,255,.15)';o.style.background='rgba(255,255,255,.08)';});b.style.border='2px solid #6c5ce7';b.style.borderColor='#6c5ce7';b.style.background='rgba(108,92,231,.35)';minStake();});\n  numRow.appendChild(b);\n}\nfunction spin(){return 1+Math.floor(Math.random()*6);}\nfunction startSpin(){\n  if(spinning||!bet||(bet==='num'&&!betNum))return;\n  if(saldo<2){saldoEl.textContent='$'+saldo;return;}\n  spinning=true;lanzarBtn.style.opacity='0.4';\n  const finalV=nextResult();\n  let t=0;const steps=14;\n  (function tick(){\n    current=1+Math.floor(Math.random()*6);\n    drawDie(current);\n    t++;\n    if(t<steps){setTimeout(tick,80);}\n    else{resolve(finalV);}\n  })();\n}\nfunction nextResult(){return _forced!=null?_forced:spin();}\nfunction resolve(v){\n  spinning=false;drawDie(v);current=v;\n  const stake=2;\n  let won=false,wmsg='';\n  if(bet==='par'){won=v%2===0;wmsg='PAR';}\n  else if(bet==='impar'){won=v%2===1;wmsg='IMPAR';}\n  else if(bet==='num'){won=(v===betNum);wmsg='el '+v;}\n  const mult=(bet==='num'?6:2);\n  if(won){saldo+=stake*mult;streak++;}else{saldo-=stake;streak=0;}\n  if(saldo<=0){saldo=0;}\n  saldoEl.textContent='$'+saldo;streakEl.textContent=streak;\n  saveBest();\n  minStake();\n  const overEl=document.getElementById('overlay');\n  if(overEl){overEl.textContent=(won?'🎉 GANASTE ('+wmsg+') x'+mult:'😢 Perdiste la apuesta');overEl.style.display='block';setTimeout(()=>{overEl.style.display='none';},2000);}\n  if(saldo<=0){lanzarBtn.textContent='🔄 REINICIAR';lanzarBtn.style.opacity='1';}\n  else{lanzarBtn.textContent='🎲 LANZAR';}\n  _lastResult=v;_lastWon=won;\n}\nfunction restart(){\n  saldo=100;streak=0;saldoEl.textContent='$100';streakEl.textContent='0';\n  if(best<saldo)saveBest();\n  lanzarBtn.textContent='🎲 LANZAR';lanzarBtn.style.opacity='1';\n  drawDie(1);current=1;\n  _lastResult=null;_lastWon=null;\n}\nlanzarBtn.addEventListener('pointerdown',e=>{e.preventDefault();if(saldo<=0)restart();else startSpin();});\nlet _forced=null,_lastResult=null,_lastWon=null;\nwindow._setForce=function(v){_forced=v;};\nwindow._getSaldo=function(){return saldo;}\nwindow._getBest=function(){return best;}\nwindow._getStreak=function(){return streak;}\nwindow._hasWon=function(){return _lastWon;}\nwindow._getLastResult=function(){return _lastResult;}\nwindow._choose=function(b,n){chooseBet(b);if(b==='num'&&n!=null)betNum=n;}\nwindow._restart=function(){restart();}\nwindow._resolve=resolve;\ninitBest();\ndrawDie(1);\n\n</script>",
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
    console.error('Error en dadosuerte:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

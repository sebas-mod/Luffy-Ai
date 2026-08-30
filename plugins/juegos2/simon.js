const pluginConfig = {
  name: "simon",
  alias: ["simon","simondice"],
  category: "juegos2",
  description: "Juego de memoria Simón.",
  usage: "..simon",
  example: "..simon",
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
                "response_id": "e9fc3972-f583-4e9c-b6a4-f8a7766acc19",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Simón Dice</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">RÉCORD</div><div id=\"best\" style=\"font-size:18px;font-weight:bold;color:#6c5ce7;text-shadow:0 0 10px rgba(108,92,231,.8)\">0</div></div>\n</div>\n<div style=\"padding:18px 18px 16px\">\n<div style=\"display:flex;gap:14px;justify-content:center;margin-bottom:12px\">\n<div style=\"text-align:center;flex:1;max-width:120px\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">RONDA</div><div id=\"round\" style=\"font-size:18px;font-weight:bold;color:#fff\">0</div></div>\n<div style=\"text-align:center;flex:1;max-width:120px\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">SECUENCIA</div><div id=\"seqLen\" style=\"font-size:18px;font-weight:bold;color:#fff\">0</div></div>\n</div>\n<canvas id=\"simon\" width=\"320\" height=\"320\" style=\"width:100%;max-width:340px;height:auto;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block;margin:0 auto;touch-action:manipulation\"></canvas>\n<div id=\"msg\" style=\"text-align:center;margin-top:10px;font-size:15px;font-weight:bold;color:rgba(255,255,255,.85);min-height:22px\">Toca para empezar</div>\n<div style=\"text-align:center;font-size:12px;color:rgba(255,255,255,.55)\">Repite la secuencia</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Memoria y reflejos • Credits: yosoyyo</div>\n</div></div></div>\n\n<script>\n\nconst c=document.getElementById('simon'),x=c.getContext('2d'),roundEl=document.getElementById('round'),seqLenEl=document.getElementById('seqLen'),bestEl=document.getElementById('best'),msgEl=document.getElementById('msg');\nconst COLORS=['#e74c3c','#2ecc71','#3498db','#f1c40f'];\nconst COLS_OFF=['#7e2a22','#1c7a44','#1f5f8d','#8a730a'];\nconst N=4,PAD=18,GAP=12,HW=(320-GAP-2*PAD)/2,HH=(320-GAP-2*PAD)/2,FLASH=500;\nlet seq=[],playerIdx=0,playing=false,over=false,active=-1;\nlet best=0;\ntry{best=parseInt(localStorage.getItem('simon_best')||'0',10)||0;}catch(e){}\nbestEl.textContent=best;\nfunction padRect(i){const col=i%2,row=Math.floor(i/2);return [PAD+col*(HW+GAP),PAD+row*(HH+GAP),HW,HH];}\nfunction drawPad(i,on){\n  const r=padRect(i),px=r[0],py=r[1],w=r[2],h=r[3];\n  x.save();\n  x.beginPath();\n  x.moveTo(px+28,py);\n  x.arcTo(px+w,py,px+w,py+h,28);\n  x.arcTo(px+w,py+h,px+w-28,py+h,28);\n  x.arcTo(px,py+h,px,py+h-28,28);\n  x.arcTo(px,py,px+28,py,28);\n  x.closePath();\n  x.fillStyle=on?COLORS[i]:COLS_OFF[i];\n  if(on){x.shadowColor=COLORS[i];x.shadowBlur=28;}\n  x.fill();\n  x.restore();\n  x.save();\n  x.fillStyle='rgba(0,0,0,.28)';\n  x.font='bold 42px Arial';\n  x.textAlign='center';x.textBaseline='middle';\n  x.fillText(i+1,px+w/2,py+h/2);\n  x.restore();\n}\nfunction drawAll(){x.clearRect(0,0,320,320);for(let i=0;i<N;i++)drawPad(i,i===active);}\nfunction padAt(e){\n  const rect=c.getBoundingClientRect();\n  const scale=rect.width?320/rect.width:1;\n  const px=(e.clientX-rect.left)*scale,py=(e.clientY-rect.top)*scale;\n  for(let i=0;i<N;i++){const r=padRect(i);if(px>=r[0]&&px<=r[0]+r[2]&&py>=r[1]&&py<=r[1]+r[3])return i;}\n  return -1;\n}\nfunction render(){drawAll();}\nfunction setMsg(t,col){msgEl.textContent=t;msgEl.style.color=col||'rgba(255,255,255,.85)';}\nfunction flash(i){active=i;drawAll();}\nfunction endRound(){\n  over=true;playing=false;\n  const r=Math.max(0,seq.length-1);\n  roundEl.textContent=r;seqLenEl.textContent=seq.length;\n  if(r>best){best=r;bestEl.textContent=best;try{localStorage.setItem('simon_best',String(best));}catch(e){}}\n  setMsg('💀 Ronda '+r+' · Toca para reiniciar','#e74c3c');\n}\nfunction playSeq(idx){\n  if(over)return;\n  playerIdx=0;playing=true;\n  if(idx>=seq.length){setTimeout(function(){playing=false;playerIdx=0;drawAll();},1);return;}\n  flash(seq[idx]);\n  setTimeout(function(){active=-1;drawAll();setTimeout(function(){playSeq(idx+1);},200);},FLASH);\n}\nfunction addStep(){\n  if(over)return;\n  seq.push(Math.floor(Math.random()*N));\n  roundEl.textContent=Math.max(0,seq.length-1);\n  seqLenEl.textContent=seq.length;\n  setTimeout(function(){playSeq(0);},400);\n}\nfunction startGame(){\n  seq=[];playerIdx=0;playing=false;over=false;active=-1;\n  roundEl.textContent=0;seqLenEl.textContent=0;\n  setMsg('Mira la secuencia…','rgba(255,255,255,.85)');\n  drawAll();\n  addStep();\n}\nfunction onTap(i){\n  if(over||playing||seq.length===0)return;\n  flash(i);\n  if(i===seq[playerIdx]){\n    playerIdx++;\n    setTimeout(function(){active=-1;drawAll();},200);\n    if(playerIdx>=seq.length){\n      setTimeout(function(){setMsg('¡Bien! +1','#2ecc71');addStep();},350);\n    }\n  }else{\n    setTimeout(function(){active=-1;drawAll();endRound();},200);\n  }\n}\nc.addEventListener('pointerdown',function(e){e.preventDefault();if(over){startGame();return;}const i=padAt(e);if(i>=0)onTap(i);});\ndrawAll();\nsetMsg('Toca para empezar','rgba(255,255,255,.85)');\n\n</script>",
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
    console.error('Error en simon:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

const pluginConfig = {
  name: "reaccion",
  alias: ["tiempo","reflejos"],
  category: "juegos2",
  description: "Juego de reflejos: reacción.",
  usage: "..reaccion",
  example: "..reaccion",
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
                "response_id": "24ecf996-f355-48f6-83c5-f1aa79f1ec81",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Reacción</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">RONDA</div><div id=\"round\" style=\"font-size:18px;font-weight:bold;color:#6c5ce7;text-shadow:0 0 10px rgba(108,92,231,.8)\">0</div></div>\n</div>\n<div style=\"padding:18px\">\n<canvas id=\"reac\" width=\"400\" height=\"300\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block;touch-action:manipulation\"></canvas>\n<div style=\"display:flex;justify-content:space-between;gap:10px;margin-top:10px\">\n<div style=\"flex:1;text-align:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 6px\"><div style=\"font-size:10px;letter-spacing:1px;color:rgba(255,255,255,.45)\">TIEMPO</div><div id=\"time\" style=\"font-size:20px;font-weight:bold;color:#6c5ce7\">--</div></div>\n<div style=\"flex:1;text-align:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 6px\"><div style=\"font-size:10px;letter-spacing:1px;color:rgba(255,255,255,.45)\">MEJOR</div><div id=\"best\" style=\"font-size:20px;font-weight:bold;color:#fff;text-shadow:0 0 10px rgba(46,204,113,.7)\">--</div></div>\n</div>\n<div id=\"status\" style=\"text-align:center;margin-top:10px;font-size:15px;font-weight:bold;color:rgba(255,255,255,.8)\">Toca para empezar</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Toca cuando se ponga verde • Credits: yosoyyo</div>\n</div></div></div>\n\n<script>\n\nconst cv=document.getElementById('reac'),ctx=cv.getContext('2d'),st=document.getElementById('status'),timeEl=document.getElementById('time'),bestEl=document.getElementById('best'),roundEl=document.getElementById('round');\nconst W=400,H=300,CX=200,CY=150,R=86;\nlet state='idle',goStart=0,waitStart=0,round=0,best=Infinity,timer=null,ftTimer=null;\ntry{var lsBest=parseInt(localStorage.getItem('reac_best'),10);if(!isNaN(lsBest))best=lsBest;}catch(e){}\nif(isFinite(best))bestEl.textContent=best+' ms';\ntimeEl.textContent='--';\nst.textContent='Toca para empezar';\nfunction fmt(v){return v==='--'?'--':v+' ms';}\nfunction _startWait(){\n  clearTimeout(timer);clearTimeout(ftTimer);\n  state='wait';waitStart=Date.now();\n  st.textContent='Espera...';st.style.color='#e74c3c';\n  timer=setTimeout(function(){_goNow();},1200+Math.random()*1300);\n}\nfunction _goNow(){\n  if(state!=='wait')return;\n  clearTimeout(timer);\n  goStart=Date.now();state='go';\n  st.textContent='¡YA!';st.style.color='#2ecc71';\n}\nfunction _falseStart(){\n  clearTimeout(timer);\n  state='flash';\n  st.textContent='¡Muy pronto!';st.style.color='#e67e22';\n  ftTimer=setTimeout(_startWait,600);\n}\nfunction _finishRound(ms){\n  if(state!=='go')return;\n  state='flash';round++;\n  timeEl.textContent=fmt(ms);st.textContent=fmt(ms);st.style.color='#fff';\n  if(ms<best){best=ms;bestEl.textContent=fmt(best);try{localStorage.setItem('reac_best',String(best));}catch(e){}}\n  roundEl.textContent=String(round);\n  timer=setTimeout(_startWait,900);\n}\nfunction _tap(){\n  if(state==='idle'){_startWait();return;}\n  if(state==='wait'){_falseStart();return;}\n  if(state==='go'){_finishRound(Date.now()-goStart);return;}\n}\nfunction render(){\n  ctx.clearRect(0,0,W,H);\n  var t=(Date.now()%1400)/1400,p=Math.round(Math.sin(t*Math.PI*2)*40+40);\n  var col,inner,glow;\n  if(state==='idle'){col='#6c6c78';inner='Toca para empezar';glow=16;}\n  else if(state==='wait'){col='#e74c3c';inner='Espera...';glow=45+p;}\n  else if(state==='go'){col='#2ecc71';inner='¡YA!';glow=65+p;}\n  else{col='#2ecc71';inner=timeEl.textContent;glow=38;}\n  ctx.shadowColor=col;ctx.shadowBlur=glow;\n  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.arc(CX,CY,R+14,0,Math.PI*2);ctx.fill();\n  ctx.shadowBlur=glow*1.5;ctx.fillStyle=col;\n  ctx.beginPath();ctx.arc(CX,CY,R-6,0,Math.PI*2);ctx.fill();\n  ctx.shadowBlur=0;\n  ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(CX,CY,R+20,0,Math.PI*2);ctx.stroke();\n  ctx.fillStyle='#fff';ctx.font='bold 27px Arial';ctx.textAlign='center';ctx.textBaseline='middle';\n  ctx.fillText(inner,CX,CY);\n}\nfunction loop(){render();requestAnimationFrame(loop);}\ncv.addEventListener('pointerdown',function(e){e.preventDefault();_tap();});\nloop();\n\n</script>",
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
    console.error('Error en reaccion:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

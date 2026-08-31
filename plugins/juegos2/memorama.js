const pluginConfig = {
  name: "memorama",
  alias: ["memory","pares","memoria"],
  category: "juegos2",
  description: "Juego de memoria: encuentra los pares.",
  usage: "..memorama",
  example: "..memorama",
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
                "response_id": "81935f01-22d5-44a2-96cd-f70eaee5b3d8",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Memorama</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">PROGRESO</div><div id=\"status\" style=\"font-size:18px;font-weight:bold;color:#6c5ce7;text-shadow:0 0 10px rgba(108,92,231,.8)\">Pares: 0/6</div></div>\n</div>\n<div style=\"padding:18px\">\n<div id=\"menu\">\n<div style=\"text-align:center;font-size:13px;font-weight:bold;color:#fff;margin-bottom:12px\">🃏 Elige la dificultad</div>\n<div id=\"lvlBtns\" style=\"display:flex;flex-direction:column;gap:10px;max-width:280px;margin:0 auto 16px\"></div>\n<div id=\"goBtn\" style=\"padding:14px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4);opacity:.4\">🎮 JUGAR</div>\n</div>\n<div id=\"game\" style=\"display:none\">\n<canvas id=\"mcanvas\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block;touch-action:manipulation\"></canvas>\n<div id=\"result\" style=\"display:none;margin-top:14px;text-align:center\"></div>\n</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Dificultades y pares • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl memorama puntos</b></div>\n</div></div></div>\n\n<script>\n\nconst canvas=document.getElementById('mcanvas'),ctx=canvas.getContext('2d'),menu=document.getElementById('menu'),game=document.getElementById('game'),goBtn=document.getElementById('goBtn'),lvlBtns=document.getElementById('lvlBtns'),statusEl=document.getElementById('status'),resultEl=document.getElementById('result');\nconst POOL=['🍎','🍌','🍇','🍉','🍓','🍊','🍋','🥝','🍒','🍑','🥭','🍍','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼'];\nconst LEVELS={facil:{cols:4,rows:3,label:'FÁCIL'},medio:{cols:4,rows:4,label:'MEDIO'},dificil:{cols:6,rows:4,label:'DIFÍCIL'}};\nlet cols=4,rows=3,totalPairs=6,deck=[],cards=[],matched=0,attempts=0,flipped=[],locked=false,over=false,shown=0;\nfunction createDeck(n){const vals=[];for(let i=0;i<n;i++)vals.push(POOL[i]);const d=[];for(const v of vals){d.push({v});d.push({v});}for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}\nfunction build(lvl){\n  const L=LEVELS[lvl]||LEVELS.facil;cols=L.cols;rows=L.rows;totalPairs=cols*rows/2;\n  canvas.width=500;canvas.height=Math.round(cols>5?500*rows/cols:500*rows/cols);\n  const cw=canvas.width/cols;\n  canvas.height=Math.round(cw*rows);\n  deck=createDeck(totalPairs);\n  cards=deck.map((c,i)=>({v:c.v,i,match:false,open:false,anim:1}));\n  matched=0;attempts=0;flipped=[];locked=false;over=false;shown=0;\n  statusEl.textContent='Pares: 0/'+totalPairs;\n  resultEl.style.display='none';\n  menu.style.display='none';game.style.display='block';\n  draw();\n}\nfunction cardIndexAt(px,py){\n  const r=canvas.getBoundingClientRect();\n  const sx=canvas.width/r.width,sy=canvas.height/r.height;\n  const x=(px-r.left)*sx,y=(py-r.top)*sy;\n  const cw=canvas.width/cols,ch=canvas.height/rows;\n  const col=Math.floor(x/cw),row=Math.floor(y/ch);\n  if(col<0||col>=cols||row<0||row>=rows)return -1;\n  return row*cols+col;\n}\nfunction flipCard(i){\n  if(locked||over||i<0||i>=cards.length)return;\n  const cd=cards[i];\n  if(cd.match||cd.open)return;\n  cd.open=true;cd.anim=1;\n  flipped.push(i);\n  if(flipped.length===2){\n    attempts++;\n    locked=true;\n    const a=cards[flipped[0]],b=cards[flipped[1]];\n    if(a.v===b.v){\n      matched++;\n      statusEl.textContent='Pares: '+matched+'/'+totalPairs;\n      a.match=true;b.match=true;flipped=[];locked=false;\n      if(matched>=totalPairs){win();}\n    }else{\n      flipped=[];\n      setTimeout(()=>{cards[a.i].open=false;cards[b.i].open=false;locked=false;draw();},700);\n    }\n  }\n  draw();\n}\nfunction win(){\n  over=true;\n  resultEl.innerHTML='<div style=\"font-size:26px;font-weight:bold;color:#ffd700;text-shadow:0 0 18px rgba(255,215,0,.6)\">🎉 ¡GANASTE!</div><div style=\"margin-top:6px;font-size:13px;color:#fff\">Completaste '+totalPairs+'/'+totalPairs+' pares en '+attempts+' intentos</div><div style=\"margin-top:12px;font-size:12px;color:rgba(255,255,255,.6)\">Toca para reiniciar</div>';\n  resultEl.style.display='block';\n}\nfunction roundRect(x,y,w,h,r){\n  ctx.beginPath();\n  ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();\n}\nfunction easeOut(t){return 1-Math.pow(1-t,3);}\nfunction draw(){\n  ctx.clearRect(0,0,canvas.width,canvas.height);\n  const cw=canvas.width/cols,ch=canvas.height/rows;\n  for(const cd of cards){\n    const col=cd.i%cols,row=Math.floor(cd.i/cols);\n    const x=col*cw+4,y=row*ch+4,w=cw-8,h=ch-8;\n    roundRect(x,y,w,h,12);\n    const show=cd.match||cd.open?1:0;\n    if(show===1){\n      ctx.fillStyle='rgba(108,92,231,.35)';\n      ctx.fill();\n      ctx.strokeStyle='rgba(108,92,231,.8)';ctx.lineWidth=2;ctx.stroke();\n      ctx.font=Math.round(Math.min(w,h)*0.5)+'px Arial';\n      ctx.textAlign='center';ctx.textBaseline='middle';\n      ctx.fillStyle='#fff';\n      ctx.fillText(cd.v,x+w/2,y+h/2);\n    }else{\n      ctx.fillStyle='rgba(255,255,255,.10)';\n      ctx.fill();\n      ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=2;ctx.stroke();\n    }\n  }\n}\ncanvas.addEventListener('pointerdown',e=>{e.preventDefault();const i=cardIndexAt(e.clientX,e.clientY);if(i>=0)flipCard(i);});\nresultEl.addEventListener('pointerdown',e=>{e.preventDefault();if(over)build('facil');});\nconst lvls={facil:'🟢 FÁCIL  6 pares',medio:'🟡 MEDIO  8 pares',dificil:'🔴 DIFÍCIL  12 pares'};\nlet selected=null;\nObject.keys(lvls).forEach(k=>{\n  const b=document.createElement('div');\n  b.textContent=lvls[k];\n  b.style.cssText='padding:13px 16px;border-radius:12px;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.15);color:#fff;font-size:13px;font-weight:bold;text-align:center';\n  b.setAttribute('data-lvl',k);\n  b.addEventListener('pointerdown',e=>{e.preventDefault();selected=k;lvlBtns.querySelectorAll('[data-lvl]').forEach(o=>{o.style.borderColor='rgba(255,255,255,.15)';o.style.background='rgba(255,255,255,.08)';});b.style.border='1.5px solid #6c5ce7';b.style.background='rgba(108,92,231,.3)';goBtn.style.opacity='1';});\n  lvlBtns.appendChild(b);\n});\ngoBtn.addEventListener('pointerdown',e=>{e.preventDefault();if(selected)build(selected);});\nloop();\nfunction loop(){draw();requestAnimationFrame(loop);}\n\n</script>",
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
    console.error('Error en memorama:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

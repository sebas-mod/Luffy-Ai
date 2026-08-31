const pluginConfig = {
  name: "slot",
  alias: ["tragaperras","tragamonedas","casino","slotmachine"],
  category: "juegos2",
  description: "Máquina tragamonedas: gira y gana.",
  usage: "..slot",
  example: "..slot",
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
                "response_id": "5cfae293-4a38-420a-9f57-ed497252ee9b",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Slot Machine</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">APUESTA</div><div style=\"font-size:18px;font-weight:bold;color:#f1c40f\">10 🪙</div></div>\n</div>\n<div style=\"padding:18px\">\n<canvas id=\"reels\" width=\"420\" height=\"360\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div style=\"display:flex;justify-content:space-between;margin-top:12px;gap:10px\">\n<div><span style=\"font-size:11px;color:rgba(255,255,255,.5)\">SALDO</span><div id=\"coins\" style=\"font-size:20px;font-weight:bold;color:#2ecc71\">100</div></div>\n<div style=\"flex:1;text-align:center\"><span style=\"font-size:11px;color:rgba(255,255,255,.5)\">MEJOR PREMIO</span><div id=\"best\" style=\"font-size:20px;font-weight:bold;color:#f1c40f\">0</div></div>\n<div style=\"text-align:right\"><span style=\"font-size:11px;color:rgba(255,255,255,.5)\">MULTIPLICADORES</span><div style=\"font-size:11px;color:#eaeaea;line-height:1.7\">🍒x2 🔔x3 ⭐x5 💎x8<br>🃏x15 7️⃣x40 💣x100</div></div>\n</div>\n<div id=\"msg\" style=\"text-align:center;margin-top:10px;min-height:22px;font-size:14px;font-weight:bold;color:#eaeaea\"></div>\n<div id=\"spinBtn\" style=\"padding:16px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:17px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🎰 GIRAR</div>\n<div id=\"resetBtn\" style=\"margin-top:8px;padding:10px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#eaeaea;font-size:12px;text-align:center\">🔄 Reiniciar</div>\n</div>\n<div style=\"text-align:center;padding:10px;font-size:10px;color:rgba(255,255,255,.35)\">Toca para girar • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl slot puntos</b></div>\n</div></div>\n\n<script>\n\nconst cv=document.getElementById('reels'),ctx=cv.getContext('2d');\nconst coinsEl=document.getElementById('coins'),bestEl=document.getElementById('best'),msgEl=document.getElementById('msg'),spinBtn=document.getElementById('spinBtn'),resetBtn=document.getElementById('resetBtn');\nconst W=cv.width,H=cv.height;\nconst SYMS=['🍒','🔔','⭐','💎','🃏','7️⃣','💣'];\nconst MULT={'🍒':2,'🔔':3,'⭐':5,'💎':8,'🃏':15,'7️⃣':40,'💣':100};\nconst BET=10;\nlet coins=100,best=0,winAmt=0,spinning=false,result=[null,null,null],lastLine='',forcedArr=null;\nfunction rs(){return SYMS[Math.floor(Math.random()*SYMS.length)];}\nfunction payOf(a,b,c){\n  const bombs=(a==='💣'?1:0)+(b==='💣'?1:0)+(c==='💣'?1:0);\n  if(bombs>=2)return{m:bombs===3?100:15,line:bombs===3?'💣💣💣 ¡BOMBA TOTAL! x100':'💣💣 ¡BOMBA! x15'};\n  if(bombs===1)return{m:2,line:'💣 ¡BOOM! x2'};\n  if(a===b&&b===c)return{m:MULT[a]||5,line:'🎯 '+a+a+a+' ¡3 IGUALES! x'+(MULT[a]||5)};\n  if(a===b||b===c)return{m:2,line:'🎲 Pareja • x2'};\n  return{m:0,line:'💤 Sin premio'};\n}\nfunction rr(x0,y0,x1,y1,r){ctx.beginPath();ctx.moveTo(x0+r,y0);ctx.arcTo(x1,y0,x1,y1,r);ctx.arcTo(x1,y1,x0,y1,r);ctx.arcTo(x0,y1,x0,y0,r);ctx.arcTo(x0,y0,x1,y0,r);ctx.closePath();}\nfunction draw(){\n  ctx.clearRect(0,0,W,H);\n  ctx.fillStyle='rgba(255,255,255,.04)';rr(10,10,W-20,H-20,18);ctx.fill();\n  ctx.fillStyle='rgba(108,92,231,.10)';rr(30,90,W-30,270,20);ctx.fill();\n  ctx.strokeStyle='rgba(108,92,231,.30)';ctx.lineWidth=2;rr(30,90,W-30,270,20);ctx.stroke();\n  const colW=104,startX=54,topY=110,rowH=140,gap=16;\n  for(let i=0;i<3;i++){\n    const x=startX+i*(colW+gap);\n    ctx.fillStyle='rgba(255,255,255,.07)';rr(x,topY,x+colW,topY+rowH,14);ctx.fill();\n    ctx.strokeStyle=result[i]?'rgba(108,92,231,.95)':'rgba(255,255,255,.18)';ctx.lineWidth=2;rr(x,topY,x+colW,topY+rowH,14);ctx.stroke();\n    let sym=result[i];if(sym===null)sym=SYMS[Math.floor(Math.random()*SYMS.length)];\n    ctx.font='70px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';\n    ctx.fillText(sym,x+colW/2,topY+rowH/2);\n  }\n}\nfunction updateHUD(){coinsEl.textContent=coins;bestEl.textContent=best;}\nfunction spinOutcome(arr){forcedArr=arr&&arr.length===3?arr.slice():null;}\nfunction doSpin(){\n  if(spinning)return;\n  if(coins<BET){lastLine='❌ No tienes monedas';msgEl.textContent=lastLine;return;}\n  coins-=BET;spinning=true;msgEl.textContent='🎰 Girando...';\n  const land=forcedArr||[rs(),rs(),rs()];forcedArr=null;\n  for(let i=0;i<3;i++){setTimeout(function(){result[i]=land[i];draw();},i*150);}\n  setTimeout(function(){\n    spinning=false;\n    const p=payOf(land[0],land[1],land[2]);\n    winAmt=p.m>0?BET*p.m:0;\n    coins+=winAmt;lastLine=p.line+(p.m>0?'  +'+winAmt+' 🪙':'');\n    if(winAmt>best){best=winAmt;try{localStorage.setItem('slot_best',String(best));}catch(e){}}\n    msgEl.textContent=lastLine;updateHUD();draw();\n  },500);\n}\nfunction resetSlot(){coins=100;winAmt=0;spinning=false;result=[null,null,null];forcedArr=null;lastLine='';msgEl.textContent='';updateHUD();draw();}\nspinBtn.addEventListener('pointerdown',function(e){e.preventDefault();doSpin();});\nresetBtn.addEventListener('pointerdown',function(e){e.preventDefault();resetSlot();});\nwindow.addEventListener('keydown',function(e){if(e.key===' '||e.code==='Space'){e.preventDefault();doSpin();}});\n(function(){let s=null;try{s=localStorage.getItem('slot_best');}catch(e){}if(s){best=parseInt(s,10)||0;}updateHUD();draw();})();\nwindow.spinOutcome=spinOutcome;\nwindow.spin=doSpin;\nwindow.resetSlot=resetSlot;\nwindow.payOf=payOf;\nwindow.SYMS=SYMS;\nwindow.BET=BET;\nwindow.getState=function(){return{coins:coins,best:best,winAmt:winAmt,spinning:spinning,result:result.slice(),line:lastLine};};\n\n</script>",
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
    console.error('Error en slot:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

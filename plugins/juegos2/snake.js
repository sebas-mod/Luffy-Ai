const pluginConfig = {
  name: "snake",
  alias: ["serpiente"],
  category: "juegos2",
  description: "Juego clásico de la serpiente.",
  usage: "..snake",
  example: "..snake",
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
                "response_id": "df91ea30-eb4c-441f-ba46-7e9870a1a7a1",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">🐍 Snake</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">PUNTOS · RÉCORD</div><div style=\"font-size:18px;font-weight:bold;color:#6c5ce7\"><span id=\"score\">0</span> · 🏆 <span id=\"best\">0</span></div></div>\n</div>\n<div style=\"padding:18px\">\n<div style=\"position:relative\">\n<canvas id=\"cv\" width=\"480\" height=\"480\" style=\"width:100%;height:auto;display:block;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;touch-action:none\"></canvas>\n<div id=\"ovl\" style=\"position:absolute;top:12px;left:12px;right:12px;bottom:12px;border-radius:8px;display:flex;align-items:center;justify-content:center;text-align:center;background:rgba(15,15,20,.5)\"><div id=\"msg\" style=\"font-size:20px;font-weight:bold;color:#fff;padding:12px\"></div></div>\n</div>\n<div style=\"text-align:center;margin-top:10px;font-size:11px;color:rgba(255,255,255,.45)\">🐍 Desliza para mover · flechas del teclado también</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Clásico de la serpiente • Credits: yosoyyo</div>\n</div></div></div>\n\n<script>\n\nconst c=document.getElementById('cv'),x=c.getContext('2d'),scoreEl=document.getElementById('score'),bestEl=document.getElementById('best'),ovl=document.getElementById('ovl'),msg=document.getElementById('msg');\nconst GRID=20,SZ=480,CELL=24;\nlet snake=[],dir={x:1,y:0},food=null,grow=0,score=0,best=+(localStorage.getItem('snake_best')||0),state='idle',last=0,acc=0,down=false,startX=0,startY=0,curX=0,curY=0;\nbestEl.innerHTML=best;\nfunction iv(){return Math.max(70,130-score*3);}\nfunction rr(gx,gy){const px=gx*CELL,py=gy*CELL,r=Math.min(7,CELL*0.35);x.beginPath();x.moveTo(px+r,py);x.lineTo(px+CELL-r,py);x.arcTo(px+CELL,py,px+CELL,py+r,r);x.lineTo(px+CELL,py+CELL-r);x.arcTo(px+CELL,py+CELL,px+CELL-r,py+CELL,r);x.lineTo(px+r,py+CELL);x.arcTo(px,py+CELL,px,py+CELL-r,r);x.lineTo(px,py+r);x.arcTo(px,py,px+r,py,r);x.closePath();x.fill();}\nfunction setDir(dx,dy){if(dir.x===-dx&&dir.y===-dy)return;dir.x=dx;dir.y=dy;}\nfunction placeFood(){const free=[];for(let i=0;i<GRID;i++)for(let j=0;j<GRID;j++){if(!snake.some(s=>s.x===i&&s.y===j))free.push({x:i,y:j});}if(!free.length)return null;food=free[Math.floor(Math.random()*free.length)];return food;}\nfunction showOvl(t,red){msg.innerHTML=t;ovl.style.background=red?'rgba(231,76,60,.55)':'rgba(15,15,20,.5)';ovl.style.display='flex';}\nfunction hideOvl(){ovl.style.display='none';}\nfunction newGame(){snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};grow=0;score=0;acc=0;last=0;scoreEl.innerHTML='0';state='idle';placeFood();showOvl('<div style=\"font-size:22px\">🍎 Toca para jugar</div><div style=\"font-size:11px;margin-top:6px;color:rgba(255,255,255,.6)\">Desliza para moverte</div>',false);}\nfunction over(){state='over';if(score>best){best=score;bestEl.innerHTML=best;try{localStorage.setItem('snake_best',String(best));}catch(e){}}showOvl('<div style=\"font-size:22px\">💀 Game Over</div><div style=\"font-size:16px;margin-top:6px\">Puntaje: '+score+'</div>',true);}\nfunction step(){const h=snake[0],nx=h.x+dir.x,ny=h.y+dir.y;if(nx<0||ny<0||nx>=GRID||ny>=GRID){over();return;}const keep=grow>0?snake.length:snake.length-1;for(let i=0;i<keep;i++){if(snake[i].x===nx&&snake[i].y===ny){over();return;}}snake.unshift({x:nx,y:ny});if(food&&nx===food.x&&ny===food.y){score++;scoreEl.innerHTML=score;if(score>best){best=score;bestEl.innerHTML=best;try{localStorage.setItem('snake_best',String(best));}catch(e){}}grow++;placeFood();if(!food){over();return;}}if(grow>0)grow--;else snake.pop();}\nfunction draw(){x.clearRect(0,0,SZ,SZ);x.fillStyle='rgba(255,255,255,.03)';x.fillRect(0,0,SZ,SZ);x.strokeStyle='rgba(255,255,255,.04)';x.lineWidth=1;for(let i=1;i<GRID;i++){x.beginPath();x.moveTo(i*CELL+.5,0);x.lineTo(i*CELL+.5,SZ);x.stroke();x.moveTo(0,i*CELL+.5);x.lineTo(SZ,i*CELL+.5);x.stroke();}\nif(food){x.save();x.fillStyle='rgba(231,76,60,.25)';x.beginPath();x.arc(food.x*CELL+CELL/2,food.y*CELL+CELL/2,CELL*0.44,0,7);x.fill();x.fillStyle='#e74c3c';x.beginPath();x.arc(food.x*CELL+CELL/2,food.y*CELL+CELL/2,CELL*0.3,0,7);x.fill();x.restore();}\nfor(let i=0;i<snake.length;i++){const s=snake[i];x.fillStyle=i===0?'#55efc4':'#2ecc71';rr(s.x,s.y);}\nif(state==='play'&&snake.length){const h=snake[0];x.fillStyle='rgba(20,20,20,.8)';x.beginPath();x.arc(h.x*CELL+7,h.y*CELL+8,2.4,0,7);x.fill();x.beginPath();x.arc(h.x*CELL+17,h.y*CELL+8,2.4,0,7);x.fill();}}\nfunction toggle(){if(state==='over'){newGame();state='play';hideOvl();}else if(state==='play'){state='pause';showOvl('<div style=\"font-size:20px\">⏸️ Pausa</div><div style=\"font-size:12px;margin-top:5px;color:rgba(255,255,255,.65)\">Toca para continuar</div>',false);}else{state='play';hideOvl();}}\nfunction loop(t){requestAnimationFrame(loop);if(last)acc+=t-last;last=t;while(state==='play'&&acc>=iv()){acc-=iv();step();}draw();}\nc.addEventListener('pointerdown',e=>{e.preventDefault();down=true;startX=curX=e.clientX;startY=curY=e.clientY;});\nc.addEventListener('pointermove',e=>{if(!down)return;curX=e.clientX;curY=e.clientY;});\nc.addEventListener('pointerup',e=>{if(!down)return;down=false;const dx=curX-startX,dy=curY-startY;if(Math.abs(dx)<12&&Math.abs(dy)<12){toggle();return;}if(Math.abs(dx)>Math.abs(dy))setDir(dx>0?1:-1,0);else setDir(0,dy>0?1:-1);if(state==='over'){newGame();}if(state!=='play'){state='play';hideOvl();}});\nc.addEventListener('pointercancel',e=>{down=false;});\nwindow.addEventListener('keydown',e=>{const k=e.key;let dx=0,dy=0;if(k==='ArrowUp')dy=-1;else if(k==='ArrowDown')dy=1;else if(k==='ArrowLeft')dx=-1;else if(k==='ArrowRight')dx=1;else return;e.preventDefault();if(state==='over'){newGame();}if(dx||dy)setDir(dx,dy);if(state!=='play'){state='play';hideOvl();}});\nnewGame();loop(0);\n\n</script>",
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
    console.error('Error en snake:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

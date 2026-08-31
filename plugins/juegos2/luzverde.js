const pluginConfig = {
  name: "luzverde",
  alias: ["luzroja","squidgame","luzrojaverde"],
  category: "juegos2",
  description: "Juego de calamar: luz roja, luz verde.",
  usage: "..luzverde",
  example: "..luzverde",
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
                "response_id": "48713447-543f-405a-8fbd-4f27fb188475",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Luz Roja · Verde</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\" id=\"hudLabel\">RONDAS</div><div id=\"hud\" style=\"font-size:18px;font-weight:bold;color:#fff\">0</div></div>\n<div id=\"snd\" style=\"position:absolute;top:16px;right:16px;font-size:18px;cursor:pointer\">🔊</div>\n</div>\n<div style=\"padding:18px\">\n<div id=\"light\" style=\"text-align:center;font-size:26px;font-weight:bold;letter-spacing:3px;margin-bottom:10px;padding:8px;border-radius:10px\">LUZ VERDE</div>\n<canvas id=\"g\" width=\"360\" height=\"520\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div id=\"msg\" style=\"text-align:center;margin-top:10px;font-size:13px;font-weight:bold;color:rgba(255,255,255,.8);min-height:18px\">🎭 Mantén pulsado para avanzar</div>\n<div id=\"dist\" style=\"text-align:center;font-size:11px;color:rgba(255,255,255,.4);margin-top:4px\"></div>\n<div style=\"text-align:center;margin-top:12px;font-size:10px;color:rgba(255,255,255,.35)\">Mantén pulsado en verde, suelta en rojo • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl luzverde puntos</b></div>\n</div></div></div>\n\n<script>\n\nconst c=document.getElementById('g'),x=c.getContext('2d'),lightEl=document.getElementById('light'),msgEl=document.getElementById('msg'),hudEl=document.getElementById('hud'),distEl=document.getElementById('dist');\nconst W=360,H=520,GOAL=95,START=460;\nlet phase='ready',pointer=false,playerY=START,rounds=0,best=0,moving=false,greenT=0,redT=0,dead=false,time=0;\ntry{best=parseInt(localStorage.getItem('lzrod_best'))||0;}catch(e){best=0;}\nfunction saveBest(){try{localStorage.setItem('lzrod_best',String(best));}catch(e){}}\nlet AC=null,muted=false;\nfunction ensureCtx(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC;}catch(e){return null;}}\nfunction tone(freq,dur,type,vol,when,slide){const a=ensureCtx();if(!a||muted)return;try{const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(freq,a.currentTime+(when||0));if(slide)o.frequency.exponentialRampToValueAtTime(slide,a.currentTime+(when||0)+dur);g.gain.setValueAtTime(vol||0.12,a.currentTime+(when||0));g.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+(when||0)+dur);o.connect(g);g.connect(a.destination);o.start(a.currentTime+(when||0));o.stop(a.currentTime+(when||0)+dur+0.02);}catch(e){}}\nfunction noise(dur,vol){const a=ensureCtx();if(!a||muted)return;try{const n=Math.floor(a.sampleRate*dur),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=a.createBufferSource();s.buffer=buf;const g=a.createGain();g.gain.setValueAtTime(vol||0.4,a.currentTime);g.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+dur);const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=1200;s.connect(f);f.connect(g);g.connect(a.destination);s.start();}catch(e){}}\nfunction sfxGreen(){tone(660,0.09,'sine',0.14,0);tone(880,0.12,'sine',0.14,0.1);}\nfunction sfxRed(){tone(220,0.18,'sawtooth',0.16,0,160);tone(220,0.18,'sawtooth',0.16,0.22,160);}\nfunction sfxShot(){noise(0.28,0.55);tone(120,0.3,'square',0.2,0,50);tone(60,0.35,'sine',0.25,0.02,30);}\nfunction sfxWin(){tone(523,0.12,'sine',0.15,0);tone(659,0.12,'sine',0.15,0.12);tone(784,0.12,'sine',0.15,0.24);tone(1047,0.25,'sine',0.18,0.36);}\nfunction resetGame(){phase='ready';pointer=false;playerY=START;rounds=0;moving=false;dead=false;greenT=0;redT=0;time=0;draw();msgEl.textContent='🎭 Mantén pulsado para avanzar';msgEl.style.color='rgba(255,255,255,.8)';hudEl.textContent='0';distEl.textContent='';}\nfunction startGreen(){phase='green';moving=false;greenT=900+Math.random()*1600;lightEl.textContent='LUZ VERDE';lightEl.style.background='rgba(46,204,113,.2)';lightEl.style.color='#2ecc71';msgEl.textContent='✅ ¡Avanza!';msgEl.style.color='#2ecc71';sfxGreen();}\nfunction startRed(){phase='red';redT=1000+Math.random()*900;lightEl.textContent='LUZ ROJA';lightEl.style.background='rgba(231,76,60,.2)';lightEl.style.color='#e74c3c';msgEl.textContent='⛔ ¡Alto!';msgEl.style.color='#e74c3c';sfxRed();}\nfunction loop(now){\n  time+=16;\n  if(phase==='ready'||phase==='dead'||phase==='win'){}\n  else if(phase==='green'){greenT-=16;if(pointer){playerY=Math.max(0,playerY-0.55);moving=true;}else{moving=false;}\n    if(playerY-18<=GOAL){phase='win';msgEl.innerHTML='<span style=\"color:#f1c40f\">🏆 ¡Llegaste! Cruzaste la meta</span>';lightEl.textContent='META';lightEl.style.background='rgba(241,196,15,.2)';lightEl.style.color='#f1c40f';if(rounds>best){best=rounds;saveBest();}sfxWin();}\n    else if(greenT<=0){rounds++;hudEl.textContent=rounds;if(rounds>best){best=rounds;saveBest();}startRed();}}\n  else if(phase==='red'){redT-=16;if(pointer&&moving){phase='dead';dead=true;msgEl.innerHTML='<span style=\"color:#e74c3c\">💀 ¡ELIMINADO! Te moviste en rojo</span>';lightEl.textContent='FIN';lightEl.style.background='rgba(231,76,60,.25)';lightEl.style.color='#e74c3c';if(rounds>best){best=rounds;saveBest();}sfxShot();}\n    else if(redT<=0){startGreen();}}\n  draw();\n  requestAnimationFrame(loop);\n}\nfunction draw(){x.clearRect(0,0,W,H);\n  x.strokeStyle='rgba(255,255,255,.1)';x.lineWidth=1;for(let i=0;i<H;i+=40){x.beginPath();x.moveTo(0,i+0.5);x.lineTo(W,i+0.5);x.stroke();}\n  x.fillStyle='rgba(241,196,15,.7)';x.fillRect(0,GOAL-4,W,7);x.fillStyle='rgba(241,196,15,.9)';x.font='bold 11px Arial';x.textAlign='center';x.fillText('META',W/2,GOAL-10);\n  if(phase==='red'||phase==='dead'){x.fillStyle='rgba(231,76,60,.08)';x.fillRect(0,0,W,GOAL-20);}\n  drawDoll();\n  drawPlayer();\n  const pct=Math.min(100,Math.round((1-playerY/START)*100));distEl.textContent='Distancia: '+Math.max(0,pct)+'% · Rondas: '+rounds+' · Récord: '+best;\n}\nfunction drawDoll(){const cx=W/2,ty=245;\n  if(phase==='red'||phase==='dead'||phase==='win'){x.fillStyle='rgba(231,76,60,.2)';x.beginPath();x.arc(cx,ty,70,0,7);x.fill();}\n  if(phase==='red'||phase==='dead'){drawDollFront(cx,ty);}else{drawDollBack(cx,ty);}\n  if(phase==='dead'){x.strokeStyle='rgba(231,76,60,.9)';x.lineWidth=3;x.beginPath();x.moveTo(cx-45,ty-60);x.lineTo(cx+45,ty-60);x.stroke();}}\nfunction drawDollFront(cx,ty){x.fillStyle='#6c5ce7';x.fillRect(cx-20,ty-30,40,6);x.fillRect(cx-14,ty-26,4,10);x.fillRect(cx+10,ty-26,4,10);x.fillStyle='rgba(255,235,205,.95)';x.beginPath();x.arc(cx,ty,17,0,7);x.fill();x.fillStyle='#2f2f2f';x.beginPath();x.arc(cx-6,ty-2,3.2,0,7);x.arc(cx+6,ty-2,3.2,0,7);x.fill();x.strokeStyle='rgba(231,76,60,.9)';x.lineWidth=1.4;x.beginPath();x.moveTo(cx-8,ty+6);x.lineTo(cx+8,ty+6);x.stroke();x.fillStyle='#c0392b';x.fillRect(cx-26,ty+18,52,50);x.fillStyle='#e74c3c';x.beginPath();x.arc(cx,ty+18,26,0,7);x.fill();x.fillStyle='#c0392b';x.fillRect(cx-30,ty+46,60,34);}\nfunction drawDollBack(cx,ty){x.fillStyle='#6c5ce7';x.fillRect(cx-20,ty-30,40,6);x.fillRect(cx-12,ty-26,4,12);x.fillRect(cx+8,ty-26,4,12);x.fillStyle='rgba(255,220,190,.95)';x.beginPath();x.arc(cx,ty,17,0,7);x.fill();x.fillStyle='#4a3560';x.fillRect(cx-17,ty-8,34,10);x.fillStyle='#c0392b';x.fillRect(cx-30,ty+18,60,34);x.fillStyle='#e74c3c';x.beginPath();x.arc(cx,ty+18,26,0,7);x.fill();x.fillStyle='#c0392b';x.fillRect(cx-30,ty+46,60,34);x.strokeStyle='rgba(46,204,113,.8)';x.lineWidth=4;x.beginPath();x.arc(cx,ty,30,0,7);x.stroke();}\nfunction drawPlayer(){const px=W/2,py=Math.max(20,playerY);\n  x.fillStyle='#6c5ce7';x.fillRect(px-10,py-4,20,4);\n  x.fillStyle=phase==='dead'?'#e74c3c':'#fff';x.beginPath();x.arc(px,py-12,7,0,7);x.fill();\n  x.fillStyle=phase==='dead'?'#c0392b':'#6c5ce7';x.fillRect(px-7,py-2,14,22);\n  x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=2;x.beginPath();x.moveTo(px-7,py);x.lineTo(px-12,py+12);x.moveTo(px+7,py);x.lineTo(px+12,py+12);x.moveTo(px-7,py+18);x.lineTo(px-11,py+30);x.moveTo(px+7,py+18);x.lineTo(px+11,py+30);x.stroke();\n  if(phase==='win'){x.fillStyle='#f1c40f';x.beginPath();x.arc(px,py-12,7,0,7);x.fill();}}\nc.addEventListener('pointerdown',e=>{e.preventDefault();if(phase==='ready'){pointer=true;startGreen();draw();}\n  else if(phase==='dead'||phase==='win'){resetGame();}\n  else{pointer=true;}});\nc.addEventListener('pointerup',e=>{e.preventDefault();pointer=false;moving=false;});\ndocument.addEventListener('pointerup',e=>{pointer=false;moving=false;});\nconst sndEl=document.getElementById('snd');sndEl.addEventListener('pointerdown',e=>{e.preventDefault();muted=!muted;sndEl.textContent=muted?'🔇':'🔊';});\nstartGreen();\nloop(0);\n\n</script>",
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
    console.error('Error en luzverde:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

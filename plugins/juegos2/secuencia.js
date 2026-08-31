const pluginConfig = {
  name: "secuencia",
  alias: ["musical","notas","memoria"],
  category: "juegos2",
  description: "Secuencia musical: repite la melodía creciente estilo Simón.",
  usage: "..secuencia",
  example: "..secuencia",
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
          botResponseId: "57ba0489-c8b5-4ae2-a5e3-d1677cde1db0",
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
                "response_id": "fd810fb3-bac6-4ec9-98fd-2f8831c169c8",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Secuencia</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">MEJOR</div><div id=\"best\" style=\"font-size:18px;font-weight:bold;color:#fff;text-shadow:0 0 10px rgba(108,92,231,.8)\">0</div></div>\n</div>\n<div style=\"padding:18px\">\n<div id=\"info\" style=\"text-align:center;margin-bottom:12px;font-size:13px;color:rgba(255,255,255,.6)\">Toca INICIAR para comenzar</div>\n<div id=\"round\" style=\"text-align:center;font-size:14px;font-weight:bold;color:#6c5ce7;margin-bottom:14px;display:none\">Ronda: 1</div>\n<canvas id=\"cv\" width=\"360\" height=\"360\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block;touch-action:manipulation\"></canvas>\n<div id=\"status\" style=\"text-align:center;margin-top:10px;font-size:12px;min-height:18px;font-weight:bold;color:#eaeaea\"></div>\n<div id=\"startBtn\" style=\"margin-top:12px;padding:14px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🎵 INICIAR</div>\n<div id=\"restart\" style=\"margin-top:12px;padding:13px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4);display:none\">🔄 REINICIAR</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Repite la melodía • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl secuencia puntos</b></div>\n</div></div></div>\n\n<script>\n(function(){\nvar cv=document.getElementById('cv'),cx=cv.getContext('2d');\nvar info=document.getElementById('info'),roundEl=document.getElementById('round');\nvar statusEl=document.getElementById('status'),startBtn=document.getElementById('startBtn');\nvar restartBtn=document.getElementById('restart'),bestEl=document.getElementById('best');\nvar W=cv.width,H=cv.height;\nvar COLORS=['#e74c3c','#f1c40f','#2ecc71','#3498db'];\nvar LABELS=['Do','Mi','Sol','La'];\nvar FREQS=[261.63,329.63,392.00,440.00];\nvar PAD_R=52;\nvar pads=[\n {x:W/2,y:H/4,c:COLORS[0],label:LABELS[0],glow:0},\n {x:W*3/4,y:H/2,c:COLORS[1],label:LABELS[1],glow:0},\n {x:W/2,y:H*3/4,c:COLORS[2],label:LABELS[2],glow:0},\n {x:W/4,y:H/2,c:COLORS[3],label:LABELS[3],glow:0}\n];\nvar seq=[],round=1,playing=false,over=false,playerIdx=0;\nvar best=0,showingSeq=false,speed=800;\nvar audioCtx=null;\nfunction getAudio(){if(!audioCtx){try{audioCtx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}return audioCtx}\nfunction tone(i,dur){\n try{\n  var a=getAudio();if(!a)return;\n  var o=a.createOscillator(),g=a.createGain();\n  o.type='sine';o.frequency.value=FREQS[i];\n  g.gain.setValueAtTime(0.35,a.currentTime);\n  g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+(dur||0.3)/1000);\n  o.connect(g);g.connect(a.destination);\n  o.start();o.stop(a.currentTime+(dur||300)/1000);\n }catch(e){}\n}\nfunction loadBest(){try{var v=localStorage.getItem('secuencia_best');if(v&&!isNaN(parseInt(v,10)))return parseInt(v,10)}catch(e){}return 0}\nfunction saveBest(v){try{localStorage.setItem('secuencia_best',String(v))}catch(e){}}\nbest=loadBest();bestEl.textContent=best;\nfunction draw(){\n cx.clearRect(0,0,W,H);\n for(var i=0;i<pads.length;i++){\n  var p=pads[i];\n  cx.save();\n  if(p.glow>0){cx.shadowColor=p.c;cx.shadowBlur=20+p.glow*15}\n  cx.fillStyle=p.glow>0?p.c:'rgba(255,255,255,.08)';\n  cx.beginPath();cx.arc(p.x,p.y,PAD_R,0,Math.PI*2);cx.fill();\n  cx.strokeStyle=p.glow>0?'rgba(255,255,255,.5)':'rgba(255,255,255,.2)';\n  cx.lineWidth=2;cx.stroke();\n  cx.fillStyle=p.glow>0?'#fff':'rgba(255,255,255,.55)';\n  cx.font='bold 14px Arial';cx.textAlign='center';cx.textBaseline='middle';\n  cx.fillText(p.label,p.x,p.y);\n  cx.restore();\n  pads[i].glow=Math.max(0,pads[i].glow-0.05);\n }\n}\nfunction addNote(){seq.push(Math.floor(Math.random()*4))}\nfunction showSequence(){\n showingSeq=true;playing=false;playerIdx=0;\n info.textContent='Escucha...';\n statusEl.textContent='';\n var idx=0;\n function next(){\n  if(idx>=seq.length){showingSeq=false;playing=true;info.textContent='Tu turno';return}\n  var pi=seq[idx];\n  pads[pi].glow=1;tone(pi,speed*0.6);\n  setTimeout(function(){pads[pi].glow=0;idx++;setTimeout(next,speed*0.35)},speed*0.6);\n }\n next();\n}\nfunction startGame(){\n seq=[];round=1;over=false;playerIdx=0;playing=false;showingSeq=false;\n addNote();speed=800;\n info.textContent='Ronda 1';roundEl.style.display='block';roundEl.textContent='Ronda: 1';\n statusEl.textContent='Escucha la secuencia...';\n startBtn.style.display='none';restartBtn.style.display='none';\n draw();\n setTimeout(showSequence,600);\n}\nfunction padHit(i){\n if(!playing||over||showingSeq)return;\n tone(i,250);pads[i].glow=1;\n if(i===seq[playerIdx]){\n  playerIdx++;\n  if(playerIdx>=seq.length){\n   playing=false;\n   if(round>=best){best=round;saveBest(best);bestEl.textContent=best}\n   round++;playerIdx=0;addNote();\n   speed=Math.max(300,800-round*40);\n   info.textContent='¡Correcto!';\n   statusEl.textContent='';\n   roundEl.textContent='Ronda: '+round;\n   setTimeout(showSequence,1000);\n  }\n } else {\n  over=true;playing=false;\n  info.textContent='Game Over';\n  statusEl.textContent='Ronda alcanzada: '+(round);\n  restartBtn.style.display='block';startBtn.style.display='none';\n }\n}\nfunction padAt(px,py){\n for(var i=0;i<pads.length;i++){\n  var dx=px-pads[i].x,dy=py-pads[i].y;\n  if(Math.sqrt(dx*dx+dy*dy)<=PAD_R)return i;\n }\n return -1;\n}\ncv.addEventListener('pointerdown',function(e){\n e.preventDefault();\n if(over||showingSeq||!playing)return;\n var r=cv.getBoundingClientRect();\n var px=(e.clientX-r.left)*(W/r.width),py=(e.clientY-r.top)*(H/r.height);\n var idx=padAt(px,py);\n if(idx>=0)padHit(idx);\n});\nstartBtn.addEventListener('pointerdown',function(e){e.preventDefault();startGame()});\nrestartBtn.addEventListener('pointerdown',function(e){e.preventDefault();startGame()});\ndraw();\nwindow._playSeq=function(){showSequence()};\nwindow._tapPad=function(i){padHit(i)};\nwindow._state=function(){return{seq:seq.slice(),round:round,playing:playing,over:over,showingSeq:showingSeq,playerIdx:playerIdx,best:best,speed:speed}};\nwindow._start=function(){startGame()};\nwindow._reset=function(){seq=[];round=1;over=false;playing=false;showingSeq=false;playerIdx=0;speed=800;info.textContent='Toca INICIAR para comenzar';roundEl.style.display='none';statusEl.textContent='';startBtn.style.display='block';restartBtn.style.display='none';draw()};\n})();\n</script>",
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
    console.error('Error en secuencia:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

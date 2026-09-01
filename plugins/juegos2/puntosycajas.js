const pluginConfig = {
  name: "puntosycajas",
  alias: ["cajitas","dots"],
  category: "juegos2",
  description: "Puntos y cajas: 2 jugadores alternan turnos trazando líneas y capturando cajas.",
  usage: "..puntosycajas",
  example: "..puntosycajas",
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
              data: Buffer.from(JSON.stringify({"response_id":"d0cdcee4-58ea-4972-963c-815590a6a34a","sections":[{"view_model":{"primitive":{"__typename":"GenAIaeacdsnwHtmlPrimitive","payload":"<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:520px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12)\">\n<div style=\"display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Puntos y cajas</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">RÉCORD</div><div id=\"best\" style=\"font-size:18px;font-weight:bold;color:#f1c40f;text-shadow:0 0 10px rgba(241,196,15,.6)\">0</div></div>\n</div>\n</div>\n<div style=\"padding:18px\">\n<canvas id=\"board\" width=\"440\" height=\"440\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div id=\"turnRow\" style=\"margin-top:12px;display:flex;justify-content:center;align-items:center;gap:14px\">\n<div id=\"p1\" style=\"padding:8px 16px;border-radius:10px;background:rgba(108,92,231,.25);border:2px solid #6c5ce7;color:#fff;font-size:13px;font-weight:bold;text-align:center\">J1 <span id=\"s1\">0</span></div>\n<div id=\"turnLabel\" style=\"font-size:13px;font-weight:bold;color:#fff;text-align:center;min-width:70px\">Turno</div>\n<div id=\"p2\" style=\"padding:8px 16px;border-radius:10px;background:rgba(230,126,34,.25);border:2px solid #e67e22;color:#fff;font-size:13px;font-weight:bold;text-align:center\">J2 <span id=\"s2\">0</span></div>\n</div>\n<div id=\"reset\" style=\"margin-top:12px;padding:12px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:14px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🔄 REINICIAR</div>\n<div style=\"text-align:center;margin-top:8px;font-size:11px;color:rgba(255,255,255,.4)\">Toca entre dos puntos para trazar una línea. Cierra una caja para capturarla.</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">2 jugadores • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl puntosycajas puntos</b></div>\n</div></div></div>\n\n<script>\n\nfunction sfx(t,v,f,d){try{const a=new(window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.type=t||'square';o.frequency.value=v||440;g.gain.setValueAtTime(0.08,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+(d||0.15));o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+(d||0.15));}catch(e){}}\n\n\n\nconst cv=document.getElementById('board'),x=cv.getContext('2d'),s1El=document.getElementById('s1'),s2El=document.getElementById('s2'),turnLabel=document.getElementById('turnLabel'),bestEl=document.getElementById('best'),resetBtn=document.getElementById('reset');\nconst N=6,W=440,STEP=W/(N-1);\nlet hLines,vLines,boxes,scores,turn,over,best;\nfunction init(){hLines=[];vLines=[];for(let r=0;r<N;r++){hLines.push(new Array(N-1).fill(0));vLines.push(new Array(N-1).fill(0));}vLines.push(new Array(N-1).fill(0));boxes=[];for(let r=0;r<N-1;r++)boxes.push(new Array(N-1).fill(0));scores=[0,0];turn=1;over=false;best=(parseInt(localStorage.getItem('cajas_best')||'0')||0);bestEl.textContent=best;render();updateHUD();}\nfunction full(bx,by){return hLines[bx][by]&&hLines[bx+1][by]&&vLines[bx][by]&&vLines[bx][by+1];}\nfunction tryPlay(br,bc,dir){\n  if(over)return false;\n  let r,c,isH;\n  if(dir==='t'){r=br;c=bc;isH=true;}\n  else if(dir==='b'){r=br+1;c=bc;isH=true;}\n  else if(dir==='l'){r=br;c=bc;isH=false;}\n  else if(dir==='r'){r=br;c=bc+1;isH=false;}\n  else return false;\n  if(isH){if(r<0||r>=N||c<0||c>=N-1)return false;if(hLines[r][c])return false;hLines[r][c]=1;}\n  else{if(r<0||r>=N-1||c<0||c>=N)return false;if(vLines[r][c])return false;vLines[r][c]=1;}\n  let captured=0;\n  if(isH){if(r-1>=0&&boxes[r-1][c]===0&&full(r-1,c)){boxes[r-1][c]=turn;scores[turn-1]++;captured++;sfx(\"sine\",700,0.06);}if(r+1<=N-2&&boxes[r][c]===0&&full(r,c)){boxes[r][c]=turn;scores[turn-1]++;captured++;}}\n  else{if(c-1>=0&&boxes[r][c-1]===0&&full(r,c-1)){boxes[r][c-1]=turn;scores[turn-1]++;captured++;}if(c+1<=N-2&&boxes[r][c]===0&&full(r,c)){boxes[r][c]=turn;scores[turn-1]++;captured++;}}\n  if(captured===0)turn=(turn===1)?2:1;\n  render();updateHUD();checkEnd();\n  return true;\n}\nfunction checkEnd(){if(scores[0]+scores[1]<(N-1)*(N-1))return;over=true;let msg;if(scores[0]>scores[1]){best=Math.max(best,scores[0]);localStorage.setItem('cajas_best',String(best));msg='Jugador 1 gana '+scores[0]+'-'+scores[1];}else if(scores[1]>scores[0]){best=Math.max(best,scores[1]);localStorage.setItem('cajas_best',String(best));msg='Jugador 2 gana '+scores[1]+'-'+scores[0];}else{msg='Empate '+scores[0]+'-'+scores[1];}bestEl.textContent=best;turnLabel.innerHTML='FIN · '+msg;}\nfunction render(){\n  x.clearRect(0,0,W,W);\n  for(let r=0;r<N;r++)for(let c=0;c<N;c++){const cx=c*STEP,cy=r*STEP;x.beginPath();x.arc(cx,cy,4.5,0,Math.PI*2);x.fillStyle='#ffffff';x.fill();x.beginPath();x.arc(cx,cy,4.5,0,Math.PI*2);x.strokeStyle='#6c5ce7';x.lineWidth=2;x.stroke();}\n  for(let r=0;r<N-1;r++)for(let c=0;c<N-1;c++){if(boxes[r][c]){x.fillStyle=boxes[r][c]===1?'rgba(108,92,231,.32)':'rgba(230,126,34,.32)';x.fillRect(c*STEP+6,r*STEP+6,STEP-12,STEP-12);}}\n  for(let r=0;r<N;r++)for(let c=0;c<N-1;c++){if(hLines[r][c]){x.strokeStyle='#4fd1c5';x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(c*STEP,r*STEP);x.lineTo((c+1)*STEP,r*STEP);x.stroke();}}\n  for(let r=0;r<N-1;r++)for(let c=0;c<N;c++){if(vLines[r][c]){x.strokeStyle='#4fd1c5';x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(c*STEP,r*STEP);x.lineTo(c*STEP,(r+1)*STEP);x.stroke();}}\n}\nfunction updateHUD(){s1El.textContent=scores[0];s2El.textContent=scores[1];bestEl.textContent=best;document.getElementById('p1').style.borderColor=(turn===1&&!over)?'#6c5ce7':'rgba(255,255,255,.15)';document.getElementById('p2').style.borderColor=(turn===2&&!over)?'#e67e22':'rgba(255,255,255,.15)';if(!over)turnLabel.textContent='J'+(turn===1?'1':turn===2?'2':'?');turnLabel.style.color='#fff';}\nfunction handleTap(e){if(over)return;e.preventDefault();const rect=cv.getBoundingClientRect();const scale=(rect.width>0)?W/rect.width:1;const px=(e.clientX-(rect.left||0))*scale,py=(e.clientY-(rect.top||0))*scale;const TH=STEP*0.6;let bestD=1e9,bi=-1,bj=-1,dirn='h';\n  for(let r=0;r<N;r++)for(let c=0;c<N-1;c++){const mx=(c+0.5)*STEP,my=r*STEP,d=Math.sqrt((px-mx)*(px-mx)+(py-my)*(py-my));if(d<bestD){bestD=d;bi=r;bj=c;dirn='h';}}\n  for(let r=0;r<N-1;r++)for(let c=0;c<N;c++){const mx=c*STEP,my=(r+0.5)*STEP,d=Math.sqrt((px-mx)*(px-mx)+(py-my)*(py-my));if(d<bestD){bestD=d;bi=r;bj=c;dirn='v';}}\n  if(bestD>TH)return;\n  if(dirn==='h'){if(bi===0)tryPlay(bi,bj,'t');else if(bi===N-1)tryPlay(bi-1,bj,'b');else{tryPlay(bi,bj,'t');tryPlay(bi-1,bj,'b');}}\n  else{if(bj===0)tryPlay(bi,bj,'l');else if(bj===N-1)tryPlay(bi,bj-1,'r');else{tryPlay(bi,bj,'l');tryPlay(bi,bj-1,'r');}}\n}\ntap(cv,handleTap);\nfunction tap(el,fn){const H=e=>{e.preventDefault();if(H.l)return;H.l=1;setTimeout(()=>{H.l=0},120);let ev=e;const t=e.touches;if(e.clientX===undefined&&t&&t[0]){ev={clientX:t[0].clientX,clientY:t[0].clientY,preventDefault:function(){},target:e.target,touches:t};}fn(ev);};el.addEventListener('pointerdown',H);el.addEventListener('touchstart',H,{passive:false});}\ntap(resetBtn,()=>{init();});\ninit();\n\n</script>","trusted_sources":["nixel.dev"]},"__typename":"GenAISingleLayoutViewModel"}}]})).toString('base64')
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
    console.error('Error en puntosycajas:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

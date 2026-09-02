const pluginConfig = {
  name: "rasga",
  alias: ["raspaygana","scratch","raspadito"],
  category: "game",
  description: "Rasca y gana: revela los premios ocultos.",
  usage: "..rasga",
  example: "..rasga",
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
              data: Buffer.from(JSON.stringify({"response_id":"4a6b32a1-b27a-4cd8-ac85-4dd4df0d0ab5","sections":[{"view_model":{"primitive":{"__typename":"GenAIaeacdsnwHtmlPrimitive","payload":"<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:400px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Rasca y Gana</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">MEJOR</div><div id=\"best\" style=\"font-size:18px;font-weight:bold;color:#feca57\">0</div></div>\n</div>\n<div style=\"padding:16px\">\n<div id=\"st\" style=\"text-align:center;font-size:12.5px;color:rgba(255,255,255,.65);margin-bottom:12px;min-height:16px\">🧻 ¡Arrastra tu dedo para raspar!</div>\n<canvas id=\"cv\" width=\"360\" height=\"360\" style=\"display:block;width:100%;height:auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:12px;touch-action:none\"></canvas>\n<div style=\"display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding:10px 14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px\">\n<div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">PREMIO TOTAL</div>\n<div id=\"tot\" style=\"font-size:22px;font-weight:bold;color:#fff;text-shadow:0 0 10px rgba(108,92,231,.8)\">0</div>\n</div>\n<div id=\"report\" style=\"display:none;margin-top:10px;padding:13px;border-radius:12px;background:linear-gradient(135deg,#2ecc71,#27ae60);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(46,204,113,.4)\"></div>\n<div id=\"again\" style=\"margin-top:12px;padding:14px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🔁 NUEVO CARTÓN</div>\n<div style=\"text-align:center;margin-top:10px;font-size:10px;color:rgba(255,255,255,.35)\">Arrastra para raspar y ganar • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl rasga puntos</b></div>\n</div></div></div>\n\n<script>\nfunction safeLS(){try{return localStorage}catch(e){return{getItem:function(){return null},setItem:function(){},removeItem:function(){}}}}\n\n\nfunction sfx(t,v,f,d){try{const a=new(window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.type=t||'square';o.frequency.value=v||440;g.gain.setValueAtTime(0.08,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+(d||0.15));o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+(d||0.15));}catch(e){}}\n\n\n\nconst cv=document.getElementById('cv'),cx=cv.getContext('2d'),totEl=document.getElementById('tot'),bestEl=document.getElementById('best'),statusEl=document.getElementById('st'),again=document.getElementById('again');\nconst N=3,SIZE=120;\nconst POOL=[{e:'💰',v:2},{e:'💰',v:3},{e:'💰',v:4},{e:'❌',v:0},{e:'❌',v:0},{e:'🎁',v:1},{e:'🎁',v:1},{e:'⭐',v:5},{e:'⭐',v:5}];\nlet cells=[],total=0,done=false,drag=false,need=3;const marks=[];\nlet best=parseInt(safeLS().getItem('rasga_best')||'0',10)||0;\nfunction shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}\nfunction newCard(){sfx('sine',440,0.08);const p=shuffle(POOL.slice());cells=p.map(o=>({e:o.e,v:o.v,scratched:false,hits:0}));total=0;done=false;drag=false;marks.length=0;statusEl.textContent='🧻 ¡Arrastra tu dedo para raspar!';totEl.textContent='0';var rp=document.getElementById('report');if(rp)rp.style.display='none';draw();}\nfunction draw(){cx.clearRect(0,0,360,360);for(let i=0;i<cells.length;i++){const x=(i%N)*SIZE,y=Math.floor(i/N)*SIZE;cx.fillStyle='#b0bec5';cx.fillRect(x+2,y+2,SIZE-4,SIZE-4);cx.lineWidth=3;cx.strokeStyle='rgba(84,110,122,.95)';cx.strokeRect(x+2,y+2,SIZE-4,SIZE-4);cx.fillStyle='rgba(255,255,255,.28)';cx.fillRect(x+2,y+3,SIZE-4,4);cx.font='22px Arial';cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle='rgba(48,63,79,.55)';cx.fillText('✦',x+SIZE/2,y+SIZE/2);if(cells[i].scratched)drawPrize(x,y,i);}}for(let m=marks.length-1;m>=0;m--){cx.globalAlpha=Math.max(0,marks[m].life)*0.7;cx.fillStyle='#fff';cx.beginPath();cx.arc(marks[m].x,marks[m].y,marks[m].r,0,Math.PI*2);cx.fill();marks[m].life-=0.08;if(marks[m].life<=0)marks.splice(m,1);}cx.globalAlpha=1;\nfunction drawPrize(x,y,i){cx.font='48px Arial';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(cells[i].e,x+SIZE/2,y+SIZE/2+2);\nif(cells[i].v>0){cx.font='13px Arial';cx.fillStyle='rgba(255,255,255,.7)';cx.fillText('x'+cells[i].v,x+SIZE/2,y+SIZE/2+26);}}\nfunction scratchCell(i){if(done||!cells[i]||cells[i].scratched)return;const x=(i%N)*SIZE,y=Math.floor(i/N)*SIZE;for(let k=0;k<5;k++){marks.push({x:x+SIZE*(0.2+Math.random()*0.6),y:y+SIZE*(0.2+Math.random()*0.6),r:2+Math.random()*3,life:1});}marks.push({x:x+SIZE/2,y:y+SIZE/2,r:SIZE*0.35,life:1});cells[i].hits++;sfx('sine',300+Math.random()*200,0.05);if(cells[i].hits>=need){cells[i].scratched=true;sfx('sine',500+cells[i].v*100,0.06);total+=cells[i].v;if(total>best){best=total;safeLS().setItem('rasga_best',best);bestEl.textContent=String(best);}totEl.textContent=String(total);if(cells.every(c=>c.scratched)){done=true;sfx(total>0?'sine':'sawtooth',total>0?1047:200,0.2);statusEl.innerHTML=total>0?'🎉 ¡Sumaste <b style=\"color:#feca57\">'+total+'</b> premios!':'😅 Sin premios esta vez...';showReport();if(total>0)confetti();}statusEl.textContent=(need-cells[i].hits<=0)?'':('🧻 '+Math.max(0,need-cells[i].hits)+' raspones más para este premio');}draw();}\nfunction tap(el,fn){const H=e=>{e.preventDefault();if(H.l)return;H.l=1;setTimeout(()=>{H.l=0},120);let ev=e;const t=e.touches;if(e.clientX===undefined&&t&&t[0]){ev={clientX:t[0].clientX,clientY:t[0].clientY,preventDefault:function(){},target:e.target,touches:t};}fn(ev);};el.addEventListener('pointerdown',H);el.addEventListener('touchstart',H,{passive:false});}\nfunction showReport(){const rp=document.getElementById('report');if(!rp)return;const cmd='.rl rasga '+Math.max(0,Math.floor(total));let ok=false;try{const ta=document.createElement('textarea');ta.value=cmd;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();ok=document.execCommand('copy');ta.remove();}catch(e2){}rp.textContent=ok?('✅ Copiado: '+cmd):('Puntaje: '+total+' pts (usa: '+cmd+')');rp.style.display='block';if(ok){rp.style.background='linear-gradient(135deg,#27ae60,#2ecc71)';}}\nfunction scratchAt(clx,cly){const r=cv.getBoundingClientRect();const px=(clx-r.left)*(360/r.width);const py=(cly-r.top)*(360/r.height);const col=Math.floor(px/SIZE),row=Math.floor(py/SIZE);if(!done&&col>=0&&col<N&&row>=0&&row<N)scratchCell(row*N+col);}\nfunction confetti(){const colors=['#ff6b6b','#feca57','#2ecc71','#6c5ce7','#00d2d3','#fd79a8'];for(let i=0;i<60;i++){const d=document.createElement('div');d.style.cssText='position:fixed;left:'+(Math.random()*100)+'vw;top:-10px;width:'+(6+Math.random()*6)+'px;height:'+(10+Math.random()*8)+'px;background:'+colors[i%colors.length]+';z-index:999;pointer-events:none;opacity:0.95;border-radius:2px';document.body.appendChild(d);const dur=2000+Math.random()*2000;d.animate([{transform:'translateY(0) rotate(0deg)'},{transform:'translateY('+(window.innerHeight+30)+'px) rotate('+(360+Math.random()*360)+'deg)'}],{duration:dur,iterations:1});setTimeout(()=>d.remove(),dur);}}\nfunction setup(){bestEl.textContent=String(best);newCard();tap(again,()=>{newCard();});tap(cv,e=>{e.preventDefault();drag=true;scratchAt(e.clientX,e.clientY);});cv.addEventListener('pointermove',e=>{if(drag){e.preventDefault();scratchAt(e.clientX,e.clientY);}});cv.addEventListener('touchmove',e=>{if(drag){e.preventDefault();scratchAt(e.touches[0].clientX,e.touches[0].clientY);}},{passive:false});cv.addEventListener('pointerup',()=>{drag=false;});cv.addEventListener('touchend',()=>{drag=false;});cv.addEventListener('pointercancel',()=>{drag=false;});cv.addEventListener('touchcancel',()=>{drag=false;});}\nsetup();\n\n</script>","trusted_sources":["nixel.dev"]},"__typename":"GenAISingleLayoutViewModel"}}]})).toString('base64')
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
    console.error('Error en rasga:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

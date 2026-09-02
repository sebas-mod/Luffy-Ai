const pluginConfig = {
  name: "flappy",
  alias: ["flappybird","pajaro"],
  category: "game",
  description: "Juego Flappy Bird con toques.",
  usage: "..flappy",
  example: "..flappy",
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
              data: Buffer.from(JSON.stringify({"response_id":"823a398e-c791-46e3-a511-862849a0b44e","sections":[{"view_model":{"primitive":{"__typename":"GenAIaeacdsnwHtmlPrimitive","payload":"<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Flappy</div></div>\n<div style=\"text-align:right\"><div id=\"score\" style=\"font-size:18px;font-weight:bold;color:#fff;text-shadow:0 0 10px rgba(108,92,231,.85);transition:transform .15s\">0</div><div id=\"best\" style=\"font-size:10px;color:rgba(255,255,255,.4);margin-top:2px\">MEJOR 0</div></div>\n</div>\n<div style=\"padding:18px\">\n<canvas id=\"game\" width=\"320\" height=\"480\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div style=\"display:flex;gap:8px;margin-top:10px\">\n<div id=\"themeBtn\" style=\"flex:1;padding:10px;border-radius:10px;background:rgba(108,92,231,.2);border:1px solid rgba(108,92,231,.5);color:#fff;font-weight:bold;font-size:12px;text-align:center\">🎨 TEMA: Clásico</div>\n</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Toca para volar • Credits: yosoyyo</div>\n</div></div></div>\n\n<script>\n\nfunction sfx(t,v,f,d){try{const a=new(window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.type=t||'square';o.frequency.value=v||440;g.gain.setValueAtTime(0.08,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+(d||0.15));o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+(d||0.15));}catch(e){}}\n\n\n\nconst c=document.getElementById('game'),x=c.getContext('2d'),scoreEl=document.getElementById('score'),bestEl=document.getElementById('best'),themeBtn=document.getElementById('themeBtn');\nconst W=c.width,H=c.height;\nconst BX=Math.round(W*.25),GRAV=.45,FLAP=-8.5,R=14,PW=58,GAPH=145,SPEED=2.2,SPACING=150;\nlet d={x:BX,y:H/2,vy:0},ps=[],score=0,best=0,state='ready',last=0,tick=0;const THEMES=[{n:'Clásico',bird:'#ffd54f',wing:'#e67e22',pipe:'#2ecc71',pipeEdge:'#55efc4',bg:'#3498db',ground:'rgba(46,204,113,.9)'},{n:'Noche',bird:'#a29bfe',wing:'#6c5ce7',pipe:'#57606f',pipeEdge:'#8395a7',bg:'#2d3436',ground:'rgba(52,73,94,.9)'},{n:'Océano',bird:'#00d2d3',wing:'#0abde3',pipe:'#0984e3',pipeEdge:'#74b9ff',bg:'#00a8ff',ground:'rgba(9,132,227,.9)'},{n:'Neón',bird:'#fd79a8',wing:'#e84393',pipe:'#f9ca24',pipeEdge:'#ffeaa7',bg:'#2c3e50',ground:'rgba(108,92,231,.9)'}];let theme=0;\nfunction loadBest(){let vals=[];try{let v=localStorage.getItem('flappy_best');if(v)vals.push(parseInt(v,10))}catch(e){}try{let v=sessionStorage.getItem('flappy_best');if(v)vals.push(parseInt(v,10))}catch(e){}return vals.length?Math.max(...vals.filter(v=>!isNaN(v))):0;}\nfunction saveBest(v){let val=String(Math.floor(v));try{localStorage.setItem('flappy_best',val)}catch(e){}try{sessionStorage.setItem('flappy_best',val)}catch(e){}}\nbest=loadBest();\nfunction tap(el,fn){const H=e=>{e.preventDefault();if(H.l)return;H.l=1;setTimeout(()=>{H.l=0},120);fn.call(el,e);};el.addEventListener('pointerdown',H);el.addEventListener('touchstart',H,{passive:false});}\n\n\n\nfunction spawnPipe(){const minT=40,maxT=H-40-GAPH;const roll=Math.random();let wGap=GAPH;if(roll<0.18)wGap=GAPH-40;else if(roll<0.3)wGap=GAPH+35;let pw=PW;if(roll<0.12)pw=PW+25;else if(roll>=0.3&&roll<0.4)pw=PW-18;ps.push({x:W,gapY:minT+Math.random()*(maxT-minT),gapH:wGap,pw:pw,scored:false});}\nfunction maybeSpawn(){const last=ps.length?ps[ps.length-1]:null;if(!last||last.x<=W-SPACING)spawnPipe();}\nfunction cycleTheme(){theme=(theme+1)%THEMES.length;themeBtn.textContent='🎨 TEMA: '+THEMES[theme].n;sfx('sine',400+theme*150,0.1);}\nfunction startRun(){d={x:BX,y:H/2,vy:0};ps=[];score=0;maybeSpawn();state='play';hud();}\nfunction flap(){if(state!=='play')return;sfx('sine',600,0.06);d.vy=FLAP;}\nfunction flapBird(){if(state==='ready'||state==='over')startRun();else flap();}\nfunction circleRect(cx,cy,cr,r){const nx=Math.max(r.x,Math.min(cx,r.x+r.w)),ny=Math.max(r.y,Math.min(cy,r.y+r.h));const dx=cx-nx,dy=cy-ny;return dx*dx+dy*dy<=cr*cr;}\nfunction collide(){if(d.y-R<=0)return true;if(d.y+R>=H)return true;for(const p of ps){const pw=p.pw||PW;if(circleRect(d.x,d.y,R,{x:p.x,y:0,w:pw,h:p.gapY}))return true;if(circleRect(d.x,d.y,R,{x:p.x,y:p.gapY+p.gapH,w:pw,h:H-(p.gapY+p.gapH)}))return true;}return false;}\nfunction hud(){scoreEl.textContent=String(score);bestEl.textContent='MEJOR '+String(best);}\nfunction draw(){\nx.clearRect(0,0,W,H);\nconst th=THEMES[theme];x.fillStyle=th.pipe;\nfor(const p of ps){\nconst pw=p.pw||PW;\nx.fillRect(p.x,0,pw,p.gapY);\nx.fillRect(p.x,p.gapY+p.gapH,pw,H-(p.gapY+p.gapH));\nx.fillStyle=th.pipeEdge;\nx.fillRect(p.x-5,p.gapY-24,pw+10,24);\nx.fillRect(p.x-5,p.gapY+p.gapH,pw+10,24);\nx.fillStyle=th.pipe;\n}\nx.fillStyle='rgba(255,255,255,.07)';\nx.fillRect(0,H-5,W,5);\nx.save();\nlet ang=Math.max(-.5,Math.min(1.4,(d.vy||0)*.09));\nx.translate(d.x,d.y);x.rotate(ang);x.translate(-d.x,-d.y);\nx.fillStyle=th.bird;\nx.beginPath();x.arc(d.x,d.y,R,0,Math.PI*2);x.fill();\nx.fillStyle='#fff';\nx.beginPath();x.arc(d.x+R*.4,d.y-R*.3,R*.26,0,Math.PI*2);x.fill();\nx.fillStyle='#222';\nx.beginPath();x.arc(d.x+R*.5,d.y-R*.3,R*.12,0,Math.PI*2);x.fill();\nx.fillStyle=th.wing;\nx.beginPath();x.moveTo(d.x+R,d.y);x.lineTo(d.x+R+10,d.y-4);x.lineTo(d.x+R,d.y+3);x.closePath();x.fill();\nx.restore();\nif(state==='ready'){\nx.fillStyle='rgba(12,12,20,.45)';x.fillRect(0,0,W,H);\nx.textAlign='center';\nx.font='bold 22px Arial';x.fillStyle='#fff';\nx.fillText('🐤 Flappy',W/2,H/2-45);\nx.font='16px Arial';x.fillStyle='rgba(255,255,255,.95)';\nx.fillText('Toca para empezar',W/2,H/2);\nx.font='13px Arial';x.fillStyle='rgba(108,92,231,.95)';\nx.fillText('Mejor: '+best,W/2,H/2+42);\n}\nif(state==='over'){\nx.fillStyle='rgba(12,12,20,.6)';x.fillRect(0,0,W,H);\nx.textAlign='center';\nx.font='bold 21px Arial';x.fillStyle='#e74c3c';\nx.fillText('💀 ¡Perdiste! Puntaje: '+score,W/2,H/2-34);\nx.font='13px Arial';x.fillStyle='rgba(255,255,255,.8)';\nx.fillText('Toca para reiniciar',W/2,H/2+4);\nx.font='12px Arial';x.fillStyle='rgba(255,255,255,.55)';\nx.fillText('Mejor: '+best,W/2,H/2+32);\n}\nx.textAlign='left';\n}\nfunction update(dt){\ntick+=dt;\nif(state==='ready'){d.y=H/2+Math.sin(tick*.06)*6;draw();return;}\nif(state==='over'){draw();return;}\nd.vy+=GRAV*dt;d.y+=d.vy*dt;\nmaybeSpawn();\nfor(const p of ps)p.x-=SPEED*dt;\nps=ps.filter(p=>p.x+PW>-10);\nfor(const p of ps){if(!p.scored&&d.x-R>p.x+PW){p.scored=true;score++;sfx('sine',880,0.1);if(score>best){best=score;saveBest(score);}scoreEl.style.transform='scale(1.3)';setTimeout(()=>scoreEl.style.transform='scale(1)',120);}}\nif(collide()){sfx('sawtooth',200,0.25);state='over';if(score>best){best=score;saveBest(score);};}\nhud();draw();\n}\nfunction loop(t){if(!last)last=t;let dt=Math.min((t-last)/16.67,2);last=t;update(dt);requestAnimationFrame(loop);}\ntap(themeBtn,()=>{cycleTheme();});\ntap(document,e=>{e.preventDefault();flapBird();});\ndocument.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();flapBird();}});\nrequestAnimationFrame(loop);\n\n</script>","trusted_sources":["nixel.dev"]},"__typename":"GenAISingleLayoutViewModel"}}]})).toString('base64')
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
    console.error('Error en flappy:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

const pluginConfig = {
  name: "moneda",
  alias: ["caracruz","cara","coincasa"],
  category: "juegos2",
  description: "Cara o cruz: lanza la moneda y apuesta.",
  usage: "..moneda",
  example: "..moneda",
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
              data: Buffer.from(JSON.stringify({"response_id":"4e52a84e-0400-46ff-8f7c-d56d135dec2d","sections":[{"view_model":{"primitive":{"__typename":"GenAIaeacdsnwHtmlPrimitive","payload":"<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Cara o Cruz</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">SALDO</div><div id=\"saldo\" style=\"font-size:18px;font-weight:bold;color:#f1c40f;text-shadow:0 0 10px rgba(241,196,15,.6)\">100</div></div>\n</div>\n<div style=\"padding:18px\">\n<canvas id=\"coin\" width=\"280\" height=\"280\" style=\"width:100%;max-width:280px;height:auto;margin:0 auto;display:block;background:transparent;touch-action:manipulation\"></canvas>\n<div style=\"display:flex;justify-content:space-between;gap:10px;margin-top:10px\">\n<div style=\"flex:1;text-align:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 6px\"><div style=\"font-size:10px;letter-spacing:1px;color:rgba(255,255,255,.45)\">RACHA</div><div id=\"racha\" style=\"font-size:20px;font-weight:bold;color:#2ecc71\">0</div></div>\n<div style=\"flex:1;text-align:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 6px\"><div style=\"font-size:10px;letter-spacing:1px;color:rgba(255,255,255,.45)\">MEJOR</div><div id=\"best\" style=\"font-size:20px;font-weight:bold;color:#6c5ce7;text-shadow:0 0 10px rgba(108,92,231,.7)\">0</div></div>\n</div>\n<div style=\"display:flex;gap:10px;margin-top:12px\">\n<div id=\"btnC\" data-s=\"CARA\" style=\"flex:1;padding:13px;border-radius:12px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);color:#eaeaea;font-weight:bold;font-size:15px;text-align:center\">CARA</div>\n<div id=\"btnX\" data-s=\"CRUZ\" style=\"flex:1;padding:13px;border-radius:12px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);color:#eaeaea;font-weight:bold;font-size:15px;text-align:center\">CRUZ</div>\n</div>\n<div id=\"lanzar\" style=\"margin-top:10px;padding:14px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🪙 LANZAR</div>\n<div id=\"msg\" style=\"text-align:center;margin-top:10px;font-size:13px;font-weight:bold;color:rgba(255,255,255,.8);min-height:18px\">Elige CARA o CRUZ y lanza</div>\n<div style=\"text-align:center;margin-top:8px;font-size:12px;color:rgba(255,255,255,.5)\"><span id=\"reset\" style=\"color:#6c5ce7;font-weight:bold;border-bottom:1px solid rgba(108,92,231,.5);padding-bottom:1px\">🔄 Reiniciar</span></div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Adivina de qué lado cae • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl moneda puntos</b></div>\n</div></div></div>\n\n<script>\n\nfunction sfx(t,v,f,d){try{const a=new(window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.type=t||'square';o.frequency.value=v||440;g.gain.setValueAtTime(0.08,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+(d||0.15));o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+(d||0.15));}catch(e){}}\n\n\n\nvar cv=document.getElementById('coin'),ctx=cv.getContext('2d'),saldoEl=document.getElementById('saldo'),rachaEl=document.getElementById('racha'),bestEl=document.getElementById('best'),msgEl=document.getElementById('msg');\nvar btnC=document.getElementById('btnC'),btnX=document.getElementById('btnX'),lanzar=document.getElementById('lanzar'),resetEl=document.getElementById('reset');\nvar W=280,H=280,CX=140,CY=140,R=88;\nvar stake=10,bet='',saldo=100,racha=0,best=0,result='',lastWin=false,_fx='';\nvar face='CARA',spin=0,targetSpin=0,v=0,spinning=false;\ntry{var ls=parseInt(localStorage.getItem('moneda_best'),10);if(!isNaN(ls)&&ls>0)best=ls;}catch(e){}\nsaldoEl.textContent=String(saldo);rachaEl.textContent='0';bestEl.textContent=String(best);\nfunction pick(s){bet=s;btnC.style.borderColor=btnC.style.background=btnX.style.borderColor=btnX.style.background='';msgEl.textContent='Tu apuesta: '+s+' • Dale a 🪙 LANZAR';if(s==='CARA'){btnC.style.border='2px solid #f1c40f';btnC.style.background='rgba(241,196,15,.22)';}else{btnX.style.border='2px solid #f1c40f';btnX.style.background='rgba(241,196,15,.22)';}}\nfunction flip(){\nif(spinning)return;\nif(!bet){msgEl.textContent='Primero elige CARA o CRUZ';return;}\nif(saldo<stake){msgEl.innerHTML='<span style=\"color:#e74c3c\">Sin saldo. Toca 🔄 Reiniciar</span>';return;}\nspinning=true;\nresult=_fx||(Math.random()<0.5?'CARA':'CRUZ');\n_fx='';\nlastWin=(result===bet);sfx(lastWin?\"sine\":\"sawtooth\",lastWin?880:200,0.15);\nif(lastWin){saldo+=20;racha++;}else{saldo-=10;racha=0;}\nif(saldo>best){best=saldo;}\nsaldoEl.textContent=String(saldo);rachaEl.textContent=String(racha);bestEl.textContent=String(best);\ntry{localStorage.setItem('moneda_best',String(best));}catch(e){}\nmsgEl.innerHTML=lastWin?'<span style=\"color:#2ecc71\">🎉 ¡Ganaste! Cayó '+result+' • +$20</span>':'<span style=\"color:#e74c3c\">😵 Perdiste. Cayó '+result+' • -$10</span>';\nface=result;\ntargetSpin=Math.floor(spin/Math.PI)*Math.PI+Math.PI*13;\nv=Math.abs(targetSpin-spin)/26+0.8;\nrender();\n}\nfunction reset(){saldo=100;racha=0;bet='';btnC.style.borderColor=btnX.style.borderColor='';btnC.style.background=btnX.style.background='';saldoEl.textContent='100';rachaEl.textContent='0';msgEl.innerHTML='<span style=\"color:#eaeaea\">Saldo reiniciado a 100 • Elige CARA o CRUZ</span>';}\nfunction render(){\nctx.clearRect(0,0,W,H);\nvar s=Math.abs(Math.cos(spin)),esc=0.14+0.86*s;\nctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(CX,CY,R+5,R*esc+4,0,0,Math.PI*2);ctx.fill();\nctx.fillStyle='#f1c40f';ctx.beginPath();ctx.ellipse(CX,CY,R,R*esc,0,0,Math.PI*2);ctx.fill();\nctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(CX,CY,R,R*esc,0,0,Math.PI*2);ctx.stroke();\nctx.fillStyle='#d4ac0d';ctx.beginPath();ctx.ellipse(CX,CY,R-10,R*esc,0,0,Math.PI*2);ctx.fill();\nctx.strokeStyle='#b8860b';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(CX,CY,R-18,R*esc,0,0,Math.PI*2);ctx.stroke();\nctx.fillStyle='#5d4a00';ctx.font='bold 34px Arial';ctx.textAlign='center';ctx.textBaseline='middle';\nctx.fillText(face!=='CARA'?'☺':'♦',CX,CY-14);\nctx.fillStyle='#3d3200';ctx.font='bold 15px Arial';\nctx.fillText(face,CX,CY+20);\n}\nfunction _settle(){spin=targetSpin;spinning=false;render();}\nfunction loop(){if(spinning){spin+=v;v*=0.982;if(spin>=targetSpin)_settle();}render();requestAnimationFrame(loop);}\nfunction tap(el,fn){var H=function(e){e.preventDefault();if(H.l)return;H.l=1;setTimeout(function(){H.l=0},120);fn(e);};el.addEventListener('pointerdown',H);el.addEventListener('touchstart',H,{passive:false});}\ntap(btnC,function(){pick('CARA');});\ntap(btnX,function(){pick('CRUZ');});\ntap(lanzar,function(){flip();});\ntap(resetEl,function(){reset();});\nif(document.addEventListener){document.addEventListener('keydown',function(e){var k=(e.key||'').toUpperCase();if(spinning)return;if(k==='C'||k==='1')pick('CARA');else if(k==='X'||k==='2')pick('CRUZ');else if(k===' '||k==='ENTER'||k==='L')flip();else if(k==='R')reset();});}\nloop();\n\n</script>","trusted_sources":["nixel.dev"]},"__typename":"GenAISingleLayoutViewModel"}}]})).toString('base64')
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
    console.error('Error en moneda:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

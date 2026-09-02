const pluginConfig = {
  name: "2048",
  alias: ["_2048","dosmilcuarentaiocho","juego2048"],
  category: "game",
  description: "Juego 2048: une los números.",
  usage: "..2048",
  example: "..2048",
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
              data: Buffer.from(JSON.stringify({"response_id":"c1d8deac-4a1b-4871-aa9a-f52eed27dfce","sections":[{"view_model":{"primitive":{"__typename":"GenAIaeacdsnwHtmlPrimitive","payload":"<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">2048</div></div>\n<div style=\"display:flex;gap:8px;text-align:center\">\n<div style=\"background:rgba(255,255,255,.08);border-radius:10px;padding:6px 12px;min-width:64px\"><div style=\"font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.5)\">PUNTOS</div><div id=\"score\" style=\"font-size:16px;font-weight:bold;color:#fff\">0</div></div>\n<div style=\"background:rgba(255,255,255,.08);border-radius:10px;padding:6px 12px;min-width:64px\"><div style=\"font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.5)\">RÉCORD</div><div id=\"best\" style=\"font-size:16px;font-weight:bold;color:#fff\">0</div></div>\n</div>\n</div>\n<div style=\"padding:18px\">\n<div style=\"position:relative;max-width:400px;margin:auto\">\n<canvas id=\"g\" width=\"400\" height=\"400\" style=\"width:100%;height:auto;display:block;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;touch-action:none\"></canvas>\n<div id=\"ov\" style=\"position:absolute;inset:4px;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.5);text-align:center;padding:16px\">\n<div style=\"font-size:20px;font-weight:bold;color:#fff\">2048</div>\n<div style=\"font-size:12px;margin-top:6px;color:rgba(255,255,255,.75)\">Toca para empezar</div>\n</div>\n</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Desliza para mover • Credits: yosoyyo</div>\n</div></div></div>\n\n<script>\n\nfunction sfx(t,v,f,d){try{const a=new(window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.type=t||'square';o.frequency.value=v||440;g.gain.setValueAtTime(0.08,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+(d||0.15));o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+(d||0.15));}catch(e){}}\n\n\n\nconst cv=document.getElementById('g'),x=cv.getContext('2d'),sc=document.getElementById('score'),be=document.getElementById('best'),ov=document.getElementById('ov');\nconst SIZE=4,CANV=400,PAD=8,GAP=8,CELL=(CANV-2*PAD-3*GAP)/SIZE;\nconst COLS={2:['#eee4da','#776e65'],4:['#ede0c8','#776e65'],8:['#f2b179','#f9f6f2'],16:['#f59563','#f9f6f2'],32:['#f67c5f','#f9f6f2'],64:['#f65e3b','#f9f6f2'],128:['#edcf72','#f9f6f2'],256:['#edcc61','#f9f6f2'],512:['#edc850','#f9f6f2'],1024:['#edc53f','#f9f6f2'],2048:['#edc22e','#f9f6f2'],more:['#3c3a32','#f9f6f2']};\nlet grid=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],score=0,best=0,won=false,over=false,ovMode='start';\nlet sx=0,sy=0,dragging=false;\nfunction makeGrid(){ return [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]; }\nfunction emptyCells(){ const e=[]; for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(grid[r][c]===0)e.push([r,c]); return e; }\nfunction spawn(){ const e=emptyCells(); if(!e.length)return false; const p=e[Math.floor(Math.random()*e.length)]; grid[p[0]][p[1]]=Math.random()<0.9?2:4; return true; }\nfunction countTiles(){ let n=0; for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(grid[r][c])n++; return n; }\nfunction getScore(){ return score; }\nfunction getBest(){ return best; }\nfunction setGrid(a){ grid=a.map(r=>r.slice()); }\nfunction getGrid(){ return grid.map(r=>r.slice()); }\nfunction slideLine(arr){ const nz=[]; for(let i=0;i<arr.length;i++)if(arr[i]!==0)nz.push(arr[i]); const res=[]; let gain=0; for(let i=0;i<nz.length;i++){ if(i+1<nz.length&&nz[i]===nz[i+1]){ res.push(nz[i]*2); gain+=nz[i]*2; i++; } else res.push(nz[i]); } while(res.length<SIZE)res.push(0); return {line:res,gain}; }\nfunction linesEqual(a,b){ for(let i=0;i<SIZE;i++)if(a[i]!==b[i])return false; return true; }\nfunction canMove(){ for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){ if(grid[r][c]===0)return true; if(c+1<SIZE&&grid[r][c]===grid[r][c+1])return true; if(r+1<SIZE&&grid[r][c]===grid[r+1][c])return true; } return false; }\nfunction hasWon(){ for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(grid[r][c]===2048)return true; return false; }\nfunction save(){ try{ if(typeof localStorage!=='undefined')localStorage.setItem('t2048_best',String(best)); }catch(e){} }\nfunction load(){ try{ if(typeof localStorage!=='undefined'){ const v=parseInt(localStorage.getItem('t2048_best'),10); if(!isNaN(v)&&v>0)best=v; } }catch(e){} }\nfunction updateHUD(){ sc.textContent=score; be.textContent=best; }\nfunction hideOv(){ ov.style.display='none'; ovMode='none'; }\nfunction showOv(){ ov.style.display='flex'; }\nfunction resetGame(){ grid=makeGrid(); score=0; won=false; over=false; spawn(); spawn(); }\nfunction start(){ load(); resetGame(); updateHUD(); hideOv(); ; draw(); }\nfunction showWin(){ ov.innerHTML='<div style=font-size:20px;font-weight:bold;color:#ffd700>🎉 ¡2048!</div><div style=font-size:12px;margin-top:6px;color:rgba(255,255,255,.75)>Toca para seguir jugando</div>'; ovMode='win'; showOv(); ; }\nfunction showOver(){ ov.innerHTML='<div style=font-size:20px;font-weight:bold;color:#e74c3c>💀 Sin movimientos</div><div style=font-size:12px;margin-top:6px;color:rgba(255,255,255,.75)>Toca para reiniciar</div>'; ovMode='over'; showOv(); ; }\nfunction checkGameOver(){ if(countTiles()===SIZE*SIZE&&!canMove()){ over=true; showOver(); } }\nfunction move(dir){sfx(\"sine\",300,0.06);\n  if(over)return false;\n  let moved=false,gain=0;\n  if(dir==='left'||dir==='right'){\n    for(let r=0;r<SIZE;r++){ const row=[]; for(let c=0;c<SIZE;c++)row.push(grid[r][c]); const src=dir==='left'?row:row.slice().reverse(); const res=slideLine(src); const out=dir==='left'?res.line:res.line.slice().reverse(); if(!linesEqual(row,out)){ moved=true; for(let c=0;c<SIZE;c++)grid[r][c]=out[c]; gain+=res.gain; } }\n  } else if(dir==='up'||dir==='down'){\n    for(let c=0;c<SIZE;c++){ const col=[]; for(let r=0;r<SIZE;r++)col.push(grid[r][c]); const src=dir==='up'?col:col.slice().reverse(); const res=slideLine(src); const out=dir==='up'?res.line:res.line.slice().reverse(); if(!linesEqual(col,out)){ moved=true; for(let r=0;r<SIZE;r++)grid[r][c]=out[r]; gain+=res.gain; } }\n  } else return false;\n  if(moved){ score+=gain; if(score>best){best=score;save();} spawn(); if(!won&&hasWon()){won=true;showWin();} checkGameOver(); updateHUD(); draw(); }\n  return moved;\n}\nfunction rr(xx,yy,ww,hh,rrr){ x.beginPath(); x.moveTo(xx+rrr,yy); x.lineTo(xx+ww-rrr,yy); x.arcTo(xx+ww,yy,xx+ww,yy+rrr,rrr); x.lineTo(xx+ww,yy+hh-rrr); x.arcTo(xx+ww,yy+hh,xx+ww-rrr,yy+hh,rrr); x.lineTo(xx+rrr,yy+hh); x.arcTo(xx,yy+hh,xx,yy+hh-rrr,rrr); x.lineTo(xx,yy+rrr); x.arcTo(xx,yy,xx+rrr,yy,rrr); x.closePath(); }\nfunction fz(v){ const n=String(v).length; return n>=5?14:(n===4?17:(n===3?22:(n===2?28:34))); }\nfunction draw(){\n  x.clearRect(0,0,CANV,CANV);\n  rr(4,4,CANV-8,CANV-8,12); x.fillStyle='rgba(255,255,255,.05)'; x.fill();\n  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){\n    const v=grid[r][c],px=PAD+c*(CELL+GAP),py=PAD+r*(CELL+GAP);\n    rr(px,py,CELL,CELL,10);\n    if(v===0){ x.fillStyle='rgba(255,255,255,.04)'; x.fill(); }\n    else { const col=COLS[v]||COLS.more; x.fillStyle=col[0]; x.fill(); x.fillStyle=col[1]; x.font='bold '+fz(v)+'px Arial'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(String(v),px+CELL/2,py+CELL/2+1); }\n  }\n}\nfunction dirFromSwipe(dx,dy){ const ax=Math.abs(dx),ay=Math.abs(dy); if(Math.max(ax,ay)<20)return null; return ax>ay?(dx>0?'right':'left'):(dy>0?'down':'up'); }\nfunction loop(){ draw(); requestAnimationFrame(loop); }\ntap(cv,e=>{ e.preventDefault(); sx=e.clientX||0; sy=e.clientY||0; dragging=true; });\ncv.addEventListener('pointermove',e=>{ if(dragging)e.preventDefault(); });\ncv.addEventListener('pointerup',e=>{ if(!dragging)return; dragging=false; const d=dirFromSwipe((e.clientX||0)-sx,(e.clientY||0)-sy); if(d)move(d); });\ncv.addEventListener('pointercancel',()=>{ dragging=false; });\nfunction tap(el,fn){const H=e=>{e.preventDefault();if(H.l)return;H.l=1;setTimeout(()=>{H.l=0},120);let ev=e;const t=e.touches;if(e.clientX===undefined&&t&&t[0]){ev={clientX:t[0].clientX,clientY:t[0].clientY,preventDefault:function(){},target:e.target,touches:t};}fn(ev);};el.addEventListener('pointerdown',H);el.addEventListener('touchstart',H,{passive:false});}\nfunction ovTap(){ if(ovMode==='start'||ovMode==='over'){ start(); } else if(ovMode==='win'){ hideOv(); } }\ntap(ov,ovTap);\nconst handleKey=(e)=>{ const map={'ArrowLeft':'left','ArrowRight':'right','ArrowUp':'up','ArrowDown':'down'}; const d=map[e.key]; if(d){ e.preventDefault(); move(d); } };\nif(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('keydown',handleKey);\nloop();\n\n</script>","trusted_sources":["nixel.dev"]},"__typename":"GenAISingleLayoutViewModel"}}]})).toString('base64')
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
    console.error('Error en _2048:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

const pluginConfig = {
  name: "buscaminas",
  alias: ["minas","minesweeper"],
  category: "juegos2",
  description: "Buscaminas con 3 niveles.",
  usage: "..buscaminas",
  example: "..buscaminas",
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
                "response_id": "e3d016a5-3f08-4065-b910-06b7b7b6c24e",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:440px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12)\">\n<div style=\"display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Buscaminas</div></div>\n<div style=\"font-size:22px\">💣</div>\n</div>\n</div>\n<div style=\"padding:18px\">\n<div id=\"menu\">\n<div style=\"text-align:center;font-size:13px;font-weight:bold;color:#fff;margin-bottom:12px\">Elige la dificultad</div>\n<div id=\"lvlBtns\" style=\"display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:10px\"></div>\n<div id=\"lvlInfo\" style=\"text-align:center;font-size:12px;color:rgba(255,255,255,.55);margin-bottom:16px\"></div>\n<div id=\"goBtn\" style=\"padding:14px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🚀 JUGAR</div>\n</div>\n<div id=\"game\" style=\"display:none\">\n<div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:8px\">\n<div style=\"font-size:13px;color:rgba(255,255,255,.55)\">💣 <span id=\"mines\">0</span></div>\n<div style=\"font-size:13px;color:rgba(255,255,255,.55)\">⏱ <span id=\"time\">0</span></div>\n</div>\n<div style=\"position:relative\">\n<canvas id=\"board\" width=\"400\" height=\"400\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div id=\"ov\" style=\"display:none;position:absolute;left:0;top:0;right:0;bottom:0;border-radius:12px;align-items:center;justify-content:center;flex-direction:column;text-align:center\">\n<div id=\"ovTitle\" style=\"font-size:26px;font-weight:bold;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.5)\"></div>\n<div id=\"ovSub\" style=\"font-size:12px;color:rgba(255,255,255,.85);margin-top:6px;padding:0 10px\">Toca para reintentar</div>\n</div>\n</div>\n<div id=\"flagBtn\" style=\"margin-top:10px;padding:10px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:13px;text-align:center\">🚩 Modo bandera: OFF</div>\n<div style=\"text-align:center;margin-top:6px;font-size:11px;color:rgba(255,255,255,.4)\">Toca para revelar • Toca el resultado para reiniciar</div>\n</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Toca para revelar • Credits: yosoyyo</div>\n</div></div></div>\n\n<script>\n\nconst cv=document.getElementById('board'),x=cv.getContext('2d'),menu=document.getElementById('menu'),game=document.getElementById('game'),lvlBtns=document.getElementById('lvlBtns'),lvlInfo=document.getElementById('lvlInfo'),goBtn=document.getElementById('goBtn'),minesEl=document.getElementById('mines'),timeEl=document.getElementById('time'),ov=document.getElementById('ov'),ovTitle=document.getElementById('ovTitle'),ovSub=document.getElementById('ovSub'),flagBtn=document.getElementById('flagBtn');\nconst W=400;\nconst LVLS={facil:{n:8,m:10,label:'FÁCIL',info:'8×8 · 10 minas'},medio:{n:12,m:20,label:'MEDIO',info:'12×12 · 20 minas'},dificil:{n:16,m:40,label:'DIFÍCIL',info:'16×16 · 40 minas'}};\nconst COLORS=['','rgba(91,155,255,1)','rgba(61,220,132,1)','rgba(255,91,91,1)','rgba(199,125,255,1)','rgba(255,184,107,1)','rgba(77,227,227,1)','rgba(255,77,191,1)','rgba(160,160,160,1)'];\nlet S=null,lvlKey='facil',flagMode=false,timer=null,sec=0;\nlet lvlBList=[];\nfunction clue(r,c){let k=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if(rr>=0&&cc>=0&&rr<S.n&&cc<S.n&&S.mine[rr][cc])k++;}return k;}\nfunction openCell(r,c){if(r<0||c<0||r>=S.n||c>=S.n)return;if(S.open[r][c]||S.mine[r][c])return;S.open[r][c]=true;S.revealed++;if(clue(r,c)===0){for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(dr===0&&dc===0)continue;openCell(r+dr,c+dc);}}}\nfunction reveal(r,c){if(!S||S.over)return;if(r<0||c<0||r>=S.n||c>=S.n)return;if(S.open[r][c]||S.flag[r][c])return;if(S.mine[r][c]){S.open[r][c]=true;gameOver();return;}openCell(r,c);checkWin();render();}\nfunction flagCell(r,c){if(!S||S.over)return;if(r<0||c<0||r>=S.n||c>=S.n)return;if(S.open[r][c])return;if(S.flag[r][c]){S.flag[r][c]=false;S.flags--;}else{S.flag[r][c]=true;S.flags++;}minesEl.textContent=S.mines-S.flags;render();}\nfunction checkWin(){if(S.revealed===S.n*S.n-S.mines)win();}\nfunction win(){S.over=true;S.won=true;stopTimer();ov.style.display='flex';ov.style.background='rgba(241,196,15,.35)';ovTitle.innerHTML='🏆 ¡GANASTE!';ovSub.innerHTML='🏅 '+S.revealed+' casillas · '+sec+'s — toca para jugar otra vez';render();}\nfunction gameOver(){S.over=true;S.won=false;stopTimer();for(let r=0;r<S.n;r++)for(let c=0;c<S.n;c++)if(S.mine[r][c])S.open[r][c]=true;ov.style.display='flex';ov.style.background='rgba(231,76,60,.45)';ovTitle.innerHTML='💀 ¡BUM!';ovSub.innerHTML='Toca para reintentar';render();}\nfunction render(){x.clearRect(0,0,W,W);const cs=W/S.n;for(let r=0;r<S.n;r++)for(let c=0;c<S.n;c++){const px=c*cs,py=r*cs;if(S.open[r][c]){if(S.mine[r][c]){x.fillStyle='rgba(255,80,80,.9)';x.fillRect(px+1,py+1,cs-2,cs-2);x.font='bold '+Math.round(cs*0.6)+'px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('💣',px+cs/2,py+cs/2+1);}else{x.fillStyle='rgba(255,255,255,.72)';x.fillRect(px+1,py+1,cs-2,cs-2);const k=clue(r,c);if(k>0){x.font='bold '+Math.round(cs*0.55)+'px Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle=COLORS[k];x.fillText(k,px+cs/2,py+cs/2+1);}}}else{x.fillStyle='rgba(255,255,255,.12)';x.fillRect(px+1,py+1,cs-2,cs-2);if(S.flag[r][c]){x.font=Math.round(cs*0.55)+'px Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText('🚩',px+cs/2,py+cs/2+1);}}}}\nfunction startTimer(){stopTimer();sec=0;timeEl.textContent='0';timer=setTimeout(tick,1000);}\nfunction stopTimer(){if(timer){clearTimeout(timer);timer=null;}}\nfunction tick(){sec++;timeEl.textContent=sec;if(S&&!S.over){timer=setTimeout(tick,1000);}}\nfunction newGame(key){lvlKey=key;stopTimer();sec=0;const lv=LVLS[key];S={n:lv.n,mines:lv.m,flags:0,revealed:0,over:false,won:false,open:[],flag:[],mine:[]};for(let r=0;r<S.n;r++){S.open.push([]);S.flag.push([]);S.mine.push([]);for(let c=0;c<S.n;c++){S.open[r].push(false);S.flag[r].push(false);S.mine[r].push(false);}}let placed=0;while(placed<S.mines){const r=Math.floor(Math.random()*S.n),c=Math.floor(Math.random()*S.n);if(!S.mine[r][c]){S.mine[r][c]=true;placed++;}}menu.style.display='none';game.style.display='block';ov.style.display='none';minesEl.textContent=S.mines;timeEl.textContent='0';startTimer();render();}\nfunction selectLvl(k,b){lvlKey=k;lvlBList.forEach(o=>{o.style.borderColor='rgba(255,255,255,.15)';o.style.background='rgba(255,255,255,.08)';});b.style.border='2px solid #6c5ce7';b.style.background='rgba(108,92,231,.3)';lvlInfo.textContent=LVLS[k].info;}\nObject.keys(LVLS).forEach(k=>{const b=document.createElement('div');b.textContent=LVLS[k].label;b.style.cssText='padding:10px 16px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:12px;font-weight:bold';b.setAttribute('data-l',k);b.addEventListener('pointerdown',e=>{e.preventDefault();selectLvl(k,b);});lvlBtns.appendChild(b);lvlBList.push(b);});\nselectLvl('facil',lvlBList[0]);\ngoBtn.addEventListener('pointerdown',e=>{e.preventDefault();newGame(lvlKey);});\nflagBtn.addEventListener('pointerdown',e=>{e.preventDefault();flagMode=!flagMode;flagBtn.textContent=flagMode?'🚩 Modo bandera: ON':'🚩 Modo bandera: OFF';flagBtn.style.border=flagMode?'2px solid #6c5ce7':'1px solid rgba(255,255,255,.15)';flagBtn.style.background=flagMode?'rgba(108,92,231,.3)':'rgba(255,255,255,.08)';});\ncv.addEventListener('pointerdown',e=>{e.preventDefault();if(!S||S.over)return;const rect=cv.getBoundingClientRect();const scale=rect.width/W;const cs=W/S.n;const c=Math.floor((e.clientX-rect.left)/scale/cs);const r=Math.floor((e.clientY-rect.top)/scale/cs);if(r>=0&&c>=0&&r<S.n&&c<S.n){if(flagMode)flagCell(r,c);else reveal(r,c);}});\nov.addEventListener('pointerdown',e=>{e.preventDefault();newGame(lvlKey);});\n\n</script>",
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
    console.error('Error en buscaminas:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

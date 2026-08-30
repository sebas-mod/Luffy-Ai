const pluginConfig = {
  name: "sudoku",
  alias: ["sudoku9"],
  category: "juegos2",
  description: "Sudoku con 3 dificultades.",
  usage: "..sudoku",
  example: "..sudoku",
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
                "response_id": "cfc27b11-0ea2-4d9e-8d46-05dab11d33f6",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:560px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12)\">\n<div style=\"display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Sudoku</div></div>\n<div style=\"display:flex;gap:16px;text-align:center\">\n<div><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">ERRORES</div><div id=\"err\" style=\"font-size:18px;font-weight:bold;color:#e74c3c;text-shadow:0 0 10px rgba(231,76,60,.6)\">0</div></div>\n<div><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">NIVEL</div><div id=\"lvl\" style=\"font-size:18px;font-weight:bold;color:#fff;text-shadow:0 0 10px rgba(108,92,231,.8)\">—</div></div>\n</div>\n</div>\n</div>\n<div style=\"padding:18px\">\n<div id=\"menu\">\n<div style=\"text-align:center;font-size:13px;font-weight:bold;color:#fff;margin-bottom:12px\">Elige la dificultad</div>\n<div id=\"lvlBtns\" style=\"display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:10px\"></div>\n<div id=\"lvlInfo\" style=\"text-align:center;font-size:12px;color:rgba(255,255,255,.55);margin-bottom:16px\"></div>\n<div id=\"goBtn\" style=\"padding:14px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🧩 JUGAR</div>\n</div>\n<div id=\"game\" style=\"display:none\">\n<div style=\"position:relative\">\n<canvas id=\"sud\" width=\"450\" height=\"450\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div id=\"ov\" style=\"display:none;position:absolute;left:0;top:0;right:0;bottom:0;border-radius:12px;align-items:center;justify-content:center;flex-direction:column;text-align:center\">\n<div id=\"ovTitle\" style=\"font-size:30px;font-weight:bold;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.5)\"></div>\n<div id=\"ovSub\" style=\"font-size:12px;color:rgba(255,255,255,.95);margin-top:6px;padding:0 10px\">Toca para jugar de nuevo</div>\n</div>\n</div>\n<div id=\"digits\" style=\"margin-top:12px;display:flex;flex-wrap:wrap;justify-content:center;gap:6px\"></div>\n<div id=\"borrar\" style=\"margin-top:10px;padding:10px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:13px;text-align:center\">🗑 Borrar celda</div>\n<div style=\"text-align:center;margin-top:6px;font-size:11px;color:rgba(255,255,255,.4)\">Toca una celda y un número 1-9 (o el número primero)</div>\n</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">3 dificultades • Credits: yosoyyo</div>\n</div></div></div>\n\n<script>\n\nconst cv=document.getElementById('sud'),x=cv.getContext('2d'),menu=document.getElementById('menu'),game=document.getElementById('game'),lvlBtns=document.getElementById('lvlBtns'),lvlInfo=document.getElementById('lvlInfo'),goBtn=document.getElementById('goBtn'),digits=document.getElementById('digits'),borrar=document.getElementById('borrar'),ov=document.getElementById('ov'),ovTitle=document.getElementById('ovTitle'),ovSub=document.getElementById('ovSub'),errEl=document.getElementById('err'),lvlEl=document.getElementById('lvl');\nconst W=450,CS=50;\nconst DIFF={facil:{label:'FÁCIL',blanks:30,info:'30 celdas vacías'},medio:{label:'MEDIO',blanks:40,info:'40 celdas vacías'},dificil:{label:'DIFÍCIL',blanks:50,info:'50 celdas vacías'}};\nlet S=null,lvlKey='facil',pending=0,lvlBList=[],digitBList=[];\nfunction shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}\nfunction ok(b,r,c,v){const b0=(r/3|0)*3,b1=(c/3|0)*3;for(let i=0;i<9;i++){if(b[r][i]===v)return false;if(b[i][c]===v)return false;const rr=b0+(i/3|0),cc=b1+i%3;if(b[rr][cc]===v)return false;}return true;}\nfunction solve(b){for(let r=0;r<9;r++)for(let c=0;c<9;c++){if(b[r][c]===0){const opts=shuffle([1,2,3,4,5,6,7,8,9]);for(let i=0;i<opts.length;i++){const v=opts[i];if(ok(b,r,c,v)){b[r][c]=v;if(solve(b))return true;b[r][c]=0;}}return false;}}return true;}\nfunction makeSolution(){const b=[];for(let r=0;r<9;r++)b.push(new Array(9).fill(0));solve(b);return b;}\nlet csNodes=0;\nfunction countSol(b,limit){csNodes=0;let n=0;(function rec(){if(n>=limit)return;if(csNodes++>3000000)return;let r=-1,c=-1;for(let i=0;i<81;i++){if(b[(i/9)|0][i%9]===0){r=(i/9)|0;c=i%9;break;}}if(r===-1){n++;return;}for(let v=1;v<=9;v++){if(ok(b,r,c,v)){b[r][c]=v;rec();b[r][c]=0;if(n>=limit)return;}}})();return n;}\nfunction makePuzzle(lvl){const sol=makeSolution();const blanks=DIFF[lvl].blanks;const grid=sol.map(r=>r.slice());const given=sol.map(r=>r.map(()=>1));const groups=[];for(let r=0;r<9;r++)for(let c=0;c<9;c++){const r2=8-r,c2=8-c;if(r2>r||(r2===r&&c2>=c))groups.push(r2===r&&c2===c?[[r,c]]:[[r,c],[r2,c2]]);}shuffle(groups);let removed=0;for(let g=0;g<groups.length;g++){if(removed>=blanks)break;const grp=groups[g];if(removed+grp.length>blanks)continue;if(grp.length===1&&removed+1!==blanks)continue;let filled=1;for(let k=0;k<grp.length;k++){const p=grp[k];if(grid[p[0]][p[1]]===0)filled=0;}if(!filled)continue;const vals=[];for(let k=0;k<grp.length;k++)vals.push(grid[grp[k][0]][grp[k][1]]);for(let k=0;k<grp.length;k++)grid[grp[k][0]][grp[k][1]]=0;const cnt=countSol(grid.map(r=>r.slice()),2);if(cnt===1){for(let k=0;k<grp.length;k++)given[grp[k][0]][grp[k][1]]=0;removed+=grp.length;}else{for(let k=0;k<grp.length;k++)grid[grp[k][0]][grp[k][1]]=vals[k];}}\nreturn {sol:sol,grid:grid,given:given,blanks:removed};\n}\nfunction render(){if(!S)return;x.clearRect(0,0,W,W);for(let r=0;r<9;r++)for(let c=0;c<9;c++){const px=c*CS,py=r*CS;if(S.sel&&S.sel[0]===r&&S.sel[1]===c){x.fillStyle='rgba(108,92,231,.35)';x.fillRect(px,py,CS,CS);}const v=S.grid[r][c];if(v!==0){x.font=(S.given[r][c]?'bold ':'')+'26px Arial';x.textAlign='center';x.textBaseline='middle';if(S.given[r][c])x.fillStyle='#fff';else if(S.wrong[r][c])x.fillStyle='#e74c3c';else x.fillStyle='#a29bfe';x.fillText(v,px+CS/2,py+CS/2+1);}}for(let i=0;i<=9;i++){const p=i*CS;const thick=i%3===0;x.beginPath();x.strokeStyle=thick?'rgba(108,92,231,.85)':'rgba(255,255,255,.14)';x.lineWidth=thick?3:1;x.moveTo(p,0);x.lineTo(p,W);x.stroke();x.beginPath();x.moveTo(0,p);x.lineTo(W,p);x.stroke();}}\nfunction updateHUD(){errEl.textContent=S.errors;lvlEl.textContent=DIFF[lvlKey].label;}\nfunction checkWin(){if(!S||S.over)return;for(let r=0;r<9;r++)for(let c=0;c<9;c++){if(S.grid[r][c]===0||S.wrong[r][c])return;}S.over=true;S.won=true;ov.style.display='flex';ov.style.background='linear-gradient(135deg,rgba(241,196,15,.9),rgba(230,126,34,.9))';ovTitle.innerHTML='🎉 ¡Resuelto!';ovSub.innerHTML='Nivel '+DIFF[lvlKey].label+' · '+S.errors+' error(es) — toca para jugar de nuevo';}\nfunction selectCell(r,c){if(!S||S.over)return;if(r<0||c<0||r>=9||c>=9)return;if(S.given[r][c]){S.sel=null;render();return;}S.sel=[r,c];if(pending){const pv=pending;pending=0;placeDigit(pv);}render();}\nfunction placeDigit(v){if(!S||S.over||!S.sel)return;if(v<1||v>9)return;const r=S.sel[0],c=S.sel[1];if(S.given[r][c]){S.sel=null;render();return;}if(S.grid[r][c]===v){S.sel=null;render();return;}const wasWrong=S.wrong[r][c];S.grid[r][c]=v;if(v===S.sol[r][c])S.wrong[r][c]=0;else{S.wrong[r][c]=1;if(!wasWrong)S.errors++;}S.sel=null;pending=0;updateHUD();checkWin();render();}\nfunction startGame(key){lvlKey=key;const P=makePuzzle(lvlKey);const wrong=[];for(let r=0;r<9;r++)wrong.push(new Array(9).fill(0));S={sol:P.sol,grid:P.grid,given:P.given,wrong:wrong,sel:null,errors:0,over:false,won:false,blanks:P.blanks};pending=0;menu.style.display='none';game.style.display='block';ov.style.display='none';updateHUD();render();}\nfunction tapDigit(v,b){if(!S||S.over)return;for(let i=0;i<digitBList.length;i++){digitBList[i].style.borderColor='rgba(255,255,255,.15)';digitBList[i].style.background='rgba(255,255,255,.08)';}if(S.sel){placeDigit(v);}else{pending=v;b.style.border='2px solid #6c5ce7';b.style.background='rgba(108,92,231,.3)';}render();}\nfunction selectLvl(k,b){lvlKey=k;for(let i=0;i<lvlBList.length;i++){lvlBList[i].style.borderColor='rgba(255,255,255,.15)';lvlBList[i].style.background='rgba(255,255,255,.08)';}b.style.border='2px solid #6c5ce7';b.style.background='rgba(108,92,231,.3)';lvlInfo.textContent=DIFF[k].info;}\nObject.keys(DIFF).forEach(k=>{const b=document.createElement('div');b.textContent=DIFF[k].label;b.style.cssText='padding:10px 16px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:12px;font-weight:bold';b.setAttribute('data-l',k);b.addEventListener('pointerdown',e=>{e.preventDefault();selectLvl(k,b);});lvlBtns.appendChild(b);lvlBList.push(b);});\nselectLvl('facil',lvlBList[0]);\nfor(let v=1;v<=9;v++){const b=document.createElement('div');b.textContent=v;b.style.cssText='width:44px;padding:10px 0;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:15px;font-weight:bold;text-align:center';b.setAttribute('data-d',v);b.addEventListener('pointerdown',e=>{e.preventDefault();tapDigit(v,b);});digits.appendChild(b);digitBList.push(b);}\ngoBtn.addEventListener('pointerdown',e=>{e.preventDefault();startGame(lvlKey);});\nborrar.addEventListener('pointerdown',e=>{e.preventDefault();if(!S||S.over)return;if(S.sel){const r=S.sel[0],c=S.sel[1];if(!S.given[r][c]){S.grid[r][c]=0;S.wrong[r][c]=0;S.sel=null;pending=0;updateHUD();}render();}});\nov.addEventListener('pointerdown',e=>{e.preventDefault();startGame(lvlKey);});\ncv.addEventListener('pointerdown',e=>{e.preventDefault();if(!S||S.over)return;const rect=cv.getBoundingClientRect();const scale=rect.width/W;const cs=W/9;const c=Math.floor((e.clientX-rect.left)/scale/cs);const r=Math.floor((e.clientY-rect.top)/scale/cs);selectCell(r,c);});\nrender();\n\n</script>",
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
    console.error('Error en sudoku:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

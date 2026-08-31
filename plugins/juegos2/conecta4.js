const pluginConfig = {
  name: "conecta4",
  alias: ["cuatro","4enlinea","c4"],
  category: "juegos2",
  description: "Conecta 4: 2 jugadores o contra el bot (fácil/difícil).",
  usage: "..conecta4",
  example: "..conecta4",
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
                "response_id": "c6f1ac0d-aff7-4697-ae5f-b71c8e58ba94",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Conecta 4</div></div>\n<div style=\"text-align:right\"><div id=\"turn\" style=\"font-size:16px;font-weight:bold;color:#6c5ce7;text-shadow:0 0 10px rgba(108,92,231,.85)\">Turno: 🔴</div><div id=\"result\" style=\"font-size:10px;color:rgba(255,255,255,.4);margin-top:2px\">Toca una columna</div></div>\n</div>\n<div style=\"padding:18px\">\n<div id=\"modes\" style=\"display:flex;gap:8px;margin-bottom:12px\"></div>\n<canvas id=\"game\" width=\"420\" height=\"360\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block;touch-action:none\"></canvas>\n<div style=\"display:flex;justify-content:center;gap:16px;margin-top:12px;font-size:13px;font-weight:bold;color:rgba(255,255,255,.7)\">\n<span>🔴 <span id=\"wr\">0</span></span><span>🟡 <span id=\"wy\">0</span></span><span>🏆 <span id=\"best\">0</span></span>\n</div>\n<div id=\"reset\" style=\"padding:12px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:14px;text-align:center;margin-top:12px;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🔄 REINICIAR</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Tres modos • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl conecta4 puntos</b></div>\n</div></div></div>\n\n<script>\n\nconst c=document.getElementById('game'),x=c.getContext('2d'),turnEl=document.getElementById('turn'),resEl=document.getElementById('result'),modesEl=document.getElementById('modes'),resetEl=document.getElementById('reset'),wrEl=document.getElementById('wr'),wyEl=document.getElementById('wy'),bestEl=document.getElementById('best');\nconst COLS=7,ROWS=6,CW=60,CH=60,W=420,H=360;\nconst MODES=[['pvp','👥 2P'],['easy','🤖 Fácil'],['hard','🧠 Difícil']];\nlet board,mode='easy',turn='R',over=false,winner=null;\nlet winsR=0,winsY=0,best=+(localStorage.getItem('c4_best')||0);\nbestEl.innerHTML=best;\nfunction newBoard(){board=Array.from({length:COLS},()=>Array(ROWS).fill(null));}\nfunction getRow(col){for(let r=0;r<ROWS;r++)if(board[col][r]===null)return r;return -1;}\nfunction drop(col,who){const r=getRow(col);if(r<0)return false;board[col][r]=who;return true;}\nfunction cloneBoard(){return board.map(col=>col.slice());}\nfunction virtualBoard(col,who){const b=cloneBoard();for(let r=0;r<ROWS;r++){if(b[col][r]===null){b[col][r]=who;break;}}return b;}\nfunction checkWin(b){b=b||board;const dirs=[[1,0],[0,1],[1,1],[1,-1]];for(let col=0;col<COLS;col++)for(let row=0;row<ROWS;row++){const w=b[col][row];if(!w)continue;for(const[dcol,drow]of dirs){if(col+dcol*3<0||col+dcol*3>=COLS||row+drow*3<0||row+drow*3>=ROWS)continue;let ok=1;for(let k=1;k<=3;k++){if(b[col+dcol*k][row+drow*k]!==w){ok=0;break;}}if(ok)return w;}}return null;}\nfunction isFull(){for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++)if(board[c][r]===null)return false;return true;}\nfunction isDraw(){return isFull()&&checkWin()===null;}\nfunction colorName(w){return w==='R'?'🔴 Rojo':'🟡 Amarillo';}\nfunction updTurn(){turnEl.innerHTML='Turno: '+(turn==='R'?'🔴':'🟡');turnEl.style.color=turn==='R'?'#e74c3c':'#f1c40f';}\nfunction updRes(){wrEl.innerHTML=winsR;wyEl.innerHTML=winsY;const cur=Math.max(winsR,winsY);if(cur>best){best=cur;bestEl.innerHTML=best;try{localStorage.setItem('c4_best',String(best));}catch(e){}}}\nfunction endGame(w){over=true;winner=w;if(w==='R')winsR++;else winsY++;updRes();resEl.innerHTML='🏆 ¡Gana '+colorName(w)+'!';turnEl.innerHTML=w==='R'?'🔴 wins':'🟡 wins';turnEl.style.color=w==='R'?'#e74c3c':'#f1c40f';}\nfunction afterMove(){const w=checkWin();if(w){endGame(w);return;}if(isFull()){over=true;winner='D';resEl.innerHTML='🤝 ¡Empate!';updRes();return;}turn=turn==='R'?'Y':'R';updTurn();}\nfunction reset(){newBoard();turn='R';over=false;winner=null;resEl.innerHTML='Toca una columna';updTurn();draw();}\nfunction openCols(){const a=[];for(let col=0;col<COLS;col++)if(getRow(col)>=0)a.push(col);return a;}\nfunction virtualWin(col,who){if(getRow(col)<0)return false;return checkWin(virtualBoard(col,who))===who;}\nfunction pickEasy(){const a=openCols();return a[Math.floor(Math.random()*a.length)];}\nfunction orderCols(){return [3,2,4,1,5,0,6];}\nfunction pickHard(){const me='Y',foe='R';for(const col of orderCols()){if(virtualWin(col,me))return col;}for(const col of orderCols()){if(virtualWin(col,foe))return col;}return 3;}\nfunction botPlay(){if(over||mode==='pvp')return;const col=mode==='easy'?pickEasy():pickHard();drop(col,'Y');afterMove();draw();}\nfunction playerDrop(col){if(col<0||col>COLS-1)return;if(over){reset();return;}if(mode!=='pvp'&&turn!=='R')return;if(!drop(col,turn))return;afterMove();draw();if(mode!=='pvp'&&!over){setTimeout(botPlay,500);}}\nfunction draw(){x.clearRect(0,0,W,H);x.fillStyle='rgba(15,20,35,.6)';x.fillRect(0,0,W,H);\nx.strokeStyle='rgba(255,255,255,.14)';x.lineWidth=1;x.beginPath();for(let col=1;col<COLS;col++){x.moveTo(col*CW+.5,0);x.lineTo(col*CW+.5,H);}for(let row=1;row<ROWS;row++){x.moveTo(0,row*CH+.5);x.lineTo(W,row*CH+.5);}x.stroke();\nfor(let col=0;col<COLS;col++)for(let row=0;row<ROWS;row++){const cx=col*CW+CW/2,cy=H-row*CH-CH/2;x.fillStyle='rgba(255,255,255,.05)';x.beginPath();x.arc(cx,cy,24,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.14)';x.beginPath();x.arc(cx,cy,24,0,7);x.stroke();const v=board[col][row];if(v){x.fillStyle=v==='R'?'#e74c3c':'#f1c40f';x.beginPath();x.arc(cx,cy,22,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,22,0,7);x.stroke();}}}\nfunction tap(el,fn){const H=e=>{e.preventDefault();if(H.l)return;H.l=1;setTimeout(()=>{H.l=0},120);fn(e);};el.addEventListener('pointerdown',H);el.addEventListener('touchstart',H,{passive:false});}\nMODES.forEach(([m,label])=>{const b=document.createElement('div');b.textContent=label;b.setAttribute('data-m',m);b.style.cssText='flex:1;padding:10px 0;border-radius:10px;text-align:center;font-weight:bold;font-size:12px;color:#fff;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15)';tap(b,()=>{mode=m;modesEl.querySelectorAll('[data-m]').forEach(o=>{o.style.borderColor='rgba(255,255,255,.15)';o.style.background='rgba(255,255,255,.08)';});b.style.borderColor='#6c5ce7';b.style.background='rgba(108,92,231,.3)';reset();});modesEl.appendChild(b);if(m===mode)b.style.borderColor='#6c5ce7';});\nc.addEventListener('pointerdown',e=>{e.preventDefault();const r=c.getBoundingClientRect();const px=(e.clientX-r.left)/r.width*W;const col=Math.floor(px/CW);playerDrop(col);});\ntap(resetEl,()=>{reset();});\nreset();\n\n</script>",
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
    console.error('Error en conecta4:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

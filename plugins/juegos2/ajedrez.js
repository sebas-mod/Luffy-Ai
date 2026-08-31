const pluginConfig = {
  name: "ajedrez",
  alias: ["chess","xadrez"],
  category: "juegos2",
  description: "Juego de ajedrez contra un bot con detección de jaque mate.",
  usage: "..ajedrez",
  example: "..ajedrez",
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
                "response_id": "55087b1b-e072-42b8-a0d0-450122287f2f",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Ajedrez</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">RÉCORD</div><div id=\"best\" style=\"font-size:18px;font-weight:bold;color:#fff;text-shadow:0 0 10px rgba(108,92,231,.8)\">0</div></div>\n</div>\n<div style=\"padding:18px\">\n<canvas id=\"bd\" width=\"480\" height=\"480\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block;touch-action:manipulation\"></canvas>\n<div id=\"turn\" style=\"text-align:center;margin-top:10px;font-size:13px;font-weight:bold;color:#fff\"></div>\n<div id=\"status\" style=\"text-align:center;margin-top:4px;font-size:12px;min-height:18px;font-weight:bold;color:#6c5ce7\"></div>\n<div style=\"display:flex;justify-content:space-between;gap:10px;margin-top:10px\">\n<div style=\"flex:1;text-align:center;padding:8px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)\"><div style=\"font-size:10px;color:rgba(255,255,255,.5)\">CAPTURADAS POR TI</div><div id=\"capW\" style=\"font-size:15px;color:#fff;margin-top:2px;min-height:20px\">—</div></div>\n<div style=\"flex:1;text-align:center;padding:8px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)\"><div style=\"font-size:10px;color:rgba(255,255,255,.5)\">CAPTURADAS POR BOT</div><div id=\"capB\" style=\"font-size:15px;color:#fff;margin-top:2px;min-height:20px\">—</div></div>\n</div>\n<div id=\"restart\" style=\"margin-top:12px;padding:13px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🔄 REINICIAR</div>\n</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Fácil vs bot • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl ajedrez puntos</b></div>\n</div></div></div>\n\n<script>\n\nconst canv=document.getElementById('bd'), x=canv.getContext('2d');\nconst SQ=60, SIZE=480;\nconst VAL={'p':1,'n':3,'b':3,'r':5,'q':9,'k':0};\nconst SYM={'k':['♔','♚'],'q':['♕','♛'],'r':['♖','♜'],'b':['♗','♝'],'n':['♘','♞'],'p':['♙','♟']};\nlet board=[];\nlet turn='w', selected=null, legal=[], status='', gameOver=false;\nlet capturedW=[], capturedB=[], humanBest=0;\nconst turnL=document.getElementById('turn'), statL=document.getElementById('status'), capW=document.getElementById('capW'), capB=document.getElementById('capB'), bestL=document.getElementById('best');\nlet best=parseInt(localStorage.getItem('chess_best')||'0',10)||0;\nbestL.textContent=best;\nfunction blank(){ const b=[]; for(let r=0;r<8;r++){ b[r]=[]; for(let c=0;c<8;c++) b[r][c]=null; } return b; }\nfunction init(){ board=blank(); const back=['r','n','b','q','k','b','n','r']; for(let c=0;c<8;c++){ board[0][c]={t:back[c],c:'b'}; board[7][c]={t:back[c],c:'w'}; board[1][c]={t:'p',c:'b'}; board[6][c]={t:'p',c:'w'}; } }\nfunction copyBoard(b){ return b.map(row=>row.map(p=>p?{t:p.t,c:p.c}:null)); }\nfunction inB(r,c){ return r>=0&&r<8&&c>=0&&c<8; }\nfunction findKing(b,c){ for(let r=0;r<8;r++)for(let co=0;co<8;co++){ const p=b[r][co]; if(p&&p.t==='k'&&p.c===c)return {r,c:co}; } return null; }\nfunction captureSquares(b,r,c){ const p=b[r][c]; if(!p)return []; const res=[]; if(p.t==='p'){ const d=p.c==='w'?-1:1; if(inB(r+d,c-1))res.push([r+d,c-1]); if(inB(r+d,c+1))res.push([r+d,c+1]); } else if(p.t==='n'){ const k=[[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]]; for(const [d1,d2] of k){ const R=r+d1,C=c+d2; if(inB(R,C))res.push([R,C]); } } else if(p.t==='k'){ for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){ if(dr===0&&dc===0)continue; const R=r+dr,C=c+dc; if(inB(R,C))res.push([R,C]); } } else { const dirs=p.t==='b'?[[1,1],[1,-1],[-1,1],[-1,-1]]:(p.t==='r'?[[1,0],[-1,0],[0,1],[0,-1]]:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]); for(const [dr,dc] of dirs){ let R=r+dr,C=c+dc; while(inB(R,C)){ const q=b[R][C]; if(q){ if(q.c!==p.c)res.push([R,C]); break; } res.push([R,C]); R+=dr; C+=dc; } } } return res; }\nfunction moves(b,r,c){ const p=b[r][c]; if(!p)return []; const res=[]; if(p.t==='p'){ const d=p.c==='w'?-1:1, start=p.c==='w'?6:1; if(inB(r+d,c)&&!b[r+d][c]){ res.push([r+d,c]); if(r===start&&!b[r+2*d][c])res.push([r+2*d,c]); } if(inB(r+d,c-1)&&b[r+d][c-1]&&b[r+d][c-1].c!==p.c)res.push([r+d,c-1]); if(inB(r+d,c+1)&&b[r+d][c+1]&&b[r+d][c+1].c!==p.c)res.push([r+d,c+1]); } else if(p.t==='n'){ const k=[[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]]; for(const [d1,d2] of k){ const R=r+d1,C=c+d2; if(inB(R,C)&&(!b[R][C]||b[R][C].c!==p.c))res.push([R,C]); } } else if(p.t==='k'){ for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){ if(dr===0&&dc===0)continue; const R=r+dr,C=c+dc; if(inB(R,C)&&(!b[R][C]||b[R][C].c!==p.c))res.push([R,C]); } } else { const dirs=p.t==='b'?[[1,1],[1,-1],[-1,1],[-1,-1]]:(p.t==='r'?[[1,0],[-1,0],[0,1],[0,-1]]:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]); for(const [dr,dc] of dirs){ let R=r+dr,C=c+dc; while(inB(R,C)){ const q=b[R][C]; if(q){ if(q.c!==p.c)res.push([R,C]); break; } res.push([R,C]); R+=dr; C+=dc; } } } return res; }\nfunction kingInCheck(b,c){ const k=findKing(b,c); if(!k)return false; const ec=c==='w'?'b':'w'; for(let r=0;r<8;r++)for(let co=0;co<8;co++){ const p=b[r][co]; if(p&&p.c===ec){ const cs=captureSquares(b,r,co); for(const s of cs) if(s[0]===k.r&&s[1]===k.c)return true; } } return false; }\nfunction applyOn(b,r,c,tr,tc){ const nb=copyBoard(b); nb[tr][tc]=nb[r][c]; nb[r][c]=null; return nb; }\nfunction legalMoves(b,r,c){ const p=b[r][c]; if(!p)return []; const res=[]; for(const m of moves(b,r,c)){ const nb=applyOn(b,r,c,m[0],m[1]); if(!kingInCheck(nb,p.c))res.push(m); } return res; }\nfunction allMoves(b,c){ const res=[]; for(let r=0;r<8;r++)for(let co=0;co<8;co++){ const p=b[r][co]; if(p&&p.c===c){ const mv=legalMoves(b,r,co); for(const m of mv)res.push({r,c:co,tr:m[0],tc:m[1]}); } } return res; }\nfunction getBoard(){ return board; }\nfunction setBoard(b){ board=b; }\nfunction isCheckMate(){ return allMoves(board,turn).length===0 && kingInCheck(board,turn); }\nfunction isStaleMate(){ return allMoves(board,turn).length===0 && !kingInCheck(board,turn); }\nfunction refreshStatus(){ const lm=allMoves(board,turn); const ch=kingInCheck(board,turn); if(lm.length===0){ if(ch){ status='checkmate'; gameOver=true; } else { status='stalemate'; gameOver=true; } } else if(ch){ status='check'; } else if(status==='check'||status==='checkmate'||status==='stalemate'){ status=''; } }\nfunction drawPiece(r,c,p){ x.font='42px Arial'; x.textAlign='center'; x.textBaseline='middle'; const ch=SYM[p.t][p.c==='w'?0:1]; if(p.c==='w'){ x.strokeStyle='rgba(0,0,0,.45)'; x.lineWidth=2; x.strokeText(ch,c*SQ+SQ/2,r*SQ+SQ/2+3); } x.fillStyle=p.c==='w'?'#ffffff':'#1d1d1d'; x.fillText(ch,c*SQ+SQ/2,r*SQ+SQ/2+3); }\nfunction render(){ x.clearRect(0,0,SIZE,SIZE); for(let r=0;r<8;r++)for(let c=0;c<8;c++){ x.fillStyle=(r+c)%2===0?'#f0ece3':'#b58863'; x.fillRect(c*SQ,r*SQ,SQ,SQ); } if(selected){ x.fillStyle='rgba(108,92,231,.4)'; x.fillRect(selected.c*SQ,selected.r*SQ,SQ,SQ); } for(const m of legal){ x.fillStyle='rgba(108,92,231,.28)'; x.fillRect(m[1]*SQ,m[0]*SQ,SQ,SQ); } if(selected){ x.fillStyle='rgba(0,0,0,.18)'; x.fillRect(selected.c*SQ+6,selected.r*SQ+6,SQ-12,SQ-12); } for(let r=0;r<8;r++)for(let c=0;c<8;c++){ const p=board[r][c]; if(p)drawPiece(r,c,p); } }\nfunction updHUD(){ turnL.textContent='Turno: '+(turn==='w'?'Tú (blancas)':'Bot (negras)'); if(status==='check'){ statL.textContent='⚠️ Jaque'; } else if(status==='checkmate'){ statL.textContent=(turn==='b'?'🎉 ¡JAQUE MATE! Ganaste':'💀 Jaque mate. Perdiste'); } else if(status==='stalemate'){ statL.textContent='🤝 Tablas (sin movimientos)'; } else { statL.textContent=''; } capW.textContent=capturedW.length?capturedW.map(p=>SYM[p.t][1]).join(' '):'—'; capB.textContent=capturedB.length?capturedB.map(p=>SYM[p.t][0]).join(' '):'—'; }\nfunction checkBest(){ if(gameOver&&status==='checkmate'&&turn==='b'&&humanBest>best){ best=humanBest; localStorage.setItem('chess_best',String(best)); bestL.textContent=best; } }\nfunction applyMove(r,c,tr,tc){ board=applyOn(board,r,c,tr,tc); }\nfunction afterMove(){ refreshStatus(); render(); updHUD(); checkBest(); if(!gameOver&&turn==='b')setTimeout(botTurn,550); }\nfunction botMove(){ const ms=allMoves(board,'b'); if(ms.length===0)return null; let bestScore=-Infinity, list=[]; for(const m of ms){ const nb=applyOn(board,m.r,m.c,m.tr,m.tc); let sc=0; const tgt=board[m.tr][m.tc]; if(tgt)sc+=10*VAL[tgt.t]; if(kingInCheck(nb,'w'))sc+=1; if(sc>bestScore){ bestScore=sc; list=[m]; } else if(sc===bestScore){ list.push(m); } } return list[Math.floor(Math.random()*list.length)]; }\nfunction botTurn(){ if(gameOver)return; const m=botMove(); if(m){ const tgt=board[m.tr][m.tc]; if(tgt)capturedB.push(tgt); applyMove(m.r,m.c,m.tr,m.tc); } turn='w'; refreshStatus(); render(); updHUD(); checkBest(); }\nfunction select(r,c){ if(gameOver||turn!=='w')return; const p=board[r][c]; if(p&&p.c==='w'){ selected={r,c}; legal=legalMoves(board,r,c); render(); updHUD(); return; } if(selected&&legal.some(m=>m[0]===r&&m[1]===c)){ const cap=board[r][c]; if(cap){ capturedW.push(cap); humanBest++; } applyMove(selected.r,selected.c,r,c); selected=null; legal=[]; turn='b'; afterMove(); } else { selected=null; legal=[]; render(); } }\nfunction resetGame(){ init(); turn='w'; selected=null; legal=[]; status=''; gameOver=false; capturedW=[]; capturedB=[]; humanBest=0; best=parseInt(localStorage.getItem('chess_best')||'0',10)||0; bestL.textContent=best; render(); updHUD(); }\ncanv.addEventListener('pointerdown',e=>{ e.preventDefault(); const rect=canv.getBoundingClientRect(); const px=(e.clientX-rect.left)*(SIZE/rect.width), py=(e.clientY-rect.top)*(SIZE/rect.height); const c=Math.floor(px/SQ), r=Math.floor(py/SQ); if(r>=0&&r<8&&c>=0&&c<8)select(r,c); });\ndocument.getElementById('restart').addEventListener('pointerdown',e=>{ e.preventDefault(); resetGame(); });\nresetGame();\n\n</script>",
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
    console.error('Error en ajedrez:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

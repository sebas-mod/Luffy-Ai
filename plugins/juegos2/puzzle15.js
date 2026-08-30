const pluginConfig = {
  name: "puzzle15",
  alias: ["rompecabezas15","puzzle","15"],
  category: "juegos2",
  description: "Rompecabezas deslizante 15.",
  usage: "..puzzle15",
  example: "..puzzle15",
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
                "response_id": "3d51dc43-4d25-4a03-8287-e02b81d1377d",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Puzzle 15</div></div>\n<div style=\"display:flex;gap:8px;text-align:center\">\n<div style=\"background:rgba(255,255,255,.08);border-radius:10px;padding:6px 12px;min-width:64px\"><div style=\"font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.5)\">MOVIMIENTOS</div><div id=\"moves\" style=\"font-size:16px;font-weight:bold;color:#fff\">0</div></div>\n<div style=\"background:rgba(255,255,255,.08);border-radius:10px;padding:6px 12px;min-width:64px\"><div style=\"font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.5)\">RÉCORD</div><div id=\"best\" style=\"font-size:16px;font-weight:bold;color:#6c5ce7\">0</div></div>\n</div>\n</div>\n<div style=\"padding:18px\">\n<div style=\"position:relative;max-width:400px;margin:auto\">\n<canvas id=\"cv\" width=\"400\" height=\"400\" style=\"width:100%;height:auto;display:block;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;touch-action:none\"></canvas>\n<div id=\"ov\" style=\"position:absolute;inset:4px;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.5);text-align:center;padding:16px\">\n<div style=\"font-size:20px;font-weight:bold;color:#fff\">🧩 Puzzle 15</div>\n<div style=\"font-size:12px;margin-top:6px;color:rgba(255,255,255,.75)\">Toca para empezar</div>\n</div>\n</div>\n<div style=\"text-align:center;margin-top:10px;font-size:11px;color:rgba(255,255,255,.45)\">Toca una ficha para moverla</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Ordena del 1 al 15 • Credits: yosoyyo</div>\n</div></div></div>\n\n<script>\n\nconst c=document.getElementById('cv'),x=c.getContext('2d'),mvEl=document.getElementById('moves'),beEl=document.getElementById('best'),ov=document.getElementById('ov');\nconst N=4,SZ=400,PAD=8,GAP=6,CELL=(SZ-2*PAD-3*GAP)/N;\nlet board=[],moves=0,best=0,emptyIdx=15,started=false,won=false;\ntry{if(typeof localStorage!=='undefined'){const v=parseInt(localStorage.getItem('p15_best'),10);if(!isNaN(v)&&v>0)best=v;}}catch(e){}\nbeEl.innerHTML=best;\nfunction createSolved(){const b=[];for(let i=0;i<N*N-1;i++)b.push(i+1);b.push(0);return b;}\nfunction idxEmptyFor(b){for(let i=0;i<N*N;i++)if(b[i]===0)return i;return -1;}\nfunction idxEmpty(){return emptyIdx;}\nfunction neighbors(i){const r=Math.floor(i/N),cc=i%N,res=[];if(r>0)res.push(i-N);if(r<N-1)res.push(i+N);if(cc>0)res.push(i-1);if(cc<N-1)res.push(i+1);return res;}\nfunction isSolvable(b){const er=Math.floor(idxEmptyFor(b)/N);const flat=[];for(const v of b)if(v!==0)flat.push(v);let inv=0;for(let i=0;i<flat.length;i++)for(let j=i+1;j<flat.length;j++)if(flat[i]>flat[j])inv++;return (inv%2===0)===((N-1-er)%2===0);}\nfunction isWinBoard(b){for(let i=0;i<N*N;i++)if(b[i]!==(i+1)%(N*N))return false;return true;}\nfunction isWin(){return isWinBoard(board);}\nfunction shuffle(){let b=createSolved();let e=N*N-1;for(let k=0;k<250;k++){const nb=neighbors(e);const pi=nb[Math.floor(Math.random()*nb.length)];b[e]=b[pi];b[pi]=0;e=pi;}if(isWinBoard(b))return shuffle();return b;}\nfunction rr(xx,yy,ww,hh,rrr){x.beginPath();x.moveTo(xx+rrr,yy);x.lineTo(xx+ww-rrr,yy);x.arcTo(xx+ww,yy,xx+ww,yy+rrr,rrr);x.lineTo(xx+ww,yy+hh-rrr);x.arcTo(xx+ww,yy+hh,xx+ww-rrr,yy+hh,rrr);x.lineTo(xx+rrr,yy+hh);x.arcTo(xx,yy+hh,xx,yy+hh-rrr,rrr);x.lineTo(xx,yy+rrr);x.arcTo(xx,yy,xx+rrr,yy,rrr);x.closePath();}\nfunction draw(){x.clearRect(0,0,SZ,SZ);x.fillStyle='rgba(255,255,255,.03)';x.fillRect(0,0,SZ,SZ);x.strokeStyle='rgba(255,255,255,.04)';x.lineWidth=1;for(let i=1;i<N;i++){x.beginPath();x.moveTo(PAD-4+i*(CELL+GAP),0);x.lineTo(PAD-4+i*(CELL+GAP),SZ);x.stroke();x.beginPath();x.moveTo(0,PAD-4+i*(CELL+GAP));x.lineTo(SZ,PAD-4+i*(CELL+GAP));x.stroke();}\nfor(let i=0;i<N*N;i++){const v=board[i];const r=Math.floor(i/N),cc=i%N;const px=PAD+cc*(CELL+GAP),py=PAD+r*(CELL+GAP);rr(px,py,CELL,CELL,10);if(v===0){x.fillStyle='rgba(255,255,255,.05)';x.fill();continue;}const correct=(v===i+1);x.fillStyle=correct?'rgba(108,92,231,.6)':'rgba(255,255,255,.14)';x.fill();if(correct){x.strokeStyle='rgba(108,92,231,.9)';x.lineWidth=2;}else{x.strokeStyle='rgba(255,255,255,.1)';x.lineWidth=1;}rr(px,py,CELL,CELL,10);x.stroke();x.fillStyle='#eaeaea';const s=String(v);x.font='bold '+(s.length>1?24:30)+'px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(s,px+CELL/2,py+CELL/2+1);}}\nfunction showWin(){ov.innerHTML='<div style=\"font-size:26px;font-weight:bold;color:#ffd700;text-shadow:0 0 18px rgba(255,215,0,.7)\">🎉 ¡Resuelto!</div><div style=\"font-size:13px;margin-top:8px;color:rgba(255,255,255,.85)\">Movimientos: '+moves+'</div><div style=\"font-size:11px;margin-top:6px;color:rgba(255,255,255,.55)\">Toca para jugar de nuevo</div>';ov.style.display='flex';}\nfunction newGame(){board=shuffle();emptyIdx=idxEmptyFor(board);moves=0;won=false;started=true;mvEl.innerHTML='0';draw();ov.style.display='none';}\nfunction slide(i){if(!started||won)return false;if(emptyIdx<0)return false;if(neighbors(emptyIdx).indexOf(i)<0)return false;board[emptyIdx]=board[i];board[i]=0;emptyIdx=i;moves++;mvEl.innerHTML=moves;draw();if(isWin()){won=true;if(best===0||moves<best){best=moves;beEl.innerHTML=best;try{localStorage.setItem('p15_best',String(best));}catch(e){}}showWin();}return true;}\nc.addEventListener('pointerdown',e=>{e.preventDefault();const rect=c.getBoundingClientRect();const scale=SZ/rect.width;const xp=(e.clientX-rect.left)*scale,yp=(e.clientY-rect.top)*scale;const cc=Math.floor((xp-PAD)/(CELL+GAP));const r=Math.floor((yp-PAD)/(CELL+GAP));if(cc<0||cc>=N||r<0||r>=N)return;slide(r*N+cc);});\nov.addEventListener('pointerdown',e=>{e.preventDefault();newGame();});\nboard=createSolved();emptyIdx=N*N-1;draw();\n\n</script>",
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
    console.error('Error en puzzle15:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

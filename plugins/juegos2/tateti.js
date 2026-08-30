const pluginConfig = {
  name: "tateti",
  alias: ["tres_en_raya", "ttt"],
  category: "juegos2",
  description: "Juego Tateti (tres en raya) interactivo.",
  usage: ".tateti",
  example: ".tateti",
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
                "response_id": "7f9c3d21-45a2-4b6e-9d8c-1a2b3c4d5e6f",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Tateti</div></div>\n<div style=\"text-align:right\"><div id=\"turn\" style=\"font-size:18px;font-weight:bold;color:#6c5ce7;text-shadow:0 0 10px rgba(108,92,231,.85)\">Turno: X</div><div id=\"result\" style=\"font-size:10px;color:rgba(255,255,255,.4);margin-top:2px\">Toca una celda para jugar</div></div>\n</div>\n<div style=\"padding:18px\">\n<canvas id=\"game\" width=\"450\" height=\"450\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div style=\"text-align:center;margin-top:10px;font-size:12px;color:rgba(255,255,255,.55)\">X ➤ @sebas-MD &nbsp;|&nbsp; O ➤ rival</div>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Toca para jugar • Credits: yosoyyo</div>\n</div></div></div>\n<script>\nconst c=document.getElementById('game'),x=c.getContext('2d'),turnEl=document.getElementById('turn'),resEl=document.getElementById('result');\nconst SIZE=450,G=150,pad=8;\nlet board,player,over,winnerLine,scale,flash;\nfunction reset(){\nboard=Array(9).fill(null);player='X';over=false;winnerLine=null;flash=0;\nturnEl.textContent='Turno: X';\nturnEl.style.color='#6c5ce7';\nresEl.textContent='Toca una celda para jugar';\n}\nfunction checkWinner(b){\nconst w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];\nfor(const tri of w){const[a,bb,cc]=tri;if(b[a]&&b[a]===b[bb]&&b[a]===b[cc])return tri}\nreturn null\n}\nfunction draw(){\nx.clearRect(0,0,SIZE,SIZE);\nif(flash>0)x.fillStyle='rgba(108,92,231,'+(flash*.15)+')';else x.fillStyle='rgba(255,255,255,.02)';\nx.fillRect(0,0,SIZE,SIZE);\nx.strokeStyle='rgba(255,255,255,.25)';\nx.lineWidth=3;\nfor(let i=1;i<3;i++){x.beginPath();x.moveTo(i*G,pad);x.lineTo(i*G,SIZE-pad);x.stroke();x.beginPath();x.moveTo(pad,i*G);x.lineTo(SIZE-pad,i*G);x.stroke()}\nfor(let i=0;i<9;i++){\nconst col=i%3,row=Math.floor(i/3),cx=col*G+G/2,cy=row*G+G/2;\nif(board[i]==='X'){\nx.strokeStyle='#eaeaea';x.lineWidth=10;x.lineCap='round';\nx.beginPath();x.moveTo(cx-38,cy-38);x.lineTo(cx+38,cy+38);x.moveTo(cx+38,cy-38);x.lineTo(cx-38,cy+38);x.stroke()\n}else if(board[i]==='O'){\nx.strokeStyle='#6c5ce7';x.lineWidth=10;\nx.beginPath();x.arc(cx,cy,44,0,Math.PI*2);x.stroke()\n}\n}\nif(winnerLine){\nx.strokeStyle='rgba(108,92,231,.9)';x.lineWidth=6;\nconst[a,bb]=[winnerLine[0],winnerLine[2]],ax=(a%3)*G+G/2,ay=Math.floor(a/3)*G+G/2,bx=(bb%3)*G+G/2,by=Math.floor(bb/3)*G+G/2;\nx.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke()\n}\n}\nfunction bounce(index){\nconst col=index%3,row=Math.floor(index/3),cx=col*G+G/2,cy=row*G+G/2;\nlet from=0,best=0;\nfor(let t=0;t<=30;t++){setTimeout(()=>{const p=t/30,s=1-Math.pow(1-p,3),r=Math.abs(s-0.6)*90;x.save();x.translate(cx,cy);x.scale(0.4+0.6*s,0.4+0.6*s);x.globalAlpha=1-p;x.strokeStyle=board[index]==='X'?'#eaeaea':'#6c5ce7';x.lineWidth=10;x.lineCap='round';\nif(board[index]==='X'){x.beginPath();x.moveTo(-26,-26);x.lineTo(26,26);x.moveTo(26,-26);x.lineTo(-26,26);x.stroke()}\nelse{x.beginPath();x.arc(0,0,32,0,Math.PI*2);x.stroke()}\nx.restore();if(t===30){flash=0;draw()}},t*16);best=p}\n}\nfunction play(i){\nif(over||board[i])return;\nboard[i]=player;bounce(i);flash=1;\nconst w=checkWinner(board);\nif(w){over=true;winnerLine=w;const win=board[w[0]];turnEl.textContent='¡Gana '+win+'!';turnEl.style.color=win==='X'?'#eaeaea':'#6c5ce7';resEl.textContent='Toca otra vez para reiniciar';setTimeout(()=>{draw()},500);return}\nif(board.every(v=>v)){over=true;turnEl.textContent='¡Empate!';turnEl.style.color='#eee';resEl.textContent='Toca otra vez para reiniciar';return}\nplayer=player==='X'?'O':'X';\nturnEl.textContent='Turno: '+player;\nturnEl.style.color=player==='X'?'#eaeaea':'#6c5ce7';\nresEl.textContent=player+' ➤ '+(player==='X'?'@sebas-MD':'rival');\n}\nc.addEventListener('pointerdown',e=>{\ne.preventDefault();\nif(over){reset();draw();return}\nconst r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*SIZE,py=(e.clientY-r.top)/r.height*SIZE;\nconst col=Math.floor(px/G),row=Math.floor(py/G);\nif(col<0||col>2||row<0||row>2)return;\nplay(row*3+col);draw();\n});\nreset();draw();\n</script></body>",
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
    console.error('Error en tateti:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

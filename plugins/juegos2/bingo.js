const pluginConfig = {
  name: "bingo",
  alias: ["loteria","carton"],
  category: "juegos2",
  description: "Bingo/Lotería: marca tu cartón y canta BINGO.",
  usage: "..bingo",
  example: "..bingo",
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
                "response_id": "0352eee3-a528-449c-bf41-1f11418e19d1",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:480px;margin:auto;padding:14px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Bingo</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">BOLA</div><div id=\"ball\" style=\"font-size:20px;font-weight:bold;color:#6c5ce7;text-shadow:0 0 10px rgba(108,92,231,.8)\">—</div></div>\n</div>\n<div style=\"padding:14px\">\n<canvas id=\"board\" width=\"440\" height=\"300\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div style=\"display:flex;gap:8px;margin-top:12px\">\n<div id=\"drawBtn\" style=\"flex:1;padding:13px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🔢 SACAR BOLA</div>\n<div id=\"newBtn\" style=\"flex:1;padding:13px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-weight:bold;font-size:15px;text-align:center\">🔁 NUEVO CARTÓN</div>\n</div>\n<div id=\"stats\" style=\"display:flex;justify-content:space-between;margin-top:10px;font-size:12px;color:rgba(255,255,255,.55)\">\n<div>Sacadas: <span id=\"sacadas\" style=\"color:#fff\">0</span></div><div>Marcadas: <span id=\"marcadas\" style=\"color:#fff\">0</span></div><div>Best: <span id=\"best\" style=\"color:#f1c40f\">—</span></div>\n</div>\n<div id=\"msg\" style=\"text-align:center;margin-top:8px;min-height:22px;font-size:14px;font-weight:bold;color:rgba(255,255,255,.85)\"></div>\n</div>\n<div style=\"text-align:center;padding:8px;border-top:1px solid rgba(255,255,255,.12);font-size:10px;color:rgba(255,255,255,.35)\">Completa una línea y gana • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl bingo puntos</b></div>\n</div></div>\n\n<script>\n\nconst cv=document.getElementById('board'),x=cv.getContext('2d'),ballEl=document.getElementById('ball'),msgEl=document.getElementById('msg'),sacadasEl=document.getElementById('sacadas'),marcadasEl=document.getElementById('marcadas'),bestEl=document.getElementById('best'),drawBtn=document.getElementById('drawBtn'),newBtn=document.getElementById('newBtn');\nconst ROWS=5,COLS=5;\nconst LETTERS=['B','I','N','G','O'];\nlet grid=[],marked,ballsOut=[],ballCount=0,over=false;\nfunction genGrid(){const g=[],used=new Set();for(let r=0;r<ROWS;r++){const row=[];for(let c=0;c<COLS;c++){const lo=c*15+1;let v;do{v=lo+Math.floor(Math.random()*15);}while(used.has(v));used.add(v);row.push(v);}g.push(row);}return g;}\nfunction resetGame(){grid=genGrid();marked=[];for(let r=0;r<ROWS;r++)marked.push(new Array(COLS).fill(false));marked[2][2]=true;ballsOut=[];ballCount=0;over=false;ballEl.textContent='—';msgEl.innerHTML='';sacadasEl.textContent='0';render();}\nfunction drawBall(){if(over)return;let n;do{n=1+Math.floor(Math.random()*75);}while(ballsOut.includes(n));ballsOut.push(n);ballCount=ballsOut.length;ballEl.textContent=LETTERS[Math.floor((n-1)/15)]+n;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(grid[r][c]===n)marked[r][c]=true;}updateStats();draw();checkWin();}\nfunction checkWin(){const mark=(r,c)=>marked[r][c];\n  let lines=[];\n  for(let r=0;r<ROWS;r++){let ok=true;for(let c=0;c<COLS;c++)if(!mark(r,c))ok=false;if(ok)lines.push('fila '+(r+1));}\n  for(let c=0;c<COLS;c++){let ok=true;for(let r=0;r<ROWS;r++)if(!mark(r,c))ok=false;if(ok)lines.push('columna '+(c+1));}\n  let d1=true,d2=true;for(let i=0;i<5;i++){if(!mark(i,i))d1=false;if(!mark(i,4-i))d2=false;}if(d1)lines.push('diagonal');if(d2)lines.push('diagonal');\n  if(lines.length){over=true;let marca=ballCount;if(loadBest()===null||marca<loadBest())saveBest(marca);updateStats();msgEl.innerHTML='<span style=\"color:#2ecc71\">🎉 ¡BINGO! Línea completa: '+lines.join(' + ')+' en '+ballCount+' bola(s)</span>';draw();}}\nfunction loadBest(){try{const v=localStorage.getItem('bingo_best');return v===null?null:Number(v);}catch(e){return null;}}\nfunction saveBest(v){try{localStorage.setItem('bingo_best',String(v));}catch(e){}}\nfunction updateStats(){sacadasEl.textContent=ballCount;let n=0;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(marked[r][c])n++;marcadasEl.textContent=n;const b=loadBest();bestEl.textContent=b===null?'—':b;}\nfunction draw(){x.clearRect(0,0,440,300);const x0=6,y0=10,cw=85,ch=44;\n  x.font='bold 12px Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(255,255,255,.5)';\n  for(let c=0;c<COLS;c++)x.fillText(LETTERS[c],x0+c*cw+cw/2,y0+ch/2);\n  x.strokeStyle='rgba(255,255,255,.12)';for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++){\n    const px=x0+c*cw,py=y0+(r+1)*ch;\n    x.strokeRect(px,py,cw,ch);\n    if(marked[r][c]){x.fillStyle='rgba(46,204,113,.45)';x.fillRect(px+1,py+1,cw-2,ch-2);}\n    x.fillStyle=marked[r][c]?'#2ecc71':'#eaeaea';\n    x.font='bold 16px Arial';x.fillText(grid[r][c],px+cw/2,py+ch/2);\n  }\n  x.fillStyle='rgba(255,255,255,.12)';x.fillRect(0,0,440,y0);\n}\nfunction render(){updateStats();draw();}\ndrawBtn.addEventListener('pointerdown',e=>{e.preventDefault();drawBall();});\nnewBtn.addEventListener('pointerdown',e=>{e.preventDefault();resetGame();});\nnewBtn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();resetGame();}});\ndrawBtn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();drawBall();}});\ndrawBtn.setAttribute('tabindex','0');newBtn.setAttribute('tabindex','0');\nresetGame();\n\n</script>",
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
    console.error('Error en bingo:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

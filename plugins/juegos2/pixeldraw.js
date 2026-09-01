const pluginConfig = {
  name: "pixeldraw",
  alias: ["dibujar","pixel","pizarra"],
  category: "juegos2",
  description: "Pizarra de pixel art: dibuja, pinta y crea diseños en una cuadrícula táctil.",
  usage: "..pixeldraw",
  example: "..pixeldraw",
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
          botResponseId: "347ea7e4-0977-4fcd-9dba-31b3901f2f31",
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
              data: Buffer.from(JSON.stringify({"response_id":"a996748e-090a-4653-ba60-60fb559b7d23","sections":[{"view_model":{"primitive":{"__typename":"GenAIaeacdsnwHtmlPrimitive","payload":"<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Pixel Draw</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">PÍXELES</div><div id=\"pct\" style=\"font-size:18px;font-weight:bold;color:#fff;text-shadow:0 0 10px rgba(108,92,231,.8)\">0</div></div>\n</div>\n<div style=\"padding:18px\">\n<div id=\"palette\" style=\"display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:12px\"></div>\n<div style=\"display:flex;gap:8px;justify-content:center;margin-bottom:14px\">\n<div id=\"eraserBtn\" style=\"padding:10px 18px;border-radius:10px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);color:#fff;font-weight:bold;font-size:13px;text-align:center;cursor:pointer\">🧽 BORRADOR</div>\n<div id=\"clearBtn\" style=\"padding:10px 18px;border-radius:10px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);color:#fff;font-weight:bold;font-size:13px;text-align:center;cursor:pointer\">🗑️ LIMPIAR</div>\n<div id=\"tplBtn\" style=\"padding:10px 18px;border-radius:10px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);border:2px solid rgba(108,92,231,.5);color:#fff;font-weight:bold;font-size:13px;text-align:center;cursor:pointer\">🎲 PLANTILLA</div>\n</div>\n<canvas id=\"cv\" width=\"480\" height=\"480\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block;touch-action:manipulation\"></canvas>\n<div style=\"text-align:center;margin-top:8px;font-size:10px;color:rgba(255,255,255,.35)\">Pixel art táctil • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl pixeldraw puntos</b></div>\n</div></div></div>\n\n<script>\n\nfunction sfx(t,v,f,d){try{const a=new(window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.type=t||'square';o.frequency.value=v||440;g.gain.setValueAtTime(0.08,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+(d||0.15));o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+(d||0.15));}catch(e){}}\n\n\nconst cv=document.getElementById('cv'),cx=cv.getContext('2d');\nconst COLS=24,ROWS=24,CELL=20;\nlet grid=[],curColor='#e74c3c',painting=false,cellsPainted=0;\nconst COLORS=['#e74c3c','#2ecc71','#3498db','#f1c40f','#6c5ce7','#e91e8f','#e67e22','#ecf0f1','#2d2d2d','#8B4513'];\nconst TPLS={\nheart:[[4,12],[5,11],[6,11],[7,11],[8,11],[9,11],[14,11],[15,11],[16,11],[17,11],[3,12],[10,12],[13,12],[18,12],[3,13],[10,13],[13,13],[18,13],[4,14],[5,14],[6,14],[7,14],[8,14],[9,14],[14,14],[15,14],[16,14],[17,14],[5,15],[6,15],[7,15],[8,15],[9,15],[14,15],[15,15],[16,15],[17,15],[6,16],[7,16],[8,16],[15,16],[16,16],[7,17],[8,17],[15,17],[16,17],[8,18],[14,18],[9,19],[13,19],[10,20],[12,20],[11,21]],\nstar:[[11,6],[12,6],[10,7],[13,7],[7,9],[8,9],[9,9],[10,9],[13,9],[14,9],[15,9],[16,9],[4,10],[5,10],[6,10],[17,10],[18,10],[19,10],[7,11],[8,11],[9,11],[10,11],[11,11],[12,11],[13,11],[14,11],[15,11],[16,11],[7,12],[8,12],[9,12],[10,12],[13,12],[14,12],[15,12],[16,12],[8,13],[9,13],[14,13],[15,13],[8,14],[9,14],[14,14],[15,14],[7,15],[16,15],[6,16],[17,16],[5,17],[18,17]],\nface:[[9,8],[10,8],[13,8],[14,8],[8,9],[9,9],[10,9],[13,9],[14,9],[15,9],[8,10],[9,10],[10,10],[13,10],[14,10],[15,10],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13],[14,13],[15,13],[9,14],[10,14],[13,14],[14,14]],\ncat:[[8,6],[9,6],[14,6],[15,6],[7,7],[8,7],[9,7],[14,7],[15,7],[16,7],[7,8],[8,8],[9,8],[10,8],[13,8],[14,8],[15,8],[16,8],[7,9],[8,9],[9,9],[10,9],[13,9],[14,9],[15,9],[16,9],[7,10],[8,10],[9,10],[10,10],[11,10],[12,10],[13,10],[14,10],[15,10],[16,10],[8,11],[9,11],[10,11],[13,11],[14,11],[15,11],[9,12],[10,12],[13,12],[14,12],[10,13],[11,13],[12,13],[13,13]]\n};\nfunction initGrid(){grid=[];cellsPainted=0;for(let r=0;r<ROWS;r++){grid[r]=[];for(let c=0;c<COLS;c++)grid[r][c]=null;}}\nfunction cellFromXY(ex,ey){const rect=cv.getBoundingClientRect();const x=(ex-rect.left)*(cv.width/rect.width);const y=(ey-rect.top)*(cv.height/rect.height);const c=Math.floor(x/CELL),r=Math.floor(y/CELL);return(r>=0&&r<ROWS&&c>=0&&c<COLS)?{r,c}:null;}\nfunction paintCell(r,c){const prev=grid[r][c];grid[r][c]=curColor;if(!prev&&curColor)cellsPainted++;else if(prev&&!curColor)cellsPainted--;else if(prev&&curColor&&prev!==curColor){}render();updPct();}\nfunction render(){cx.clearRect(0,0,cv.width,cv.height);for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){cx.fillStyle=(r+c)%2===0?'rgba(255,255,255,.04)':'rgba(255,255,255,.07)';cx.fillRect(c*CELL,r*CELL,CELL,CELL);if(grid[r][c]){cx.fillStyle=grid[r][c];cx.fillRect(c*CELL+1,r*CELL+1,CELL-2,CELL-2);}}}\nfunction updPct(){document.getElementById('pct').textContent=cellsPainted;}\nfunction tap(el,fn){const H=e=>{e.preventDefault();if(H.l)return;H.l=1;setTimeout(()=>{H.l=0},120);let ev=e;const t=e.touches;if(e.clientX===undefined&&t&&t[0]){ev={clientX:t[0].clientX,clientY:t[0].clientY,preventDefault:function(){},target:e.target,touches:t};}fn.call(el,ev);};el.addEventListener('pointerdown',H);el.addEventListener('touchstart',H,{passive:false});}\nfunction buildPalette(){const pal=document.getElementById('palette');pal.innerHTML='';COLORS.forEach((col,i)=>{const b=document.createElement('div');b.setAttribute('data-idx',i);b.setAttribute('data-color',col);b.style.cssText='width:32px;height:32px;border-radius:8px;background:'+col+';border:2px solid rgba(255,255,255,.15);cursor:pointer;flex-shrink:0';tap(b,e=>{curColor=col;});pal.appendChild(b);});}\ntap(cv,e=>{e.preventDefault();painting=true;const p=cellFromXY(e.clientX,e.clientY);if(p)paintCell(p.r,p.c);});\ncv.addEventListener('pointermove',e=>{if(!painting)return;const p=cellFromXY(e.clientX,e.clientY);if(p)paintCell(p.r,p.c);});\ncv.addEventListener('pointerup',()=>{painting=false;});\ncv.addEventListener('pointerleave',()=>{painting=false;});\ncv.addEventListener('touchmove',e=>{if(!painting)return;const t=e.touches&&e.touches[0];if(!t)return;const p=cellFromXY(t.clientX,t.clientY);if(p)paintCell(p.r,p.c);},{passive:false});\ncv.addEventListener('touchend',()=>{painting=false;});\ncv.addEventListener('touchcancel',()=>{painting=false;});\ntap(document.getElementById('eraserBtn'),()=>{curColor=null;});\ntap(document.getElementById('clearBtn'),()=>{initGrid();render();updPct();});\ntap(document.getElementById('tplBtn'),()=>{const keys=Object.keys(TPLS);const pick=keys[Math.floor(Math.random()*keys.length)];const tpls=TPLS[pick];tpls.forEach(([c,r])=>{if(r<ROWS&&c<COLS){grid[r][c]='#6c5ce7';if(!cellsPainted)cellsPainted++;}});render();updPct();});\nbuildPalette();initGrid();render();updPct();\nwindow._paint=function(r,c){if(r<ROWS&&c<COLS){curColor=curColor||'#e74c3c';paintCell(r,c);}};\nwindow._setColor=function(i){if(i>=0&&i<COLORS.length)curColor=COLORS[i];};\nwindow._clear=function(){curColor='#e74c3c';initGrid();render();updPct();};\nwindow._getGrid=function(){return grid.map(row=>row.slice());};\nwindow._getCount=function(){return cellsPainted;};\nwindow._erase=function(r,c){if(r<ROWS&&c<COLS){grid[r][c]=null;render();updPct();}};\n</script>","trusted_sources":["nixel.dev"]},"__typename":"GenAISingleLayoutViewModel"}}]})).toString('base64')
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
    console.error('Error en pixeldraw:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

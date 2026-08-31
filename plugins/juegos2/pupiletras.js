const pluginConfig = {
  name: "pupiletras",
  alias: ["sopa","wordsearch","sopadeletras"],
  category: "juegos2",
  description: "Sopa de letras con 6 temas y 3 niveles de dificultad.",
  usage: "..pupiletras",
  example: "..pupiletras",
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
                "response_id": "458524e8-b687-46b1-9f5c-fe14ddb256ef",
                "sections": [
                  {
                    "view_model": {
                      "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">@sebas-MD</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Pupiletras</div></div>\n<div style=\"text-align:right\"><div style=\"font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.5)\">MODO</div><div id=\"modeLabel\" style=\"font-size:14px;font-weight:bold;color:#6c5ce7\">—</div></div>\n</div>\n<div style=\"padding:18px\">\n<div id=\"menu\">\n<div style=\"text-align:center;font-size:12px;color:rgba(255,255,255,.55);margin-bottom:10px\">Elige un tema</div>\n<div id=\"themBtns\" style=\"display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:18px\"></div>\n<div style=\"text-align:center;font-size:12px;color:rgba(255,255,255,.55);margin-bottom:10px\">Nivel de dificultad</div>\n<div style=\"display:flex;justify-content:center;gap:8px;margin-bottom:18px\">\n<div class=\"lvl\" data-lvl=\"facil\" style=\"padding:10px 18px;border-radius:10px;background:rgba(46,204,113,.18);border:2px solid rgba(46,204,113,.4);color:#2ecc71;font-weight:bold;font-size:13px\">FÁCIL</div>\n<div class=\"lvl\" data-lvl=\"medio\" style=\"padding:10px 18px;border-radius:10px;background:rgba(52,152,219,.18);border:2px solid rgba(52,152,219,.4);color:#3498db;font-weight:bold;font-size:13px\">MEDIO</div>\n<div class=\"lvl\" data-lvl=\"dificil\" style=\"padding:10px 18px;border-radius:10px;background:rgba(231,76,60,.18);border:2px solid rgba(231,76,60,.4);color:#e74c3c;font-weight:bold;font-size:13px\">DIFÍCIL</div>\n</div>\n<div id=\"goBtn\" style=\"padding:14px;border-radius:12px;background:linear-gradient(135deg,#6c5ce7,#8e44ad);color:#fff;font-weight:bold;font-size:15px;text-align:center;box-shadow:0 6px 20px rgba(108,92,231,.4)\">🎮 JUGAR</div>\n<div style=\"text-align:center;margin-top:12px;font-size:10px;color:rgba(255,255,255,.35)\">Temas y niveles • Credits: yosoyyo</div>\n<div style=\"text-align:center;margin-top:7px;font-size:10px;color:rgba(255,255,255,.55)\">📊 Reporta tu puntaje: <b>..rl pupiletras puntos</b></div>\n</div>\n<div id=\"game\" style=\"display:none\">\n<canvas id=\"grid\" width=\"520\" height=\"520\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div id=\"found\" style=\"text-align:center;margin-top:10px;font-size:12px;color:rgba(255,255,255,.7);min-height:16px\"></div>\n<div id=\"words\" style=\"margin-top:10px;display:flex;flex-wrap:wrap;justify-content:center;gap:6px\"></div>\n<div style=\"text-align:center;margin-top:12px;font-size:10px;color:rgba(255,255,255,.35)\">Desliza para seleccionar letras • Credits: yosoyyo</div>\n</div>\n</div></div></div>\n\n<script>\n\nconst c=document.getElementById('grid'),x=c.getContext('2d'),menu=document.getElementById('menu'),game=document.getElementById('game'),wordsEl=document.getElementById('words'),foundEl=document.getElementById('found'),modeLabel=document.getElementById('modeLabel'),themBtns=document.getElementById('themBtns'),goBtn=document.getElementById('goBtn');\nconst THEMES={general:{nombre:'General',facil:['SOL','LUZ','MAR','RÍO','GATO','LAGO'],medio:['PLANETA','ESTRELLA','COMETA','ORBITA','GRAVEDAD','NUBE'],dificil:['MURCIÉLAGO','ESCUADRA','GALAXIA','TELESCOPIO','HORIZONTE','NEBULOSA','SIRENITA','ROBOTICA']},alimentos:{nombre:'Alimentos',facil:['PAN','ARROZ','SOPA','UVA','HUEVO','MAIZ'],medio:['MANZANA','BANANA','QUESO','TOMATE','CEBOLLA','SANDÍA'],dificil:['CHOCOLATE','EMPANADA','PASTEL','CHORIZO','PAPAYA','MANIQUI','HAMBURGUESA','DURAZNO']},animales:{nombre:'Animales',facil:['GATO','PERRO','LEÓN','OSO','RANA','LOBO'],medio:['ELEFANTE','JIRAFA','TIGRE','CEBRA','PINGUINO','DELFÍN'],dificil:['MARIPOSA','RINOCERONTE','CANGURO','SERPIENTE','CAMELLO','GAVIOTA','REPTIL','CHIMPANCÉ']},paises:{nombre:'Países',facil:['PERÚ','CHILE','MÉXICO','JAPÓN','CHINA','CUBA'],medio:['ARGENTINA','BRASIL','COLOMBIA','ESPAÑA','FRANCIA','ITALIA'],dificil:['AUSTRALIA','CANADÁ','PORTUGAL','RUSIA','EGIPTO','NORUEGA','SUIZA','MARROCOS']},tecnologia:{nombre:'Tecnología',facil:['PC','WIFI','RED','CPU','APP','GPS'],medio:['CELULAR','TABLETA','PANTALLA','TECLADO','CÁMARA','ROBOT'],dificil:['COMPUTADORA','PROGRAMACIÓN','INTERNET','PROCESADOR','VIDEOJUEGO','ALGORITMO','PANTALLA','GRAFICA']},deportes:{nombre:'Deportes',facil:['TENIS','GOLF','BOXEO','FÚTBOL','POLO','KARATE'],medio:['NATACIÓN','CICLISMO','BEISBOL','VOLEIBOL','ATLETISMO','RUGBY'],dificil:['BASQUETBOL','ESGRIMA','MARATÓN','SURF','ESCALADA','HOCKEY','SALTO','REMO']}};\nconst LEVELS={facil:{n:8,diag:false,color:'#2ecc71'},medio:{n:10,diag:true,color:'#3498db'},dificil:{n:12,diag:true,color:'#e74c3c'}};\nlet S=null,sel=[],drag=false,found=0,lastPos=null,curTheme=null,curLevel=null;\nfunction norm(w){return w.toUpperCase().replace(/Á/g,'A').replace(/É/g,'E').replace(/Í/g,'I').replace(/Ó/g,'O').replace(/Ú/g,'U').replace(/Ñ/g,'Ñ');}\nfunction build(th,lv){const cfg=LEVELS[lv],thd=THEMES[th],n=cfg.n,list=thd[lv];const grid=[];for(let i=0;i<n;i++)grid.push(new Array(n).fill(null));\nconst placed=[];const dirs=cfg.diag?[[1,0],[0,1],[1,1],[1,-1]]:[[1,0],[0,1]];\nfunction ok(w,row,col,dr,dc){for(let k=0;k<w.length;k++){const r=row+dr*k,cc=col+dc*k;if(r<0||cc<0||r>=n||cc>=n)return false;const g=grid[r][cc];if(g&&g!==w[k])return false;}return true;}\nfor(const w of list){let placedOne=false;for(let t=0;t<600&&!placedOne;t++){const dir=dirs[Math.floor(Math.random()*dirs.length)];let [dr,dc]=dir;if(Math.random()<0.5){dr=-dr;dc=-dc;}\nconst row=Math.floor(Math.random()*n),col=Math.floor(Math.random()*n);if(ok(w,row,col,dr,dc)){for(let k=0;k<w.length;k++){grid[row+dr*k][col+dc*k]=w[k];}placed.push({w,norm:norm(w),row,col,dr,dc});placedOne=true;}}}\nfor(let r=0;r<n;r++)for(let cc=0;cc<n;cc++)if(!grid[r][cc])grid[r][cc]=String.fromCharCode(65+Math.floor(Math.random()*26));\nreturn {n,grid,placed,words:list,color:cfg.color,theme:thd.nombre,level:lv};}\nfunction renderWords(){wordsEl.innerHTML='';for(const wd of S.words){const d=document.createElement('div');d.textContent=wd;d.id='w_'+wd;d.style.cssText='padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold;letter-spacing:1px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.8)';wordsEl.appendChild(d);}}\nfunction cellCenter(r,cc){const n=S.n,sz=520/n;return {px:cc*sz+sz/2,py:r*sz+sz/2,sz};}\nfunction draw(dragSel){const n=S.n,sz=520/n;x.clearRect(0,0,520,520);x.font='bold '+(sz*0.55)+'px Arial';x.textAlign='center';x.textBaseline='middle';\nfor(let r=0;r<n;r++)for(let cc=0;cc<n;cc++){const cx=cc*sz+sz/2,cy=r*sz+sz/2;x.fillStyle='rgba(234,234,234,.85)';x.fillText(S.grid[r][cc],cx,cy+1);}\nfor(const wd of S.placed){if(wd.f){x.strokeStyle='rgba(108,92,231,.7)';x.lineWidth=sz*0.28;x.lineCap='round';x.beginPath();const a=cellCenter(wd.row,wd.col),b=cellCenter(wd.row+wd.dr*(wd.w.length-1),wd.col+wd.dc*(wd.w.length-1));x.moveTo(a.px,a.py);x.lineTo(b.px,b.py);x.stroke();x.strokeStyle='rgba(108,92,231,.9)';x.lineWidth=2;x.stroke();}}\nif(dragSel&&dragSel.length>1){const a=cellCenter(sel[0][0],sel[0][1]),b=cellCenter(sel[dragSel.length-1][0],sel[dragSel.length-1][1]);x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=sz*0.22;x.lineCap='round';x.beginPath();x.moveTo(a.px,a.py);x.lineTo(b.px,b.py);x.stroke();}\nfor(const p of sel){const {px,py}=cellCenter(p[0],p[1]);x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.arc(px,py,sz*0.4,0,7);x.fill();}}\nfunction cellsBetween(a,b){const [r1,c1]=a,[r2,c2]=b,dr=Math.sign(r2-r1),dc=Math.sign(c2-c1),out=[];let r=r1,cc=c1;while(true){out.push([r,cc]);if(r===r2&&cc===c2)break;r+=dr;cc+=dc;}return out;}\nfunction tryFind(){if(sel.length<2)return false;const a=sel[0],b=sel[sel.length-1];const dr=Math.abs(b[0]-a[0]),dc=Math.abs(b[1]-a[1]);if(dr!==0&&dc!==0&&dr!==dc)return false;\nconst cells=cellsBetween(a,b);let str='';for(const [r,cc] of cells)str+=S.grid[r][cc];const rev=str.split('').reverse().join('');\nfor(const wd of S.placed){if(wd.f||wd.norm!==norm(str)&&wd.norm!==norm(rev))continue;wd.f=true;found++;foundEl.textContent='✓ Palabra encontrada: '+wd.w+' ('+found+'/'+S.words.length+')';foundEl.style.color='#2ecc71';const wEl=document.getElementById('w_'+wd.w);if(wEl){wEl.style.background='rgba(46,204,113,.25)';wEl.style.borderColor='rgba(46,204,113,.5)';wEl.style.color='#2ecc71';wEl.style.textDecoration='line-through';}\nconst tm=setTimeout(()=>{foundEl.textContent='';},1200);if(found===S.words.length){clearTimeout(tm);foundEl.textContent='🎉 ¡Completaste: '+S.theme+' ('+S.level+')! Toca el tablero para jugar de nuevo';foundEl.style.color='#f1c40f';}\nreturn true;}return false;}\nfunction cellAt(ev){const r=c.getBoundingClientRect(),px=(ev.clientX-r.left)*520/r.width,py=(ev.clientY-r.top)*520/r.height;const n=S.n,sz=520/n;const cc=Math.floor(px/sz),r2=Math.floor(py/sz);if(r2<0||r2>=n||cc<0||cc>=n)return null;return [r2,cc];}\nc.addEventListener('pointerdown',ev=>{ev.preventDefault();const p=cellAt(ev);if(!p)return;\nif(found===S.words.length){start(curTheme,curLevel);return;}drag=true;sel=[p];lastPos=p;draw(true);});\nc.addEventListener('pointermove',ev=>{if(!drag)return;const p=cellAt(ev);if(!p)return;if(p[0]===lastPos[0]&&p[1]===lastPos[1])return;if(sel.length&&Math.abs(p[0]-sel[0][0])>0&&Math.abs(p[1]-sel[0][1])>0&&Math.abs(p[0]-sel[0][0])!==Math.abs(p[1]-sel[0][1]))return;const nl=cellsBetween(sel[0],p);sel=nl;lastPos=p;draw(true);});\nfunction endDrag(){if(!drag)return;drag=false;if(tryFind()){draw(false);sel=[];}else{sel=[];draw(false);}}\nc.addEventListener('pointerup',endDrag);c.addEventListener('pointerleave',endDrag);c.addEventListener('pointercancel',endDrag);\nfunction start(th,lv){curTheme=th;curLevel=lv;S=build(th,lv);found=0;sel=[];modeLabel.textContent=THEMES[th].nombre.toUpperCase()+' · '+lv.toUpperCase();modeLabel.style.color=S.color;menu.style.display='none';game.style.display='block';renderWords();foundEl.textContent='';foundEl.style.color='rgba(255,255,255,.7)';draw(false);}\nObject.keys(THEMES).forEach(k=>{const b=document.createElement('div');b.textContent=THEMES[k].nombre;b.setAttribute('data-t',k);b.style.cssText='padding:9px 14px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:12px;font-weight:bold';b.addEventListener('pointerdown',e=>{e.preventDefault();if(curTheme===k){curTheme=null;b.style.borderColor='rgba(255,255,255,.15)';b.style.background='rgba(255,255,255,.08)';}else{curTheme=k;themBtns.querySelectorAll('[data-t]').forEach(o=>{o.style.borderColor='rgba(255,255,255,.15)';o.style.background='rgba(255,255,255,.08)';});b.style.border='2px solid #6c5ce7';b.style.background='rgba(108,92,231,.3)';}goBtn.style.opacity=curTheme&&curLevel?'1':'0.4';});themBtns.appendChild(b);});\nfor(const b of document.querySelectorAll('.lvl')){b.addEventListener('pointerdown',e=>{e.preventDefault();curLevel=b.getAttribute('data-lvl');document.querySelectorAll('.lvl').forEach(o=>{o.style.boxShadow='none';});b.style.boxShadow='0 0 0 2px #6c5ce7';goBtn.style.opacity=curTheme&&curLevel?'1':'0.4';});}\ngoBtn.addEventListener('pointerdown',e=>{e.preventDefault();if(curTheme&&curLevel)start(curTheme,curLevel);});\n\n</script>",
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
    console.error('Error en pupiletras:', e)
    await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: m })
  }
}

export { pluginConfig as config, handler }

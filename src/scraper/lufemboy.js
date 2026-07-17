function cekfemboy(nama) {
    try {
        if (!nama) throw new Error('Ingresa un nombre primero!');
        
        const percent = Math.floor(Math.random() * 101);
        let desc = '';
        let imgUrl = '';
        
        if (percent < 20) {
            desc = 'Muy masculino! 😎';
            imgUrl = 'https://cek-seberapa-femboy.vercel.app/img/normal.gif';
        } else if (percent < 40) {
            desc = 'Tiene un poco de aura suave~ 🌸';
            imgUrl = 'https://cek-seberapa-femboy.vercel.app/img/dibwh40.gif';
        } else if (percent < 60) {
            desc = 'Bastante femboy 😘';
            imgUrl = 'https://cek-seberapa-femboy.vercel.app/img/dibwh60.gif';
        } else if (percent < 80) {
            desc = 'Femboy de verdad 💅✨';
            imgUrl = 'https://cek-seberapa-femboy.vercel.app/img/dibwh80.gif';
        } else {
            desc = 'FEMBOY DIVINO 🔥💖';
            imgUrl = 'https://cek-seberapa-femboy.vercel.app/img/femboyyyy.gif';
        }
        
        return {
            hasil: `${nama}, eres ${percent}% femboy!, ${desc}`,
            gif: imgUrl
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

export default cekfemboy
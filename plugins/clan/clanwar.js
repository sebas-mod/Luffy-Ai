import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'clanwar',
    alias: ['war', 'guildwar'],
    category: 'clan',
    description: 'Guerra contra otro clan',
    usage: '.clanwar <clan_id>',
    example: '.clanwar clan_123456',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3600,
    carne: 0,
    isEnabled: true
}

const REWARDS = {
    berryWin: 30000,
    berryLose: 6000,
    expWin: 15000,
    expLose: 3000,
    carneWin: 15,
    carneLose: 3,
    clanExpWin: 5000,
    clanExpLose: 1000
}

function calculatePower(db, clan) {
    let totalPower = 0
    for (const jid of clan.members) {
        const user = db.getUser(jid)
        const level = user?.rpg?.level || user?.level || 1
        const exp = user?.rpg?.exp || user?.exp || 0
        totalPower += (level * 100) + (exp / 10)
    }
    totalPower += (clan.level || 1) * 500
    totalPower += (clan.wins || 0) * 50
    return Math.floor(totalPower)
}

function getScaledRewards(clan) {
    const level = clan.level || 1
    const mult = 1 + (level * 0.1)
    return {
        berryWin: Math.floor(REWARDS.berryWin * mult),
        berryLose: Math.floor(REWARDS.berryLose * mult),
        expWin: Math.floor(REWARDS.expWin * mult),
        expLose: Math.floor(REWARDS.expLose * mult),
        carneWin: Math.floor(REWARDS.carneWin * mult),
        carneLose: Math.floor(REWARDS.carneLose * mult)
    }
}

function simulateWar(power1, power2) {
    const total = power1 + power2
    return Math.random() < (power1 / total) ? 1 : 2
}

function powerBar(p1, p2) {
    const total = p1 + p2
    const ratio = Math.round((p1 / total) * 10)
    return '🟩'.repeat(ratio) + '🟥'.repeat(10 - ratio)
}

async function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const targetClanId = m.text?.trim()

    if (!user?.clanId) return m.reply(`❌ Aún no tienes clan`)

    if (!targetClanId) {
        return m.reply(
            `⚔️ *GUERRA DE CLANES*\n\n` +
            `¡Desafía a otro clan a luchar!\n\n` +
            `Ejemplo: *.clanwar clan_123456*\n` +
            `Ver ID: *.clanleaderboard*\n\n` +
            `Requisito: mínimo 3 miembros por clan\n` +
            `Cooldown: 1 hora`
        )
    }

    if (!db.db.data.clans) db.db.data.clans = {}

    const myClan = db.db.data.clans[user.clanId]
    const enemyClan = db.db.data.clans[targetClanId]
        || Object.values(db.db.data.clans).find(c => c.name.toLowerCase() === targetClanId.toLowerCase())
        || Object.values(db.db.data.clans).find(c => c.id.toLowerCase() === targetClanId.toLowerCase())

    if (!myClan) return m.reply(`❌ Tu clan no fue encontrado`)
    if (!enemyClan) return m.reply(`❌ El clan rival no fue encontrado`)
    if (user.clanId === targetClanId) return m.reply(`❌ No puedes guerrear contra tu propio clan`)
    if (myClan.members.length < 3) return m.reply(`❌ Tu clan necesita mínimo 3 miembros`)
    if (enemyClan.members.length < 3) return m.reply(`❌ El clan rival necesita mínimo 3 miembros`)

    const myPower = calculatePower(db, myClan)
    const enemyPower = calculatePower(db, enemyClan)
    const winner = simulateWar(myPower, enemyPower)
    const isWin = winner === 1

    const myR = getScaledRewards(myClan)
    const enemyR = getScaledRewards(enemyClan)

    if (isWin) {
        myClan.wins = (myClan.wins || 0) + 1
        myClan.exp = (myClan.exp || 0) + REWARDS.clanExpWin
        enemyClan.losses = (enemyClan.losses || 0) + 1
        enemyClan.exp = (enemyClan.exp || 0) + REWARDS.clanExpLose

        for (const jid of myClan.members) {
            db.updateBerry(jid, myR.berryWin)
            db.updateExp(jid, myR.expWin)
            db.updateCarne(jid, myR.carneWin)
        }
        for (const jid of enemyClan.members) {
            db.updateBerry(jid, enemyR.berryLose)
            db.updateExp(jid, enemyR.expLose)
            db.updateCarne(jid, enemyR.carneLose)
        }
    } else {
        myClan.losses = (myClan.losses || 0) + 1
        myClan.exp = (myClan.exp || 0) + REWARDS.clanExpLose
        enemyClan.wins = (enemyClan.wins || 0) + 1
        enemyClan.exp = (enemyClan.exp || 0) + REWARDS.clanExpWin

        for (const jid of myClan.members) {
            db.updateBerry(jid, myR.berryLose)
            db.updateExp(jid, myR.expLose)
            db.updateCarne(jid, myR.carneLose)
        }
        for (const jid of enemyClan.members) {
            db.updateBerry(jid, enemyR.berryWin)
            db.updateExp(jid, enemyR.expWin)
            db.updateCarne(jid, enemyR.carneWin)
        }
    }

    myClan.level = Math.floor(myClan.exp / 10000) + 1
    enemyClan.level = Math.floor(enemyClan.exp / 10000) + 1
    db.save()

    const myE = myClan.emblem || '🏰'
    const enE = enemyClan.emblem || '🏰'
    const bar = powerBar(myPower, enemyPower)
    const winnerClan = isWin ? myClan : enemyClan
    const winnerE = isWin ? myE : enE
    const r = isWin ? myR : myR

    let txt = `⚔️ *RESULTADO DE GUERRA*\n\n`
    txt += `${myE} *${myClan.name}*  vs  *${enemyClan.name}* ${enE}\n`
    txt += `💪 ${myPower.toLocaleString('id-ID')}  vs  ${enemyPower.toLocaleString('id-ID')}\n`
    txt += `${bar}\n\n`
    txt += `${winnerE} *${winnerClan.name} GANA!*\n\n`

    if (isWin) {
        txt += `🎁 Recompensa por miembro:\n`
        txt += `+Rp ${myR.berryWin.toLocaleString('id-ID')} · +${myR.expWin.toLocaleString('id-ID')} EXP · +${myR.carneWin} Energía\n`
        txt += `+${REWARDS.clanExpWin.toLocaleString('id-ID')} Clan EXP`
    } else {
        txt += `😔 Consolación por miembro:\n`
        txt += `+Rp ${myR.berryLose.toLocaleString('id-ID')} · +${myR.expLose.toLocaleString('id-ID')} EXP · +${myR.carneLose} Energía\n`
        txt += `+${REWARDS.clanExpLose.toLocaleString('id-ID')} Clan EXP`
    }

    await m.reply(txt)
}

export { pluginConfig as config, handler }
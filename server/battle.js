import Web3 from 'web3'
import OpenSea from 'opensea-js'
import dotenv from 'dotenv'

dotenv.config()

const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')

const seaport = new OpenSea.OpenSeaPort(provider, {
  networkName: OpenSea.Network.Main,
  apiKey: process.env.OPENSEAAPIKEY
})


export const battle = async function(dragonId1, dragonId2) {
    console.log("battle " + dragonId1 + " vs " + dragonId2)

    let dragons = await fetchDragons(dragonId1, dragonId2)
    if (dragons == null || dragons[0] == null || dragons[1] == null) return null

    // console.log(dragons[0])
    // console.log(dragons[1])

    let battleLog = []
    let dragonAttacking = Math.floor(Math.random() * 2)

    while(dragons[0].Health > 0 && dragons[1].Health > 0) {
        let isCriticalStrike = Math.floor(Math.random() * 100) < dragons[dragonAttacking].Luck * 5
        let attackValue = Math.floor(Math.random() * 20) + dragons[dragonAttacking].Attack + (isCriticalStrike ? 5 : 0)
        attackValue -= dragons[1 - dragonAttacking].Defense
        if (attackValue < 0) {
            attackValue = 0
        }

        let battleAction = {
            dragon: dragonAttacking + 1,
            attackValue: attackValue,
            isCriticalStrike: isCriticalStrike
        }

        dragons[1 - dragonAttacking].Health -= attackValue

        battleLog.push(battleAction)
        dragonAttacking = 1 - dragonAttacking
    }

    battleLog.winner = dragons[0].Health <= 0 ? 2 : 1

    return battleLog
}

async function fetchDragons(dragonId1, dragonId2) {
    let dragons = []

    // dragons.push({
    //     "traits": [
    //         {
    //             "trait_type": "Breed",
    //             "value": "Green",
    //             "display_type": null,
    //             "max_value": null,
    //             "trait_count": 298,
    //             "order": null
    //         },
    //         {
    //             "trait_type": "Rarity",
    //             "value": "Common",
    //             "display_type": null,
    //             "max_value": null,
    //             "trait_count": 498,
    //             "order": null
    //         },
    //         {
    //             "trait_type": "Defense",
    //             "value": 8,
    //             "display_type": "number",
    //             "max_value": null,
    //             "trait_count": 106,
    //             "order": null
    //         },
    //         {
    //             "trait_type": "Luck",
    //             "value": 2,
    //             "display_type": "number",
    //             "max_value": null,
    //             "trait_count": 98,
    //             "order": null
    //         },
    //         {
    //             "trait_type": "Attack",
    //             "value": 10,
    //             "display_type": "number",
    //             "max_value": null,
    //             "trait_count": 107,
    //             "order": null
    //         }
    //     ],
    // })
    // dragons.push({
    //     "traits": [
    //         {
    //             "trait_type": "Breed",
    //             "value": "Grey",
    //             "display_type": null,
    //             "max_value": null,
    //             "trait_count": 600,
    //             "order": null
    //         },
    //         {
    //             "trait_type": "Rarity",
    //             "value": "Rare",
    //             "display_type": null,
    //             "max_value": null,
    //             "trait_count": 335,
    //             "order": null
    //         },
    //         {
    //             "trait_type": "Luck",
    //             "value": 2,
    //             "display_type": "number",
    //             "max_value": null,
    //             "trait_count": 98,
    //             "order": null
    //         },
    //         {
    //             "trait_type": "Attack",
    //             "value": 10,
    //             "display_type": "number",
    //             "max_value": null,
    //             "trait_count": 107,
    //             "order": null
    //         },
    //         {
    //             "trait_type": "Defense",
    //             "value": 1,
    //             "display_type": "number",
    //             "max_value": null,
    //             "trait_count": 88,
    //             "order": null
    //         }
    //     ],
    // })

    dragons.push(await seaport.api.getAsset({
        tokenAddress: "0x91a96a8ed695b7c59c01f845f7bb522fe906d88d",
        tokenId: dragonId1
    }))

    dragons.push(await seaport.api.getAsset({
        tokenAddress: "0x91a96a8ed695b7c59c01f845f7bb522fe906d88d",
        tokenId: dragonId2
    }))

    // console.log("asset:")
    // console.log(asset)

    // console.log("dragons: " + dragons)

    // await Axios.get(`https://api.opensea.io/api/v1/asset/0x91a96a8ed695b7c59c01f845f7bb522fe906d88d/${dragonId1}`, {
    //     params: {
    //     },
    //   }).then((response) => { 
    //       console.log(response)
    //   })

    // dragons.push(await fetch(`https://api.opensea.io/api/v1/asset/0x91a96a8ed695b7c59c01f845f7bb522fe906d88d/${dragonId1}`)
    // .then((res) => { return res })
    // .catch((e) => {
    //   console.error(e)
    //   console.error('Could not talk to OpenSea')
    //   return null
    // }))

    // dragons.push(await fetch(`https://api.opensea.io/api/v1/asset/0x91a96a8ed695b7c59c01f845f7bb522fe906d88d/${dragonId2}`)
    // .then((res) => { return res })
    // .catch((e) => {
    //   console.error(e)
    //   console.error('Could not talk to OpenSea')
    //   return null
    // }))

    if (dragons == null || dragons[0] == null || dragons[1] == null) return null

    let dragonsSimplified = []
    for(let i = 0; i < dragons.length; i ++) {
        dragonsSimplified.push({
            Health: typeToHealth(dragons[i].traits.filter(e => e.trait_type == "Breed")[0].value),
            Attack: dragons[i].traits.filter(e => e.trait_type == "Attack")[0].value,
            Luck: dragons[i].traits.filter(e => e.trait_type == "Luck")[0].value,
            Defense: dragons[i].traits.filter(e => e.trait_type == "Defense")[0].value
        })
    }

    // console.log("dragonsSimplified: " + dragonsSimplified)
    console.log("dragonsSimplified[0]: " + JSON.stringify(dragonsSimplified[0]))
    console.log("dragonsSimplified[1]: " + JSON.stringify(dragonsSimplified[1]))

    return dragonsSimplified
}

function typeToHealth(breed) {
    if (breed == "Green") {
        return 55
    }
    if (breed == "Gold") {
        return 60
    }
    if (breed == "Red") {
        return 70
    }
    
    return 50
}
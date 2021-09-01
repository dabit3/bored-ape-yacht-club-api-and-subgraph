import {
  Token as TokenContract,
  Transfer as TransferEvent
 } from "../generated/Token/Token"
 
 import {
  Token, User
 } from '../generated/schema'

 import { log, ipfs, json } from '@graphprotocol/graph-ts'

 let baseHash = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq"
 let fullIPFSURI = "ipfs.io/ipfs/" + baseHash + "/"
 
 export function handleTransfer(event: TransferEvent): void {
  
  var token = Token.load(event.params.tokenId.toString());
  if (!token) {    
    token = new Token(event.params.tokenId.toString());
    token.creator = event.params.to.toHexString();
    token.tokenID = event.params.tokenId;
    token.createdAtTimestamp = event.block.timestamp;
  }
  let tokenContract = TokenContract.bind(event.address);

  let baseURI = tokenContract.baseURI()
  let contentURI = tokenContract.tokenURI(event.params.tokenId);

  if (baseURI.includes('https')) {
    baseURI = fullIPFSURI;
  } else if (baseURI.includes('ipfs')) {
    let hash = baseURI.split('ipfs://').join('')
    baseURI = "ipfs.io/ipfs" + hash
  }

  if (contentURI.includes('https')) {
    contentURI = fullIPFSURI + event.params.tokenId.toString();
  } else {
    let hash = contentURI.split('ipfs://').join('')
    contentURI = "ipfs.io/ipfs/" + hash + event.params.tokenId.toString();
  }

  token.contentURI = contentURI;
  token.baseURI = baseURI;

  if (contentURI != "") {
    let hash = contentURI.split('ipfs.io/ipfs/').join('')
    let data = ipfs.cat(hash)
    
    if (!data) return
    let value = json.fromBytes(data!).toObject()

    if (data != null) {
      let attributes = value.get('attributes').toArray()

      for (let i = 0; i < attributes.length; i++) {
        let item = attributes[i].toObject()
        let trait = item.get('trait_type').toString()
        let value = item.get('value').toString()

        if (trait == "Mouth") {
          token.mouth = 'Bored Cigarette'
        }

        if (trait == "Eyes") {
          token.eyes = value
        }

        if (trait == "Background") {
          token.background = value
        }

        if (trait == "Hat") {
          token.hat = value
        }

        if (trait == "Clothes") {
          token.clothes = value
        }

        if (trait == "Fur") {
          token.fur = value
        }

        if (trait == "Earring") {
          token.earring = value
        }
      }
    }
  }

  token.owner = event.params.to.toHexString();
  token.save();
 
  let user = User.load(event.params.to.toHexString());
  if (!user) {
    user = new User(event.params.to.toHexString());
    user.save();
  }
 }

// import {
//   Token as TokenContract,
//   Transfer as TransferEvent
//  } from "../generated/Token/Token"
 
//  import {
//   Token, User
//  } from '../generated/schema'

//  import { log, ipfs, json } from '@graphprotocol/graph-ts'

//  let ipfsURI = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/"
 
//  export function handleTransfer(event: TransferEvent): void {
  
//   var token = Token.load(event.params.tokenId.toString());
//   if (!token) {    
//     token = new Token(event.params.tokenId.toString());
//     token.creator = event.params.to.toHexString();
//     token.tokenID = event.params.tokenId;
//     token.createdAtTimestamp = event.block.timestamp;
//   }
//   let tokenContract = TokenContract.bind(event.address);

//   let baseURI = tokenContract.baseURI()
//   let contentURI = tokenContract.tokenURI(event.params.tokenId);

//   if (baseURI.includes('https')) {
//     baseURI = ipfsURI;
//   }

//   if (contentURI.includes('https')) {
//     contentURI = ipfsURI + event.params.tokenId.toString();
//   }

//   token.contentURI = contentURI;
//   token.baseURI = baseURI;

//   if (contentURI != "") {
//     let hash = contentURI.split('ipfs://').join('')
//     let data = ipfs.cat(hash)
//     let value = json.fromBytes(data!).toObject()
    
//     log.info("data:::: {}", [data.toString()])
//     log.info("hash:::: {}", [hash])

//     if (data != null) {
//       let attributes = value.get('attributes').toArray()

//       for (let i = 0; i < attributes.length; i++) {
//         let item = attributes[i].toObject()
//         let trait = item.get('trait_type').toString()
//         let value = item.get('value').toString()

//         if (trait == "Mouth") {
//           token.mouth = 'Bored Cigarette'
//         }

//         if (trait == "Eyes") {
//           token.eyes = value
//         }

//         if (trait == "Background") {
//           token.background = value
//         }

//         if (trait == "Hat") {
//           token.hat = value
//         }

//         if (trait == "Clothes") {
//           token.clothes = value
//         }

//         if (trait == "Fur") {
//           token.fur = value
//         }

//         if (trait == "Earring") {
//           token.earring = value
//         }
//       }

//     }
//   }

//   token.owner = event.params.to.toHexString();
//   token.save();
 
//   let user = User.load(event.params.to.toHexString());
//   if (!user) {
//     user = new User(event.params.to.toHexString());
//     user.save();
//   }
//  }


 /*
 logging info in working example

 Hash
 QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/271

 data
 data:::: {"image":"ipfs://QmVQsuBRpLbAXHVg183L6juFUyWoySf6vvrT7nRNwUtTMb","attributes":[{"trait_type":"Eyes","value":"Coins"},{"trait_type":"Mouth","value":"Phoneme L"},{"trait_type":"Hat","value":"Halo"},{"trait_type":"Background","value":"Orange"},{"trait_type":"Fur","value":"Dark Brown"}]}

 non working example
 data
 data:::: {"image":"ipfs://QmSK1HJCiMuNahMyNBq7puEwBBUWjzjeCnQwCVgRaqkVJP","attributes":[{"trait_type":"Mouth","value":"Bored Unshaven"},{"trait_type":"Eyes","value":"Wide Eyed"},{"trait_type":"Fur","value":"Red"},{"trait_type":"Background","value":"Army Green"},{"trait_type":"Clothes","value":"Guayabera"}]}
 */
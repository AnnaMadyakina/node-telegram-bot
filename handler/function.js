let arrAllAbonent = [
    {
        number: 1111,
        coldNumber: 568595, lastCold: 15.9, newCold: 25.5,
        hotNumber: 589525, lastHot: 16.3, newHot: 26.7
          
    },
    {
        number: 2222,
        coldNumber: 569823, lastCold: 79.2, newCold: 84.7,
        hotNumber: 569813, lastHot: 85, newHot: 87.3
          
    },
    {
        number: 3333,
        coldNumber: 650326, lastCold: 105, newCold: 115.7,
        hotNumber: 789530, lastHot: 130, newHot: 140.3
          
    },
    {
        number: 4444,
        coldNumber: 785602, lastCold: 116, newCold: 120.9,
        hotNumber: 569803, lastHot: 118, newHot: 130.7
          
    },
]

module.exports = {
    async  findAbonent (number) {
        //await достаем из бд нужного абонента по номеру
        let OneAbonent = arrAllAbonent.filter(el => el.number == number)
        return OneAbonent
    },

    
    async newMeters (number, numberMeters, newMeters) {
        //await в базе меняем значения, и возвращаем новые данные
        const index = (number) => {
            for(let i = 0; i < arrAllAbonent.length; i++) {
                if(arrAllAbonent[i].number == number) {
                  return i  
                }
            }
        }
        const indexOfarr = index(number)
        const abonent = arrAllAbonent[indexOfarr];

        if(abonent.coldNumber == numberMeters) {
            abonent.lastCold = abonent.newCold; 
            abonent.newCold = newMeters  
        }
        if(abonent.hotNumber == numberMeters) {
            abonent.lastHot =  abonent.newHot; 
            abonent.newHot = newMeters  
        }
        return abonent
    } 
}


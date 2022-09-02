//не забудьте выполнить команду npm i
//запустить проект можно командой npm run dev
const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController;
const TextCommand = Telegram.TextCommand
//вставьте токен вашего бота
const token = ''
const tg = new Telegram.Telegram(token, { workers: 1})
const findAbonent = require('./handler/function')

class HelloController extends TelegramBaseController {
    //ответ на /start
    handle($) {
        $.sendMessage(`Добро пожаловать в телеграмм бот УК «Надежный дом».
                      ${'\n'}Для получения информации об УК отправьте команду /info.
                      ${'\n'}Для передачи показаний отправьте команду /meters.`)
    }
}

class InfoController extends TelegramBaseController {
       //ответ на /info
    handle($) {
        $.sendMessage(`Ваш дом обслуживает УК «Надежный дом», телефон для связи 8-800-888-88-88.
                      ${'\n'}Для передачи показаний отправьте команду /meters.`)
    }
}

class MetersController extends TelegramBaseController {
    handle($) {
    //форма для запроса номера абонента
    const form = {
         abonentNumber: {
             q: `Введите номер абонента (4 цифры).`,
             error: `Данный абонент не зарегестрирован, проверьте введенные данные или обратитесь в УК.`,
             validator: async (message, cd) => {
                 if(message.text) {
                 cd(true, message.text)
                 return
                 } 
                 cd(false)   
            }
         }
     }
    $.runForm(form, async (result) => {
        const numberAbonent = result.abonentNumber.replace(/\s/g, '');
        const arAabonent =  await findAbonent.findAbonent(numberAbonent)
        const abonent = arAabonent[0]
        //если абонент есть
        if(abonent) {
            const {number, coldNumber, newCold, hotNumber,  newHot} =  abonent;
            //показываем данные абонента
            $.runMenu({
                message: `Номер абонента: ${number}, 
                         ${'\n'}ХВС №${coldNumber}, предыдущее показание ${newCold},
                         ${'\n'}ГВС №${hotNumber}, предыдущее показание ${newHot}.`,
                oneTimeKeyboard: true,
                resizeKeyboard: true,

                'Передать новые показания': () => {
                    //форма для ввода новых показаний
                    const metersForm = {
                        newCold: {
                        q: `Введите новые показания ХВС №${coldNumber}, предыдущее ${newCold}.`,
                        error: `Вы ввели недопустимое значение,
                                ${'\n'}новое показание не может быть меньше предыдущего.`,
                        validator: (message, cd) => {
                            //проверка введенных данных и преобразование их к чисду с одним символом после .
                            if(message.text.toLowerCase() == 'отменить'){
                                cd(true)
                                return
                            }
                            const num = (ms) =>{
                                let arr = ms.replace(/\s/g, '').split('').map(el => el == ',' ? el = '.' : el).join('')
                                let number = Number(arr).toFixed(1)
                                return +number
                            } 
                            const inputNum = num(message.text) 
                            if(inputNum >= newCold && inputNum <= 999) {
                                cd(true, message.text)
                                return
                            } 
                            cd(false)
                            }
                        }, 
                        newHot: {
                        q: `Введите новые показания ГВС №${hotNumber}, предыдущее ${newHot}.`,
                        error: `Вы ввели недопустимое значение,
                                ${'\n'}новое показание не может быть меньше предыдущего.`,
                        validator: (message, cd) => {
                            //проверка введенных данных и преобразование их к чисду с одним символом после .
                            if(message.text.toLowerCase() == 'отменить'){
                                cd(true)
                                return
                            }
                            const num = (ms) =>{
                                let arr = ms.replace(/\s/g, '').split('').map(el => el == ',' ? el = '.' : el).join('')
                                let number = Number(arr).toFixed(1)
                                return +number
                            } 
                            const inputNum = num(message.text)
                            if(inputNum >= newHot && inputNum <= 999) {
                            cd(true, message.text)
                            return
                            }
                            cd(false)
                            }
                        }
                    }
                    $.runForm(metersForm, async(res) => {
                        if(res.newCold && res.newHot){
                        const num = (ms) =>{
                            let arr = ms.replace(/\s/g, '').split('').map(el => el == ',' ? el = '.' : el).join('')
                            let number = Number(arr).toFixed(1)
                            return +number
                        } 
                        const newMetersCold = num(res.newCold);
                        const newMetersHot = num(res.newHot)
                        //итог введенных показаний, кнопки подтвердить, отменить
                        $.runMenu({
                            message: `Счетчик №${coldNumber},
                                ${'\n'}предыдущее показание ${newCold},
                                ${'\n'}новое показание ${newMetersCold}.
                                ${'\n'}Счетчик №${hotNumber},
                                ${'\n'}предыдущее показание ${newHot},
                                ${'\n'}новое показание ${newMetersHot}.`,
                            resizeKeyboard: true,
                            oneTimeKeyboard: true,
                           //сохраняем новые значения
                            'Подтвердить': async () => {
                                const coldMeters =  await findAbonent.newMeters(number, coldNumber, newMetersCold)
                                const hotMeters =  await findAbonent.newMeters(number, hotNumber, newMetersHot)
                                if(hotMeters.newHot == newMetersHot && coldMeters.newCold == newMetersCold) {
                                 $.sendMessage(`Показания успешно приняты, абонент №${number}, новые значения:
                                                ${'\n'} ХВС №${coldNumber}: ${newMetersCold},
                                                ${'\n'} ГВС №${hotNumber}: ${newMetersHot},
                                                ${'\n'}Для получения информации об УК отправьте команду /info.
                                                ${'\n'}для передачи новый показаний отправьте команду /meters.`)
                                }
                            },
                            //отменить введенные значения
                            'Отменить': () => $.sendMessage(`Введенные данные отменены.
                            ${'\n'}Для получения информации об УК отправьте команду /info.
                            ${'\n'}Для передачи показаний отправьте команду /meters.`),
                        })
                        } else {
                            $.sendMessage(`Для получения информации об УК отправьте команду /info.
                            ${'\n'}Для передачи показаний отправьте команду /meters.`)    
                        }
                    })

                },
                //выйти из данных абонента
                'Назад': () => {
                    $.sendMessage(`Для получения информации об УК отправьте команду /info.
                                   ${'\n'}Для передачи показаний отправьте команду /meters.`)
                }
            })
        //если абонента нет
        } else {
            $.sendMessage(`Абонент №${result.abonentNumber} не зарегестрирован, проверьте номер или обратитесь в УК. Больше информации об УК по команде /info
                          ${'\n'}Для ввода нового номера отправьте команду /meters`)
        }
        })
    }
}

class OtherwiseController extends TelegramBaseController {
       //ответ на неизвестные запросы
    handle($) {
        $.sendMessage(`Извините, я не понимаю вашу команду, чтобы узнать чем я могу помочь отправьте /start`)
    }
}


tg.router
.when( new TextCommand('/start'), new HelloController())
.when( new TextCommand('/info'), new InfoController())
.when( new TextCommand('/meters'), new MetersController())
.otherwise(new OtherwiseController())


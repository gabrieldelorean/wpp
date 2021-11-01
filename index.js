const express = require('express');
const app = express();
const wppconnect = require('@wppconnect-team/wppconnect');
const FileType = require('file-type');
const fs = require('fs');
const { group } = require('console');


const TeleBot = require('telebot');
const bot = new TeleBot('1966751229:AAFWeQ-7TpYdmYeebW1WWdSuhMp3Dn_9FU0');
const groupWpp = ['5511979545651-1619295340@g.us','5511981284968-1631902841@g.us'];
var serveIndex = require('serve-index');
const e = require('express');
const db = require("./db");
const appWs = require('./websocket');

app.use(express.static(__dirname + "/"))
app.use('/files', serveIndex(__dirname + '/files'));



var Instancia; //variável que receberá o cliente para ser chamada em outras funções da lib
                //variable that the client will receive to be called in other lib functions

app.use(express.json());//parser utizado para requisições via post,....parser used for requests via post,
app.use(express.urlencoded({ extended : true }));

app.get('/insert', async function (req, res) {
    (async () => {
        const db = require("./db");
    const clientes = await db.selectCustomers();
    res.send(clientes);
})();
});

app.get('/update', async function (req, res) {
    (async () => {
        const db = require("./db");
        // console.log(req.query.idwpp);
    const clientes = await db.updateCustomer(req.query.id,{wppid: req.query.idwpp, tlid: req.query.idtl});
    res.send(clientes);
})();
});

app.get('/set', function(req, res){
    (async () => {
        const db = require("./db");
        const result = await db.insertCustomer({wppid: req.query.idwpp, tlid: req.query.idtl});
        res.send(result);
})();
    
  });

  app.get('/hasconnection', function(req, res){
    (async () => {
        const db = require("./db");
        const result = await db.selectOneChat(req.query.idwpp);
        res.send(result);
})();
    
  });

app.get('/result', async function (req, res) {
    if(Instancia)
    Instancia.getAllChats(false).then((result)=>{
        let grupos = [];
        result.forEach(element => {
            if(element.name) grupos.push({name:element.name,idtl:element.id._serialized});
        });
        res.send(grupos);
    });

  
});

app.get('/getconnectionstatus', async function (req, res) {

    console.log("Solicitou status de conexao");
    console.log("Requested connection status");

    var mensagemretorno =''; //mensagem de retorno da requisição ... request return message
    var sucesso = false; //Se houve sucesso na requisição ... If the request was successful
    var return_object;

    const executa = async()=>{

            if (typeof(Instancia) === "object"){ // Validando se a lib está iniciada .... Validating if lib is started
                mensagemretorno = await Instancia.getConnectionState(); // validadado o estado da conexão com o whats 
                                                                //whats connection status validated
                sucesso = true;
            }else{
                mensagemretorno = 'A instancia não foi inicializada - The instance was not initialized';               
            }
            return_object = {
                status : sucesso,
                message :mensagemretorno,           
            };
            res.send(return_object); 
    };
    executa();

  });

app.post('/sendmessage', async function (req, res) {

    console.log("Solicitou envio de mensagem VIA POST");
    console.log("Requested sending VIA POST message");

    //parametros vindos na requisição ... parameters coming in the request
    var telnumber = req.body.telnumber;
    var mensagemparaenvio = req.body.message;
    //***********/

    var mensagemretorno =''; //mensagem de retorno da requisição ... request return message
    var sucesso = false; //Se houve sucesso na requisição ... If the request was successful
    var return_object;

    const executa = async()=>{

            if (typeof(Instancia) === "object"){ // Validando se a lib está iniciada .... Validating if lib is started
                status = await Instancia.getConnectionState(); 
                // validadado o estado da conexão com o whats 
                //whats connection status validated
                if(status === 'CONNECTED'){
                    let numeroexiste = await Instancia.checkNumberStatus(telnumber+'@c.us');  //Validando se o número existe ... Validating if the number exists
                    if(numeroexiste.canReceiveMessage===true){
                       await Instancia
                            .sendText(numeroexiste.id._serialized, mensagemparaenvio)
                            .then((result) => {
                                // console.log('Result: ', result); //return object success
                                sucesso=true;
                                mensagemretorno=result.id;
                            })
                            .catch((erro) => {
                                console.error('Error when sending: ', erro); //return object error
                            });
                    }else{
                        mensagemretorno='O numero não está disponível ou está bloqueado - The number is not available or is blocked.';
                    }
                }else{                          
                    mensagemretorno = 'Valide sua conexao com a internet ou QRCODE - Validate your internet connection or QRCODE';
                }
            }else{
                mensagemretorno = 'A instancia não foi inicializada - The instance was not initialized';               
            }
            return_object = {
                status : sucesso,
                message :mensagemretorno,           
            };
            res.send(return_object); 
    };
    executa();

  });

  
startWPP(); //chama a função para inicializar a lib...... call function to initialize the lib

async function startWPP (){ 
    await wppconnect.create({session: 'Gabriel',
        catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
               atm.qrcode(base64Qr);
    },  
    statusFind: (statusSession, session) => {
        console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
          if(statusSession == "inChat" || statusSession == "isLogged"  ){
            atm.closeqrcode();
          }if(statusSession == "desconnectedMobile")
             {
                try{ 
                  Instancia.logout();
                   startWPP();  
                   }catch(r){}
              }

    
     
        // console.log('Session name: ', session);
    },
        headless: true, // Headless chrome
        devtools: false, // Open devtools by default
        useChrome: true, // If false will use Chromium instance
        debug: true, // Opens a debug session
        logQR: true, // Logs QR automatically in terminal
        browserWS: '', // If u want to use browserWSEndpoint
        browserArgs:  ["--no-sandbox"], // Parameters to be added into the chrome browser instance
        puppeteerOptions: {userDataDir: './tokens', headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
        disableWelcome: true, // Option to disable the welcoming message which appears in the beginning
        updatesLog: true, // Logs info updates automatically in terminal
        autoClose: 0, // Automatically closes the wppconnect only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
        tokenStore: 'file', // Define how work with tokens, that can be a custom interface
        folderNameToken: './tokens', //folder name when saving tokens
    }).then((client) => {
        console.log("criou");
        start(client);
    }).catch((erro) => console.log(erro));

   console.log("passou");
}


async function dataUrlToFile(chatId,message,type){
    const buffer = await Instancia.downloadMedia(message)
  

    switch (type) {
        case "imagem":
                    await fs.writeFile(__dirname + "/files/"+message.id+'.jpeg',buffer.split(';base64,').pop(), {encoding: 'base64'}, function(err) {
                        let fileUpload = fs.createReadStream(__dirname + '/files/'+message.id+'.jpeg');
                        // groupTl.forEach(chatId => {
                            bot.sendPhoto(chatId,fileUpload,{caption:  message.caption  ? message.caption:null}).then((response) => {
                                console.log('Ok:', response);
                            }).catch((error) => {
                                console.log('Error:', error);
                            });
                        // });     
                    });
            break;
            case "voz":
                await fs.writeFile(__dirname + "/files/"+message.id+'.mp3',buffer.split(';base64,').pop(), {encoding: 'base64'}, function(err) {
                    let fileUpload = fs.createReadStream(__dirname + '/files/'+message.id+'.mp3');
                    // groupTl.forEach(chatId => {
                        bot.sendVoice(chatId,fileUpload,{caption:  message.caption  ? message.caption:null}).then((response) => {
                            console.log('Ok:', response);
                        }).catch((error) => {
                            console.log('Error:', error);
                        });
                    // });     
                });
            break;
            case "video":
                await fs.writeFile(__dirname + "/files/"+message.id+'.mp4',buffer.split(';base64,').pop(), {encoding: 'base64'}, function(err) {
                    let fileUpload = fs.createReadStream(__dirname + '/files/'+message.id+'.mp4');
                    // groupTl.forEach(chatId => {
                        bot.sendVideo(chatId,fileUpload,{caption:  message.caption  ? message.caption:null}).then((response) => {
                            console.log('Ok:', response);
                        }).catch((error) => {
                            console.log('Error:', error);
                        });
                    // });     
                });
            break;
            case "figurinha":
                await fs.writeFile(__dirname + "/files/"+message.id+'.webp',buffer.split(';base64,').pop(), {encoding: 'base64'}, function(err) {
                    let fileUpload = fs.createReadStream(__dirname + '/files/'+message.id+'.webp');
                    // groupTl.forEach(chatId => {
                        bot.sendSticker(chatId,fileUpload,{caption:  message.caption  ? message.caption:null}).then((response) => {
                            console.log('Ok:', response);
                        }).catch((error) => {
                            console.log('Error:', error);
                        });
                    // });     
                });
            break;
        default:
            break;
    }

}

async function verifyMessage(message){
    const clientes = await db.selectCustomers();        
    for (const chatId of clientes) {
        console.log(chatId.wppid,message.chatId)
        if(chatId.wppid === message.chatId){
            if(message.isMedia){
                if(message.type == "video"){
                    await dataUrlToFile(chatId.tlid,message,"video");
                  
                  }      
                  if(message.type == "image"){            
                      await dataUrlToFile(chatId.tlid,message,"imagem");
       
                  }
              }
              else{
                //   mensagem de audio
                  if(message.type == "ptt"){
                      await dataUrlToFile(chatId.tlid,message,"voz"); 
                  }
                //   sticker 
                  if(message.type == "sticker"){
                      await dataUrlToFile(chatId.tlid,message,"figurinha");   
                  }
      
                  if(message.type == "chat"){
                       // envia mensagem de texto para cada grupo do telegram  
                               bot.sendMessage(chatId.tlid,message.content).then((response) => {
                               
                               }).catch((error) => {
                                  
                               });
                          
                           } else {
                               // Socketid not found
                           }
                   
                          
                        
                  }
        }
    }
  
 
}

async function start(client) {
    
    Instancia = client; //Será utilizado nas requisições REST ..... It will be used in REST requests
    
    client.onAnyMessage( async (message) => {       
        verifyMessage(message);
    }); 
}

const porta = '3001'; 
var server = app.listen(porta);
var atm = appWs(server);
console.log('Servidor iniciado na porta %s', server.address());

async function connect(){
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;
 
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection("mysql://root:password@db:3306/wpp");
    console.log("Conectou no MySQL!");
    global.connection = connection;
    return connection;
}

async function selectOneChat(chatid){
    const conn = await connect();
    const [row] = await conn.query('SELECT * FROM crud WHERE wppid = ?;',chatid);
    return row;
}

async function selectCustomers(){
    const conn = await connect();
    const [rows] = await conn.query('SELECT * FROM crud;');
    return rows;
}
 
// (async () => {
//     const db = require("./db");
//     console.log('Começou!');
 
//     console.log('SELECT * FROM CLIENTES');
//     const clientes = await db.selectCustomers();
//     console.log(clientes);
// })();
async function insertCustomer(customer){
    const conn = await connect();
    const sql = 'INSERT INTO crud(wppid,tlid) VALUES (?,?);';
    const values = [customer.wppid, customer.tlid];
    return await conn.query(sql, values);
}





 // (async () => {
//     const db = require("./db");
//     console.log('Começou!');
    
//     console.log('INSERT INTO CLIENTES');
//     const result = await db.insertCustomer({nome: "Zé", idade: 18, uf: "SP"});
//     console.log(result);
 
//     console.log('SELECT * FROM CLIENTES');
//     const clientes = await db.selectCustomers();
//     console.log(clientes);
// })();

// async function updateCustomer(id, customer){
//     const conn = await connect();
//     const sql = 'UPDATE clientes SET nome=?, idade=?, uf=? WHERE id=?';
//     const values = [customer.nome, customer.idade, customer.uf, id];
//     return await conn.query(sql, values);
// }

async function updateCustomer(id, customer){
    const conn = await connect();
    const sql = 'UPDATE crud SET wppid=?, tlid=?  WHERE id=?';
    const values = [customer.wppid, customer.tlid, id];
    return await conn.query(sql, values);
}


// -1001505875011
// [PR TIPS - NICOLAS - VARZEA] | Repasse Premium


// id: -1001324632550,
// web_1  |     title: '[PR TIPS - XAPA FUTSAL] | Repasse Premium',


// web_1  |     id: -1001674230031,
// web_1  |     title: '[PR TIPS - LARA FUTSAL] | Repasse Premium',git


// console.log('UPDATE CLIENTES');
// const result2 = await db.updateCustomer(6, {nome: "Zé José", idade: 19, uf: "SP"});
// console.log(result2);

async function deleteCustomer(id){
    const conn = await connect();
    const sql = 'DELETE FROM clientes where id=?;';
    return await conn.query(sql, [id]);
}


// console.log('DELETE FROM CLIENTES');
// const result3 = await db.deleteCustomer(7);
// console.log(result3);

module.exports = {selectCustomers, insertCustomer, updateCustomer, deleteCustomer,selectOneChat,updateCustomer}
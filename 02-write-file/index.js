const {stdout,stdin,exit} = process;
const fs = require('fs');
const path = require('path');
let result ='';

stdout.write('How do you do!\n');
stdout.write('Enter any data to load in file\n');
stdin.on("data",data=>{ 
    result+=data.toString();
    fs.writeFile(path.join(__dirname,"input.txt"),result,(err)=>{
        if (err) throw Error(err);
        console.log(`файл записан ${path.join(__dirname,"input.txt")}\n`);
//        process.exit();
    });    
});
///*******/
fs.writeFile(path.join(__dirname,'text.txt'),'',(err)=>{
    if(err) {throw err; }
    console.log("файл text.txt создан")
});

stdout.write('Вводите данные для записи в файл');
const wrtestream = fs.createWriteStream(path.join(__dirname,'text.txt'));

stdin.on("data", data=>{
    wrtestream.write(data.toString(),(err)=>{ if (err) throw err;});    
})

stdin.on('end',()=>process.exit());

process.on('exit',(code)=>{ 
    console.log(`В файл вы записали: ${result}` );
    console.log('Завершение работы, файл записан'); 
})

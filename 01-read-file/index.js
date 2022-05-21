const fs = require('fs');
const path = require('path');
const output = fs.createReadStream(path.join(__dirname,'text.txt'));
const {stdout,exit} = process;
let len = 0, data ='';

output.on("data",chunk=>{
    if (!len) stdout.write('Начало чтения из файла\n');
    len+=chunk.length; data+=chunk;    
})

output.on("end",()=>{
    stdout.write(__dirname+'\n');
    stdout.write(__filename+'\n');  
    stdout.write(data); 
    exit(); 
})

process.on('exit',(len)=>{    
    stdout.write(`Прочитано: ${len}kb!\n Всего хорошего!`)
})

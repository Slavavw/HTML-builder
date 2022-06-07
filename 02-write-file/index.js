const {stdout,stdin,exit} = process;
const fs = require('fs');
const path = require('path');
const { rawListeners } = require('process');
let result ='';

const pathFile = path.join(__dirname,'text.txt')

const readline = require("readline");
const rs = readline.createInterface({input:stdin, output:stdout});

let fileText = fs.createWriteStream(pathFile);
readline.emitKeypressEvents(process.stdin);

stdin.on("keypress",(_,key)=>{
    if (key && key.ctrl && key.name === 'c'){
        console.log("\nGood by! You whant go out and stop record!");
    }
})


function write(){
    rs.question("Enter anything?",(str)=>{
        if ( /exit/i.test(str)){
            console.log("\nGood by! You whant go out and stop record!");
            rs.close();
        }
        else{
            fileText.write(str.concat("\n"), err=>{ if (err) throw err;});
            console.log(str);
            write();
        }
    })
}

write();


/* вариат 2
const writestream = fs.createWriteStream(path.join(__dirname,'text.txt'));
stdout.write('How do you do!\n');
stdout.write('Enter any data to load in file\n');

stdin.on("data",data=>{ 
    result+=data.toString();
    fs.writeFile(path.join(__dirname,"input.txt"),result,(err)=>{
        if (err) throw Error(err);
        console.log(`файл записан ${path.join(__dirname,"input.txt")}\n`);//        
    });    
});
fs.writeFile(path.join(__dirname,'text.txt'),'',(err)=>{
    if(err) {throw err; }
    console.log("файл text.txt создан")
});

stdout.write('Вводите данные для записи в файл');


stdin.on("data", data=>{
    writestream.write(data.toString(),(err)=>{ if (err) throw err;});    
})

stdin.on('end',()=>process.exit());

process.on('exit',(code)=>{ 
    console.log(`В файл вы записали: ${result}` );
    console.log('Завершение работы, файл записан'); 
})
*/

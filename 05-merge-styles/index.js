/* eslint-disable indent */
const fs = require('fs');
const path = require('path');
const promise = fs.promises;
const fileDistianion = path.join(__dirname,'project-dist','bundle.css');
const sourceDir = path.join(__dirname,'styles');

async function start (){
    try{
        await fs.exists(fileDistianion, async (e)=>{
            if (!e)  await promise.mkdir(path.join(__dirname,'project-dist'));
            else await promise.unlink(fileDistianion); 
            await Execute(fs.createWriteStream(fileDistianion,'utf-8'));            
        });        
    }
    catch(err) {console.log(err);}
}

async function Execute(resFile){    
    let files = await promise.readdir(sourceDir,{encoding:"utf-8"});
    for await( let file of files ){    
        if ( /(css)$/i.test(path.extname(file))){
            const readableStream = fs.createReadStream(path.join(sourceDir,file),'utf-8');
            readableStream.pipe(resFile);            
        }
    }
}

start();

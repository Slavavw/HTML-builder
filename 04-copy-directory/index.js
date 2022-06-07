/* eslint-disable quotes */
/* eslint-disable indent */
const fs = require('fs');
const path = require('path');
const fs_promise = fs.promises;
const outputDir = path.join(__dirname,'files');
const inputDir = path.join(__dirname,'files-copy');

async function start(){
    try {
        await fs.exists(inputDir, async (exit) =>{            
            if (!exit) {await fs_promise.mkdir(inputDir); await readFileInDir();}
            else {
                console.log('Папка была ранее создана обновим ее, перезаписав');
                let files =  await fs_promise.readdir(inputDir);            
                for await ( let file of files ){ 
                    console.log("Удаляем файл:",file);
                    await fs_promise.unlink(path.join(inputDir,file));                
                }
                await readFileInDir();             
            }            
        });                
    }catch (e) { console.log(e); }
};  

async function readFileInDir(){
    try {
        const files = await fs_promise.readdir(outputDir);
        for await (const file of files){
            console.log("создаем файл:",file);
            let output = fs.createReadStream(path.join(outputDir,file),"utf8");
            let input = fs.createWriteStream(path.join(__dirname,'files-copy',file),"utf-8");
            output.pipe(input);       
        }
     }catch (err) { console.error(err);}
}

 start();

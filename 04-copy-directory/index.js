/* eslint-disable quotes */
/* eslint-disable indent */
const fs = require('fs');
const path = require('path');
const fs_promise = fs.promises;
const outputDir = path.join(__dirname,'files');
const inputDir = path.join(__dirname,'files-copy');

(async function(){
    try {
        const exists = fs.existsSync(inputDir);
        if (!exists)  await fs_promise.mkdir(inputDir);
        else {console.log('Папка была ранее создана обновим ее, перезаписав');
            let files =  await fs_promise.readdir(inputDir);            
            for ( let file of files ){            
                console.log(file);
                await fs_promise.unlink(path.join(inputDir,file));                
            }             
        }
    } catch (e) { console.log(e); }
})();  

async function readFileInDir(){
    try {
        const files = await fs_promise.readdir(outputDir);
        for (const file of files){
            let output = fs.createReadStream(path.join(outputDir,file),"utf8");
            let input = fs.createWriteStream(path.join(__dirname,'files-copy',file),"utf-8");
            output.pipe(input);       
        }
     }catch (err) { console.error(err);}
}

 readFileInDir();

const fs = require('fs');
const path = require('path');
const fs_promise = fs.promises;
const outputDir = path.join(__dirname,'files');

const promise_dir = (async function(){
    try {
        const exists = fs.existsSync(path.join(__dirname,'files-copy'));
        if (!exists) {
            fs.mkdir(path.join(__dirname,'files-copy'),err=>{
                if (err) throw err;
                console.log('Папка создана');
            });
        }
        else console.log('Папка была ранее создана');
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

 let res = readFileInDir();

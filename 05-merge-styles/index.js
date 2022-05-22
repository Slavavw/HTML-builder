const fs = require('fs');
const path = require('path');
const promise = fs.promises;
const outputDir = path.join(__dirname,'project-dist','bundle.css');
const inputDir = path.join(__dirname,'styles');

(async function(){      
    let exit = fs.existsSync(outputDir);
    if (!exit) {
        await promise.mkdir(path.join(__dirname,'project-dist'));
        return fs.createWriteStream(outputDir,'utf-8');
    }
    else{
        let response =  await promise.unlink(outputDir);
        console.log( 'bundle.css был удален');            
    }        
    return fs.createWriteStream(outputDir,'utf-8');       
})().then( Execute).catch(err=> console.log(err));


async function Execute(resFile){    
    let files = await promise.readdir(inputDir,{encoding:"utf-8"});
    files.forEach( file =>{    
        if ( /(css)$/i.test(path.extname(file))){
            const readableStream = fs.createReadStream(path.join(inputDir,file),'utf-8');
            readableStream.on("data",chunk =>{                
                resFile.write(chunk.toString(),error=>{console.log(error)});                
            });
            readableStream.on("end",()=>{console.log(`файл ${file} записан`);});        
        }
    })
}


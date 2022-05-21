const fs = require('fs');
const path = require('path');
const {promise} = fs;
const outputDir = path.join(__dirname,'project-dist','bundle.css');
const inputDir = path.join(__dirname,'styles');


let resFile = (function(){
    try{
        let exit = fs.existsSync(outputDir);
        if (!exit) return fs.createWriteStream(outputDir,'utf-8');        
        else {
            fs.unlink(outputDir, (err) => { 
                if (err) console.log(err)    
                else console.log( 'bundle.css был удален')
              })
              return fs.createWriteStream(outputDir,'utf-8');
        }
    }
    catch(e) {console.log(e);}
})();



fs.readdir(inputDir,{encoding:"utf-8"}, (error,files)=>{
    if (error) console.log(error);
    console.log(files);        
    for ( let file of files){        
        if ( /(css)$/i.test(path.extname(file))){
            const readableStream = fs.createReadStream(path.join(inputDir,file),'utf-8');
            readableStream.on("data",chunk =>{                
                resFile.write(chunk.toString(),error=>{console.log(error)});
                //fs.appendFile(outputDir,chunk,()=>{console.log(chunk.toString())});
            });
            readableStream.on("end",()=>{console.log(`файл ${file} записан`);});        
        }
    }
})

    

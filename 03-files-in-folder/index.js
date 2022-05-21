const {stdout,stdin,exit} = process;
const path = require('path');
let fs = require('fs'); fs = fs.promises;
const pathdir = path.join(__dirname,'secret-folder');
/*
console.log(path.basename(__filename));
console.log(path.dirname(__filename));
console.log(path.extname(__filename));
console.log(path.parse(__filename));
console.log(path.basename(__filename));
console.log( path.join(__dirname,'secret-folder'));
import { fs } from 'fs/promises';*/
console.clear();
//***1 вариант */
async function readDirectory(){
try {
  const files = await  fs.readdir(pathdir,{encoding:'utf-8'});  
  for (const file of files) { let root = path.parse(file);
    if ( root.ext ){         
        let filehandle = await fs.open(path.join(pathdir,file),"r");
        let set = await filehandle.stat();
        console.log("отработал промис вариант 1",`---${root.name}---${root.ext.slice(1)}---${set.size}`);
    }
  }
} catch (err) { console.error(err); }};
let promises = readDirectory();

//***2 вариант ****/
const promisesArr = fs.readdir(pathdir,{encoding:'utf-8'});
promisesArr.then(file=>{     
    file.forEach( (element,index)=>{          
        let root = path.parse(element);
        if ( root.ext ){ 
            fs.open(path.join(pathdir,element),"r")
            .then(filehandle=>{ let size = 0;
                let stat = filehandle.stat().then( objStat =>{
                    size = objStat.size;
                    console.log("отработал промис вариант 2",`---${root.name}---${root.ext.slice(1)}---${objStat.size}`);
                });               
            });
        }
    });
}).catch(err=>console.log(err));


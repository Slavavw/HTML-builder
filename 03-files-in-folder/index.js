const {stdout,stdin,exit} = process;
const path = require('path');
let fs = require('fs'); fs = fs.promises;
const pathdir = path.join(__dirname,'secret-folder');
console.clear();
(async function(){
try {
  const files = await  fs.readdir(pathdir,{encoding:"utf-8",withFileTypes:true});
  for (const file of files) { 
    let symb = Object.getOwnPropertySymbols(file)[0];
    if (file[symb] === 1 ){        
        let set = await fs.stat(path.join(pathdir,file.name));        
        let root = path.parse(file.name);        
        console.log(`---${file.name}---${root.ext.slice(1)}---${set.size}b`);
    }    
  }
} catch (err) { console.error(err); }
})();


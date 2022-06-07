const {stdout,stdin,exit} = process;
const path = require('path');
let fs = require('fs'); fs = fs.promises;
const pathdir = path.join(__dirname,'secret-folder');
console.clear();

/*(async function(){
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
*/
const getExtension = (pathToFile)=>{ 
  return path.extname(pathToFile);
}
const getBaseName = (pathToFile,ext )=>{
  return path.basename(pathToFile,ext)
};
const getSize = (fileStats)=>{ return fileStats.size;}

const readDirectory = async ()=>{
  const pathToFolder = path.join(__dirname,"secret-folder");
  console.log(pathToFolder);
  try{
    const folderContent = await fs.readdir(pathToFolder);
    folderContent.forEach( async (item)=>{      
      const pathToFile = path.join(pathToFolder,item);
      const ext = path.extname(pathToFile);      
      const itemStats = await fs.stat(pathToFile);
      if ( itemStats.isFile()){
        const extention = getExtension(pathToFile);         
        const fileSize = getSize(itemStats);
        const basename = getBaseName(pathToFile,ext);        
        console.log(`${basename}--${extention.slice(1)}--${fileSize}b`)
      }
    })
    }      
    catch (err) {console.error(err);}
}


readDirectory();

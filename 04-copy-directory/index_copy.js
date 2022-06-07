
const str = require('stream');
const fs = require('fs'); 
const {readdir, access, mkdir} = fs.promises;
const {createReadStream,createWriteStream,constants} = require('fs');
const {join} = require('path');

const source = join(__dirname,'files');
const destination = join(__dirname,'files-copy');

const copyFolder = async (sourceFolder,destinationFolder)=>{
    const folderContent = await readdir(source);
    for (const item of folderContent ){        
    const sourcePath = join(sourceFolder,item);
    const destinationPath = join(destinationFolder,item);
        if (await access(destinationFolder, constants.R_OK | constants.W_OK)){
            const rs = createReadStream(sourcePath);
            const ws = createWriteStream(destinationPath);
            await str.promises.pipeline(rs,ws);
        }
        else {
            await mkdir(destinationFolder);
        }
    }
};

copyFolder(source,destination);


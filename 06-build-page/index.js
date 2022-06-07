///подключаю модули
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const PORT = 700;
const http = require('http');
const { resolve } = require('path');
const hostname = '127.0.0.1';
//////////////////////////////
const file_names = ['index.html','style.css'];
const {stdout} = process;
let html_data ='', css_data='';
let outputDir = path.join(__dirname,'project-dist');
let writeableStreamHTML,writeableStreamCSS;

const cb = (err)=>{ if(err) throw err};

start();

async function start(){ console.log('start');
    try{     
        await fs.exists(outputDir, async (exists) =>{
            if (!exists) 
                await fs.mkdir(outputDir,cb);                 
            else {
                await reamovecatalog(path.join(outputDir));
                ['template.html','style.css'].forEach( async el =>{
                    await fs.exists(path.join(outputDir,el), async exist =>{
                        if (exist) await fs.unlink(path.join(outputDir,el),err=>{
                            if (err) throw err
                            console.log("Удалил файл ",path.join(outputDir,el));
                        });
                    });                     
                    /*await fs.promises.rmdir(outputDir);
                    console.log(`delted каталог `,outputDir); */
                })                
            }
            await fs.exists(path.join(outputDir,'assets'), async exists =>{
                if (!exists) {                    
                    await fs.promises.mkdir(path.join(outputDir,'assets'));
                    console.log('создаю директорию',path.join(outputDir,'assets'));
                }
            });
            [writeableStreamHTML,writeableStreamCSS] = file_names.map(file=>{return fs.createWriteStream(path.join(outputDir,`${file}`),"utf-8");});            
            recursiveFunc(path.join(__dirname,'assets'),path.join(outputDir,'assets'));
        });        
    }
    catch (error) { console.log(error)};    
};

async function reamovecatalog(dir){
    try{     
        let files = await fs.promises.readdir(dir,{encoding:"utf-8",withFileTypes:true})        
        console.log(files.length);
        console.log(files);
        if (files.length){
            for await( let file of files){
                let newdir = path.join(dir,file.name);            
                if (file.isFile()) {
                    console.log(`deleted file `,newdir);
                    fs.promises.unlink(newdir);
                }
                else  await reamovecatalog(newdir);
            }
            await fs.promises.rmdir(dir);
            console.log(`delted каталог `,dir);         
        }
        else {
            await fs.promises.rmdir(dir);
            console.log(`delted каталог `,dir);
        }
    }
    catch (error) {console.log(error)}
}    

let iter = 0;
async function recursiveFunc(mainCatalog,createCatalog){  
    try{   
        let files = await fs.promises.readdir(mainCatalog,{encoding:"utf-8",withFileTypes:true});
        console.log(++iter);
        for ( let file of files){        
            let symb = Object.getOwnPropertySymbols(file)[0];
            if (file[symb] === 2){
                let newCreatedir = path.join(createCatalog,file.name), newMainDir = path.join(mainCatalog,file.name);
                console.log('********создаю каталог*****',`${newCreatedir}`);                
                fs.promises.mkdir(newCreatedir);
                console.log('********создал каталог*****',`${newCreatedir}`)                
                await recursiveFunc(newMainDir,newCreatedir); 
            }
            else{
                console.log(++iter);
                console.log(`========== file записать ${file.name}`);
                let readstream = fs.createReadStream(path.join(mainCatalog,file.name)); 
                let writestream = fs.createWriteStream(path.join(createCatalog,file.name),'utf8');
                let stat = await fs.promises.stat(path.join(mainCatalog,file.name));                
                console.log(`++++++++++++size of file is ${file.name}======${stat.size}++++++++++`);
                let dataView = new DataView( new ArrayBuffer(stat.size)); let byteOffset =0;                
                readstream.on("data",chunk =>{
                    console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
                    console.log(`=====запись куска размером ${chunk.BYTES_PER_ELEMENT}=====${chunk.byteLength}`);                                        
                    let dataView1 = new DataView(chunk.buffer);                     
                    for ( let i =0; i<chunk.length;i+=chunk.BYTES_PER_ELEMENT){
                        dataView.setUint8(i+byteOffset,dataView1.getUint8(i));
                    }                   
                    byteOffset+=chunk.length;
                    console.log(dataView1.getUint8(0),dataView1.getUint8(1));
                    console.log(dataView.getUint8(0),dataView.getUint8(1));                    
                   fs.appendFile(path.join(createCatalog,file.name),chunk,cb);
                });                
            }
        }
    }
    catch (err) {console.log(err)}   
}
//****************start****************************/ 
//читем куски из файлов и формируем css_data и html_data
let countprocessHTML = 1000, countprocessCSS = 1000;

function createHTMLFile( path_dir, type){
    fs.readdir(path_dir,{encoding:"utf-8"},(err,files)=>{ 
        if (err) throw err;
        if (files.length) {
            if ( type ==='html'){countprocessHTML = files.length; console.log(countprocessHTML); }
            else { countprocessCSS = files.length; console.log(countprocessCSS);}
            let ar = Array.from(files.join(' ').matchAll(/(?<change>\S+)\.\S+/ig)).map( el=>[el[0],el.groups.change]);
            ar.forEach( el=>{ let replaseString ='';
                const readableStream = fs.createReadStream(path.join(path_dir,el[0]),"utf-8");
                readableStream.on("data", chunk=>{replaseString+=chunk});
                readableStream.on("end",()=>{
                    if ( /(\.html)$/i.test(el[0])) {html_data= html_data.replace(`{{${el[1]}}}`,replaseString); countprocessHTML--;}
                    else {css_data+=replaseString; countprocessCSS--;}
                })
            });            
        }
    })
}

//стрим чтения template.html
const readableStream = fs.createReadStream(path.join(__dirname,'template.html'),'utf-8');
readableStream.on("data", chunk=>{html_data +=chunk.toString();});
//при окончании чтения template.html обработчик запуска записи в файл 1)components.html 2)style.css 
readableStream.on("end",()=>{
    [[path.join(__dirname, 'components'),'html'],[path.join(__dirname, 'styles'),'css']] .forEach( el =>{
        createHTMLFile(el[0],el[1]);
    });
})

//********************start*******************/
//создаем пользовательский обработчик событий writeHTML, (once - отработает только один раз, вместо on)
//будет отправлен запрос на выполнение (запись в файл index.html) как только завершится процесс чтения html файлов в папке components
const Myevents = new EventEmitter();
Myevents.once("writeHTML",()=>{    
    writeableStreamHTML.write(html_data);    
});

let intervalHTML = setInterval( ( )=>{ 
    if (!countprocessHTML) {
        Myevents.emit("writeHTML"); 
        clearInterval(intervalHTML);
    }},1000);

//создаем пользовательский обработчик событий writeCSS, для формирования style.css
Myevents.once('writeCSS',()=>{    
    writeableStreamCSS.write(css_data);    
})
    
let intervalCSS = setInterval( ( )=>{ 
    if (!countprocessCSS) {
        Myevents.emit("writeCSS"); 
        clearInterval(intervalCSS);
}},1000);    
    
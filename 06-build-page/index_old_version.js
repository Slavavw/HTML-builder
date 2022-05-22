///подключаю модули
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const PORT = 700;
const http = require('http');
const { resolve } = require('path');
const { argv } = require('process');
const { callbackify } = require('util');
const hostname = '127.0.0.1';
//////////////////////////////
const file_names = ['index.html','style.css'];
const {stdout} = process;
const { readdir } = fs.promises;
let html_data ='', css_data='';
let outputDir = path.join(__dirname,'project-dist');

let [writeableStreamHTML,writeableStreamCSS] = (function(){      
    if (!fs.existsSync(outputDir)){ 
        fs.mkdir(outputDir,(err)=>{if (err) throw err;});         
    }        
    else {  
        reamovecatalog(path.join(outputDir));
        ['template.html','style.css'].forEach( el =>{
            if ( fs.existsSync(path.join(outputDir,el))){
                fs.unlink(path.join(outputDir,el),err=>{if (err) throw err});
            }
        })
    }
    if (!fs.existsSync(path.join(outputDir,'assets'))){        
        fs.mkdir(path.join(outputDir,'assets'),(err)=>{if (err) throw err;}); 
    }     
    return file_names.map( file =>{ return fs.createWriteStream(path.join(outputDir,`${file}`),"utf-8");}); 
})();

function reamovecatalog(dir){     
    fs.readdir(dir,{encoding:"utf-8",withFileTypes:true},(err,files)=>{
        if (err)  throw Error(err);
        if (!files.length) { console.log(`delted каталог `,dir); fs.rmdir(dir,err=>{if(err) throw err});}
        else{
            for (const  file of files){            
                let symb = Object.getOwnPropertySymbols(file).shift();
                let newdir = path.join(dir,file.name);                
                if (file[symb] ===2) reamovecatalog(newdir);            
                else {  console.log(`deleted file `,newdir);
                    fs.unlink(newdir, err=>{if (err) throw err});
                }
            }
        }})
}    

/*
async function callbackF(resolve,files,dir) {    
    if (!files.length) { console.log(`delted каталог `,dir); return resolve(fs.rmdir(dir,err=>{if(err) throw err}));}
    else {
        for (const  file of files){            
            let symb = Object.getOwnPropertySymbols(file).shift();
            let newdir = path.join(dir,file.name);                
            if (file[symb] ===2) await reamovecatalog(newdir);
            else{
                console.log(`deleted file `,newdir);                   
                fs.unlink(newdir, err=>{if (err) throw err});
            }
        }
        return resolve();
    }
}

async function reamovecatalog(dir){     
        return Promise.resolve( readdir(dir,{encoding:"utf-8",withFileTypes:true})).
        then( files =>{ 
            return new Promise( callbackF(resolve,files,dir));
        })
    }
*/

let read = false;

async function recursiveFunc(mainCatalog,createCatalog){
    let files = await readdir(mainCatalog,{encoding:"utf-8",withFileTypes:true});
    for ( let file of files){        
        let symb = Object.getOwnPropertySymbols(file)[0];
        if (file[symb] === 2){
            let newCreatedir = path.join(createCatalog,file.name), newMainDir = path.join(mainCatalog,file.name);
            fs.mkdir(newCreatedir,(err)=>{if(err) throw err});
             recursiveFunc(newMainDir,newCreatedir);            
        }
        else{
            let readstream = fs.createReadStream(path.join(mainCatalog,file.name),"utf-8");
            let writestream = fs.createWriteStream(path.join(createCatalog,file.name),"utf-8");
            console.log(file.name);            
            fs.stat(path.join(mainCatalog,file.name),(err,stats)=>{
                if (err) throw err;                    
                console.log(file.name,stats.size);
                let arrBuffer = new Uint8Array(new ArrayBuffer(stats.size));
                let dataView = new DataView(arrBuffer.buffer);
                let start = 0;
                readstream.on("data",(chunk)=>{
                    //console.log(chunk);
                    console.log(`******${file.name}***size chunk ${chunk.length}**********************`);
                  //  console.log(chunk);
                    //dataView.setInt8(start,Buffer); start+=chunk.length;
                  /*  if(!read)  {
                        stdout._write(chunk,"utf-8", err=> {if(err) throw err});
                        read = true;
                        stdout._write(dataView,"utf-8", err=> {if(err) throw err});
                    }*/
                    writestream.write(chunk,(err)=>{if(err) throw err});
                });
                readstream.on ("end",()=>{  
                    if ( /footer.jpg/i.test(writestream.path)){
                        console.log(`======размер футера=====${dataView.byteLength}======`);
                        console.log(`======${dataView}======`);
                    }
                    console.log(writestream.path);
                    //writestream.write(Buffer,(err)=>{(if)throw err});
                    //writestream.write(dataView.buffer);
                })                
                
            })
        }
         
    }
}     /*    else{                
                readstream.pipe(writestream);
                console.log('каталог файл для записи',path.join(mainCatalog,file.name));
                console.log('каталог куда записывать файл',path.join(createCatalog,file.name));            
            }*/
     
recursiveFunc(path.join(__dirname,'assets'),path.join(outputDir,'assets'));

//****************start****************************/ 
//читем куски из файлов формируем и формируем css_data и html_data
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

const readableStream = fs.createReadStream(path.join(__dirname,'template.html'),'utf-8');
readableStream.on("data", chunk=>{html_data +=chunk.toString();});
readableStream.on("end",()=>{
    [[path.join(__dirname, 'components'),'html'],[path.join(__dirname, 'styles'),'css']] .forEach( el =>{
        createHTMLFile(el[0],el[1]);
    });
})

//********************end**********************/

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

///интервал опроса о завершении чтения html файлов в папке components
/*
function callback(...arg){
    while (process){
        let innterval = setTimeout() () (callback,1000,process,interval)
    }
    clearTimeout(arg[1]); resolve(nameevents);
}

function startWorkPromise( proces,nameevents ){
    return new Promise( (resolve,reject)=>{
        let intervalHTML = setTimeout( callback,1000,intervalHTML);
    })};

    startWorkPromise(countprocessHTML,'writeHTML').
    then( event=>{Myevents.emit(event); return startWorkPromise(countprocessCSS,'writeCSS')}).
    then( event=>{Myevents.emit(event);
        recursiveFunc(path.join(__dirname,'assets'),path.join(outputDir,'assets'));
     }).
     finally( ()=>{
        const requestHandler = (request, response) => {            
            response.end(html_data);
        };
        let server = http.createServer(requestHandler);
        server.listen(PORT,hostname,()=>{console.log(`Сервер запущен по адреcу: http://${hostname}:${PORT}`)})
     });
     */

    //создаем пользовательский обработчик событий writeCSS, для формирования style.css
Myevents.once('writeCSS',()=>{    
    writeableStreamCSS.write(css_data);    
})

let intervalCSS = setInterval( ( )=>{ 
    if (!countprocessCSS) {
        Myevents.emit("writeCSS"); 
        clearInterval(intervalCSS);
    }},1000);    
//********************end**********************/


/*    process.on("exit",(code)=>{
        console.log('Итоговый html текст:\n');
        console.log(html_data);
    })
  */  
    






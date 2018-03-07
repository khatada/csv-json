const csv = require("csv");
const chardet = require("chardet");
import fs = require("fs");
import path = require("path");
import iconv = require("iconv-lite");

function parseValue(value: string): string | number{
    const n = Number(value);
    if(isNaN(n)){
        return value;
    }else{
        return n;
    }
}

function csvToJSON(input: string, output: string): void{
    fs.readFile(input, (error, buffer)=>{
        if(error){
            console.error("Cannot read file");
            console.error(error);
        }else{
            const encoding = chardet.detect(buffer);
            const text = iconv.decode(buffer, "SHIFT_JIS");
            csv.parse(text, (error, data: string[][])=>{
                if(error){
                    console.error("Cannot parse CSV");
                    console.error(error);
                }else{
                    const header = data[0];
                    const json: any[] = [];
                    for(let i=1; i<data.length; i++){
                        const row = data[i];
                        const element = {};
                        header.forEach((key, index)=>{
                            element[key] = parseValue(row[index]);
                        });
                        json.push(element);
                    }
                    console.log(json);
                    fs.writeFile(output, JSON.stringify(json, null, 4), (error)=>{
                        if(error){
                            console.error("Cannot write file");
                            console.error(error);
                        }else{
                            console.log("Successfully write to " + output);
                        }
                    })
                }
            });
        }
    });
}

function jsonToCSV(input: string, output: string): void{
    fs.readFile(input, (error, buffer)=>{
        if(error){
            console.error("Cannot read file");
            console.error(error);
        }else{
            const encoding = chardet.detect(buffer);
            const text = iconv.decode(buffer, encoding);
            try{
                const json: any[] = JSON.parse(text);
                const header: string[] = [];
                json.forEach((element)=>{
                    Object.keys(element).forEach((key) => {
                        if(header.indexOf(key) < 0){
                            header.push(key);
                        }
                    })
                });
                const list = json.map((element)=>{
                    const row = header.map((key) => {
                        return element[key];
                    });
                    return row;
                });
                list.unshift(header);
                csv.stringify(list, (error, data: string) => {
                    if(error){
                        console.error("Cannot convert CSV");
                        console.error(error);
                    }else{
                        const buffer = iconv.encode(data.replace(/\n/g, "\r\n"), "SHIFT_JIS");
                        fs.writeFile(output, buffer, (error)=>{
                            if(error){
                                console.error("Cannot write file");
                                console.error(error);
                            }else{
                                console.log("Successfully write to " + output);
                            }
                        });
                    }
                });
            }catch(error){
                console.error("Cannot parse JSON");
                console.error(error);
            }
        }
    });
}

const input = process.argv[2];
const output = process.argv[3];

if(input){
    const ext = path.extname(input);
    if(ext && ext.length){
        const withoutExt =input.substring(0, input.length - ext.length);
        if(ext === ".json"){
            if(output){
                jsonToCSV(input, output);
            }else{
                const output = withoutExt + ".csv";
                jsonToCSV(input, output);
            }
        }else if(ext === ".csv"){
            if(output){
                csvToJSON(input, output);
            }else{
                const output = withoutExt + ".json";
                csvToJSON(input, output);
            }
        }else{
            console.log("The file is not supported. " + input);
        }
    }else{
        console.log("The file is not supported. " + input);
    }
}



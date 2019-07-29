import * as mongoose from 'mongoose';
import {Mongoose} from 'mongoose';
import { stringify } from 'querystring';

export class Database{
    private db : Mongoose=mongoose; // mongoose in a instance opf class mongoose

    constructor(
        private uri :string,
        private user? : string,
        private pass?:string)
    {}

    connect(){
        console.log('connecting to database ' + this.uri);
        return this.db
                   .connect(this.uri,{useNewUrlParser:true,user:this.user,pass:this.pass})
                    .then(mongooseConnected =>{
                        console.log('Databse connecting to ' + this.uri);
                        return mongooseConnected
                    })
    
    }

    disconnect(){
        return this.db.disconnect();
    }
    

}